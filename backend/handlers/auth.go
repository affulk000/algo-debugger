package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"time"

	"algo-debugger-backend/config"
	"algo-debugger-backend/middleware"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

type AuthHandler struct {
	cfg         *config.Config
	oauthConfig *oauth2.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	oauthCfg := &oauth2.Config{
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		RedirectURL:  cfg.RedirectURL,
		Scopes:       []string{"openid", "email", "profile", "offline_access"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  cfg.AuthorizationURL(),
			TokenURL: cfg.TokenURL(),
		},
	}
	return &AuthHandler{cfg: cfg, oauthConfig: oauthCfg}
}

// Login redirects the user to FusionAuth's authorization endpoint.
// GET /auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	state := generateState()

	// Store state in a short-lived cookie for CSRF protection
	c.SetCookie("oauth_state", state, 300, "/", "", false, true)

	url := h.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	c.Redirect(http.StatusFound, url)
}

// Callback handles the redirect back from FusionAuth after user login.
// GET /auth/callback
func (h *AuthHandler) Callback(c *gin.Context) {
	// Validate state (CSRF protection)
	storedState, err := c.Cookie("oauth_state")
	if err != nil || storedState != c.Query("state") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid state parameter"})
		return
	}
	c.SetCookie("oauth_state", "", -1, "/", "", false, true) // clear state cookie

	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing code parameter"})
		return
	}

	// Exchange authorization code for tokens
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	token, err := h.oauthConfig.Exchange(ctx, code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to exchange code: " + err.Error()})
		return
	}

	accessToken, ok := token.Extra("access_token").(string)
	if !ok || accessToken == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no access token in response"})
		return
	}

	// Store access token in HTTP-only cookie (BFF pattern — token never exposed to JS)
	maxAge := int(time.Until(token.Expiry).Seconds())
	if maxAge <= 0 {
		maxAge = 3600 // default 1hr if expiry not set
	}
	c.SetCookie("access_token", accessToken, maxAge, "/", "", false, true)

	// Store refresh token in HTTP-only cookie
	if token.RefreshToken != "" {
		c.SetCookie("refresh_token", token.RefreshToken, 60*60*24*30, "/auth/refresh", "", false, true)
	}

	// Redirect back to the frontend
	c.Redirect(http.StatusFound, h.cfg.FrontendURL)
}

// Logout clears cookies and optionally redirects to FusionAuth's logout endpoint.
// GET /auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/auth/refresh", "", false, true)

	// Redirect to FusionAuth's logout so SSO session is also terminated
	logoutURL := h.cfg.LogoutURL() + "?client_id=" + h.cfg.ClientID + "&post_logout_redirect_uri=" + h.cfg.FrontendURL
	c.Redirect(http.StatusFound, logoutURL)
}

// Refresh exchanges a refresh token for a new access token.
// POST /auth/refresh
func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "no refresh token"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	tokenSource := h.oauthConfig.TokenSource(ctx, &oauth2.Token{RefreshToken: refreshToken})
	newToken, err := tokenSource.Token()
	if err != nil {
		c.SetCookie("access_token", "", -1, "/", "", false, true)
		c.SetCookie("refresh_token", "", -1, "/auth/refresh", "", false, true)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh failed, please login again"})
		return
	}

	maxAge := int(time.Until(newToken.Expiry).Seconds())
	if maxAge <= 0 {
		maxAge = 3600
	}
	c.SetCookie("access_token", newToken.AccessToken, maxAge, "/", "", false, true)
	if newToken.RefreshToken != "" {
		c.SetCookie("refresh_token", newToken.RefreshToken, 60*60*24*30, "/auth/refresh", "", false, true)
	}

	c.JSON(http.StatusOK, gin.H{"message": "token refreshed"})
}

// Me returns the currently authenticated user's profile.
// GET /auth/me  (protected)
func (h *AuthHandler) Me(c *gin.Context) {
	user := middleware.GetUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func generateState() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}
