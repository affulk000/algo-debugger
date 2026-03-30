package main

import (
	"context"
	"log"
	"os"
	"time"

	"algo-debugger-backend/config"
	"algo-debugger-backend/db"
	"algo-debugger-backend/handlers"
	"algo-debugger-backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		log.Printf("warning: could not load .env file: %v", err)
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.DebugMode)
	}

	// ── Database ─────────────────────────────────────────────────
	pool, err := db.Connect(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database error: %v", err)
	}
	defer pool.Close()
	log.Println("database connected")

	// ── HTTP server ───────────────────────────────────────────────
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.SetTrustedProxies(nil)

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	authHandler := handlers.NewAuthHandler(cfg)
	apiHandler := handlers.NewAPIHandler(pool)

	// ── Public routes ─────────────────────────────────────────────
	r.GET("/health", handlers.Health)

	// ── Algorithm step endpoints ───────────────────────────────────
	algo := r.Group("/algorithms")
	{
		algo.GET("/:name/meta", handlers.AlgoMetaHandler)

		// Go algorithms
		algo.POST("/twosum/steps",       handlers.TwoSumSteps)
		algo.POST("/merge/steps",        handlers.MergeSteps)
		algo.POST("/substring/steps",    handlers.SubstringSteps)
		algo.POST("/container/steps",    handlers.ContainerSteps)
		algo.POST("/twosum2/steps",      handlers.TwoSum2Steps)
		algo.POST("/palindrome/steps",   handlers.PalindromeSteps)
		algo.POST("/simplify/steps",     handlers.SimplifySteps)
		algo.POST("/candy/steps",        handlers.CandySteps)
		algo.POST("/substring2/steps",   handlers.Substring2Steps)
		algo.POST("/maze/steps",         handlers.MazeSteps)
		algo.POST("/sudoku/steps",       handlers.SudokuSteps)
		algo.POST("/consecutive/steps",  handlers.ConsecutiveSteps)
		algo.POST("/reversewords/steps", handlers.ReverseWordsSteps)
		algo.POST("/arrows/steps",       handlers.ArrowsSteps)
		algo.POST("/wordsearch/steps",   handlers.WordSearchSteps)
		algo.POST("/linkedcycle/steps",  handlers.LinkedCycleSteps)
		algo.POST("/islands/steps",      handlers.IslandsSteps)
		algo.POST("/calculator/steps",   handlers.CalculatorSteps)
		algo.POST("/snakes/steps",       handlers.SnakesSteps)
		algo.POST("/lis/steps",          handlers.LISSteps)
		algo.POST("/maxprofit/steps",    handlers.MaxProfitSteps)
		// Rust algorithms (step logic mirrored in Go)
		algo.POST("/rustlet/steps",      handlers.RustLetSteps)
		algo.POST("/rustbubble/steps",   handlers.RustBubbleSteps)
	}

	auth := r.Group("/auth")
	{
		auth.GET("/login", authHandler.Login)
		auth.GET("/callback", authHandler.Callback)
		auth.GET("/logout", authHandler.Logout)
		auth.POST("/refresh", authHandler.Refresh)
		auth.GET("/me", middleware.RequireAuth(cfg), authHandler.Me)
	}

	// ── Protected API routes ──────────────────────────────────────
	api := r.Group("/api", middleware.RequireAuth(cfg))
	{
		api.GET("/runs", apiHandler.GetRuns)
		api.POST("/runs", apiHandler.SaveRun)
		api.DELETE("/runs/:id", apiHandler.DeleteRun)
	}

	addr := ":" + cfg.Port
	log.Printf("algo-debugger backend listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
