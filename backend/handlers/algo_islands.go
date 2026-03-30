package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type IslandsRequest struct {
	Grid [][]string `json:"grid" binding:"required"`
}

func IslandsSteps(c *gin.Context) {
	var req IslandsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Grid) == 0 || len(req.Grid) > 32 || len(req.Grid[0]) > 32 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "grid must be 1–32 rows and columns"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildIslandsSteps(req.Grid)})
}

func buildIslandsSteps(rawGrid [][]string) []gin.H {
	steps := []gin.H{}
	rows := len(rawGrid)
	cols := len(rawGrid[0])

	// Working copy
	grid := make([][]string, rows)
	for r := range rawGrid {
		grid[r] = make([]string, cols)
		copy(grid[r], rawGrid[r])
	}

	islandMap := make([][]int, rows)
	for r := range islandMap {
		islandMap[r] = make([]int, cols)
	}

	count := 0
	scanR, scanC := 0, 0

	snap := func(phase, line string, r, c interface{}, msg, detail string) gin.H {
		gCopy := make([][]string, rows)
		for i := range grid {
			gCopy[i] = make([]string, cols)
			copy(gCopy[i], grid[i])
		}
		imCopy := make([][]int, rows)
		for i := range islandMap {
			imCopy[i] = make([]int, cols)
			copy(imCopy[i], islandMap[i])
		}
		icon := "map-point-bold"
		switch phase {
		case "new_island":
			icon = "add-circle-bold"
		case "dfs_sink":
			icon = "water-bold"
		case "done":
			icon = "flag-bold"
		}
		return gin.H{
			"phase": phase, "line": line,
			"grid": gCopy, "islandMap": imCopy,
			"scanR": scanR, "scanC": scanC,
			"activeR": r, "activeC": c,
			"count": count,
			"icon": icon, "msg": msg, "detail": detail,
			"result": nil,
		}
	}

	steps = append(steps, snap("scan", "scan", nil, nil,
		fmt.Sprintf("Start scanning %d×%d grid for land cells ('1')", rows, cols),
		"count = 0"))

	type coord struct{ r, c int }

	dfsStack := func(startR, startC, islandIdx int) {
		stack := []coord{{startR, startC}}
		for len(stack) > 0 {
			top := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			r, c := top.r, top.c

			if r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == "0" {
				steps = append(steps, snap("dfs_base", "dfs_base", r, c,
					fmt.Sprintf("dfs(%d,%d): out-of-bounds or water → return", r, c),
					"base case hit"))
				continue
			}
			steps = append(steps, snap("dfs_enter", "dfs_enter", r, c,
				fmt.Sprintf("dfs(%d,%d): grid='%s' → valid land, sink it", r, c, grid[r][c]),
				fmt.Sprintf("island #%d", islandIdx)))

			grid[r][c] = "0"
			islandMap[r][c] = islandIdx

			steps = append(steps, snap("dfs_sink", "dfs_sink", r, c,
				fmt.Sprintf("Sink (%d,%d) → '0', marked as island #%d", r, c, islandIdx),
				"Explore 4 neighbors next"))

			stack = append(stack, coord{r, c + 1}, coord{r, c - 1}, coord{r + 1, c}, coord{r - 1, c})
		}
	}

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			scanR, scanC = r, c
			if grid[r][c] == "1" {
				count++
				steps = append(steps, snap("new_island", "new_island", r, c,
					fmt.Sprintf("Found land at (%d,%d)! → count=%d, start DFS", r, c, count),
					fmt.Sprintf("grid[%d][%d] = '1'", r, c)))
				dfsStack(r, c, count)
			}
		}
	}

	done := snap("done", "done", nil, nil,
		fmt.Sprintf("Done! %d island(s) found", count),
		fmt.Sprintf("return %d", count))
	done["result"] = count
	steps = append(steps, done)
	return steps
}
