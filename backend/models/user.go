package models

// User represents the authenticated user info extracted from FusionAuth JWT.
type User struct {
	ID        string   `json:"id"`
	Email     string   `json:"email"`
	FirstName string   `json:"firstName"`
	LastName  string   `json:"lastName"`
	Roles     []string `json:"roles"`
}

// AlgoRun represents a saved algorithm execution record for a user.
type AlgoRun struct {
	ID        string `json:"id"`
	UserID    string `json:"userId"`
	Algorithm string `json:"algorithm"` // e.g. "twosum", "maze"
	Input     string `json:"input"`     // JSON-encoded input
	Steps     int    `json:"steps"`
	CreatedAt string `json:"createdAt"` // RFC3339
}

// SaveRunRequest is the request body for POST /api/runs.
type SaveRunRequest struct {
	Algorithm string `json:"algorithm" binding:"required"`
	Input     string `json:"input" binding:"required"`
	Steps     int    `json:"steps" binding:"required,min=1"`
}
