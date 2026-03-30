package handlers

import (
	"net/http"
	"time"

	"algo-debugger-backend/middleware"
	"algo-debugger-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type APIHandler struct {
	db *pgxpool.Pool
}

func NewAPIHandler(db *pgxpool.Pool) *APIHandler {
	return &APIHandler{db: db}
}

// GetRuns returns all saved algorithm runs for the authenticated user.
// GET /api/runs
func (h *APIHandler) GetRuns(c *gin.Context) {
	user := middleware.GetUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	rows, err := h.db.Query(c.Request.Context(), `
		SELECT id, user_id, algorithm, input, steps, created_at
		FROM algo_runs
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db query failed"})
		return
	}
	defer rows.Close()

	runs := []models.AlgoRun{}
	for rows.Next() {
		var r models.AlgoRun
		var createdAt time.Time
		if err := rows.Scan(&r.ID, &r.UserID, &r.Algorithm, &r.Input, &r.Steps, &createdAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db scan failed"})
			return
		}
		r.CreatedAt = createdAt.UTC().Format(time.RFC3339)
		runs = append(runs, r)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db rows error"})
		return
	}

	c.JSON(http.StatusOK, runs)
}

// SaveRun records an algorithm execution for the authenticated user.
// POST /api/runs
func (h *APIHandler) SaveRun(c *gin.Context) {
	user := middleware.GetUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var req models.SaveRunRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var run models.AlgoRun
	var createdAt time.Time

	err := h.db.QueryRow(c.Request.Context(), `
		INSERT INTO algo_runs (user_id, algorithm, input, steps)
		VALUES ($1, $2, $3, $4)
		RETURNING id, user_id, algorithm, input, steps, created_at
	`, user.ID, req.Algorithm, req.Input, req.Steps).
		Scan(&run.ID, &run.UserID, &run.Algorithm, &run.Input, &run.Steps, &createdAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed"})
		return
	}
	run.CreatedAt = createdAt.UTC().Format(time.RFC3339)

	c.JSON(http.StatusCreated, run)
}

// DeleteRun removes a saved run belonging to the authenticated user.
// DELETE /api/runs/:id
func (h *APIHandler) DeleteRun(c *gin.Context) {
	user := middleware.GetUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	runID := c.Param("id")

	tag, err := h.db.Exec(c.Request.Context(), `
		DELETE FROM algo_runs WHERE id = $1 AND user_id = $2
	`, runID, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db delete failed"})
		return
	}

	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "run not found"})
		return
	}

	c.Status(http.StatusNoContent)
}

// Health is an unauthenticated health check endpoint.
// GET /health
func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "algo-debugger-backend"})
}
