package middleware

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"algo-debugger-backend/config"
	"algo-debugger-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const UserContextKey = "user"

// jwksCache caches the public keys from FusionAuth to avoid fetching on every request.
type jwksCache struct {
	mu      sync.RWMutex
	keys    map[string]interface{} // kid -> public key
	fetched time.Time
	ttl     time.Duration
}

var cache = &jwksCache{
	keys: make(map[string]interface{}),
	ttl:  15 * time.Minute,
}

// RequireAuth validates the FusionAuth JWT from the Authorization header or access_token cookie.
// On success it sets the User in the Gin context.
func RequireAuth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := extractToken(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing or malformed token"})
			return
		}

		claims, err := validateToken(token, cfg)
		if err != nil {
			// Decode without verification to log actual claims for debugging
			if raw, _, pErr := jwt.NewParser().ParseUnverified(token, jwt.MapClaims{}); pErr == nil {
				if rc, ok := raw.Claims.(jwt.MapClaims); ok {
					log.Printf("[auth] token claims (unverified) — iss=%v aud=%v", rc["iss"], rc["aud"])
				}
			}
			log.Printf("[auth] JWT validation failed: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token: " + err.Error()})
			return
		}

		user := claimsToUser(claims)
		c.Set(UserContextKey, user)
		c.Next()
	}
}

// GetUser retrieves the authenticated user from the context (set by RequireAuth).
func GetUser(c *gin.Context) *models.User {
	if u, exists := c.Get(UserContextKey); exists {
		if user, ok := u.(*models.User); ok {
			return user
		}
	}
	return nil
}

// extractToken pulls the JWT from "Authorization: Bearer <token>" or "access_token" cookie.
func extractToken(c *gin.Context) (string, error) {
	auth := c.GetHeader("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		return strings.TrimPrefix(auth, "Bearer "), nil
	}

	cookie, err := c.Cookie("access_token")
	if err == nil && cookie != "" {
		return cookie, nil
	}

	return "", fmt.Errorf("no token found")
}

// validateToken parses and validates the JWT using FusionAuth's JWKS.
func validateToken(tokenStr string, cfg *config.Config) (jwt.MapClaims, error) {
	parser := jwt.NewParser(
		jwt.WithIssuer(cfg.JWTIssuer),
		jwt.WithAudience(cfg.ClientID), // FusionAuth sets aud = clientId
		jwt.WithExpirationRequired(),
	)

	token, err := parser.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		// FusionAuth uses RS256 by default
		if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}

		kid, _ := t.Header["kid"].(string)
		return fetchPublicKey(cfg.JWKSURL(), kid)
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid claims")
	}
	return claims, nil
}

// fetchPublicKey retrieves (and caches) the RSA public key matching the given kid.
func fetchPublicKey(jwksURL, kid string) (interface{}, error) {
	cache.mu.RLock()
	if time.Since(cache.fetched) < cache.ttl {
		if key, ok := cache.keys[kid]; ok {
			cache.mu.RUnlock()
			return key, nil
		}
	}
	cache.mu.RUnlock()

	// Re-fetch JWKS
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, jwksURL, nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	var jwks struct {
		Keys []json.RawMessage `json:"keys"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return nil, fmt.Errorf("failed to decode JWKS: %w", err)
	}

	cache.mu.Lock()
	defer cache.mu.Unlock()

	for _, rawKey := range jwks.Keys {
		parsedKey, err := parseJWK(rawKey)
		if err != nil {
			continue
		}
		var header struct {
			Kid string `json:"kid"`
		}
		if err := json.Unmarshal(rawKey, &header); err != nil {
			continue
		}
		cache.keys[header.Kid] = parsedKey
	}
	cache.fetched = time.Now()

	if key, ok := cache.keys[kid]; ok {
		return key, nil
	}
	return nil, fmt.Errorf("key with kid %q not found in JWKS", kid)
}

// parseJWK parses an RSA JWK (n, e fields) into an *rsa.PublicKey.
func parseJWK(raw json.RawMessage) (interface{}, error) {
	var jwk struct {
		Kty string `json:"kty"`
		N   string `json:"n"`
		E   string `json:"e"`
	}
	if err := json.Unmarshal(raw, &jwk); err != nil {
		return nil, err
	}
	if jwk.Kty != "RSA" {
		return nil, fmt.Errorf("unsupported key type: %s", jwk.Kty)
	}

	nBytes, err := base64.RawURLEncoding.DecodeString(jwk.N)
	if err != nil {
		return nil, fmt.Errorf("invalid modulus: %w", err)
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(jwk.E)
	if err != nil {
		return nil, fmt.Errorf("invalid exponent: %w", err)
	}

	n := new(big.Int).SetBytes(nBytes)
	e := new(big.Int).SetBytes(eBytes)

	return &rsa.PublicKey{N: n, E: int(e.Int64())}, nil
}

// claimsToUser maps JWT claims to a User model.
// FusionAuth JWT structure: sub=userId, email, given_name, family_name, roles
func claimsToUser(claims jwt.MapClaims) *models.User {
	user := &models.User{}

	if sub, ok := claims["sub"].(string); ok {
		user.ID = sub
	}
	if email, ok := claims["email"].(string); ok {
		user.Email = email
	}
	if fn, ok := claims["given_name"].(string); ok {
		user.FirstName = fn
	}
	if ln, ok := claims["family_name"].(string); ok {
		user.LastName = ln
	}

	// FusionAuth puts roles in "roles" array inside the application registration
	if rolesRaw, ok := claims["roles"]; ok {
		if rolesSlice, ok := rolesRaw.([]interface{}); ok {
			for _, r := range rolesSlice {
				if role, ok := r.(string); ok {
					user.Roles = append(user.Roles, role)
				}
			}
		}
	}

	return user
}
