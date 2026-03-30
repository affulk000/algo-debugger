package config

import (
	"fmt"
	"os"
)

type Config struct {
	// Server
	Port string

	// FusionAuth
	FusionAuthURL    string // e.g. http://localhost:9011
	FusionAuthAPIKey string
	ClientID         string
	ClientSecret     string
	RedirectURL      string // e.g. http://localhost:8081/auth/callback

	// JWT
	JWTIssuer string // must match "issuer" in FusionAuth tenant settings

	// Session
	SessionSecret string

	// CORS
	FrontendURL string // e.g. http://localhost:5173

	// Database
	DatabaseURL string // Supabase / Postgres connection string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:             getEnv("PORT", "8080"),
		FusionAuthURL:    getEnv("FUSIONAUTH_URL", "http://localhost:9011"),
		FusionAuthAPIKey: os.Getenv("FUSIONAUTH_API_KEY"),
		ClientID:         os.Getenv("FUSIONAUTH_CLIENT_ID"),
		ClientSecret:     os.Getenv("FUSIONAUTH_CLIENT_SECRET"),
		RedirectURL:      getEnv("REDIRECT_URL", "http://localhost:8080/auth/callback"),
		JWTIssuer:        getEnv("JWT_ISSUER", getEnv("FUSIONAUTH_URL", "http://localhost:9011")),
		SessionSecret:    getEnv("SESSION_SECRET", "change-me-in-production"),
		FrontendURL:      getEnv("FRONTEND_URL", "http://localhost:5173"),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}
	return cfg, nil
}

func (c *Config) validate() error {
	if c.ClientID == "" {
		return fmt.Errorf("FUSIONAUTH_CLIENT_ID is required")
	}
	if c.ClientSecret == "" {
		return fmt.Errorf("FUSIONAUTH_CLIENT_SECRET is required")
	}
	return nil
}

// OIDC endpoints derived from FusionAuth base URL
func (c *Config) AuthorizationURL() string {
	return c.FusionAuthURL + "/oauth2/authorize"
}

func (c *Config) TokenURL() string {
	return c.FusionAuthURL + "/oauth2/token"
}

func (c *Config) JWKSURL() string {
	return c.FusionAuthURL + "/.well-known/jwks.json"
}

func (c *Config) UserinfoURL() string {
	return c.FusionAuthURL + "/oauth2/userinfo"
}

func (c *Config) LogoutURL() string {
	return c.FusionAuthURL + "/oauth2/logout"
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
