package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type MazeRequest struct {
	Maze [][]int `json:"maze" binding:"required"`
}

func MazeSteps(c *gin.Context) {
	var req MazeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Maze) == 0 || len(req.Maze) > 32 || len(req.Maze[0]) > 32 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "maze must be 1–32 rows and columns"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildMazeSteps(req.Maze)})
}

var mazeDirs = [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
var mazeDirNames = []string{"↓ south", "↑ north", "→ east", "← west"}

func buildMazeSteps(maze [][]int) []gin.H {
	steps := []gin.H{}
	m := len(maze)
	n := len(maze[0])

	if maze[0][0] == 0 || maze[m-1][n-1] == 0 {
		steps = append(steps, gin.H{
			"phase": "done_fail", "line": "done_fail",
			"queue": []gin.H{}, "visited": make2DBool(m, n), "cur": nil, "nx": nil, "ny": nil, "path": [][]int{},
			"icon": "close-circle-bold",
			"msg":    "Start or end is a wall — return -1",
			"detail": "maze[0][0] or maze[m-1][n-1] == 0",
			"result": -1,
		})
		return steps
	}

	visited := make([][]bool, m)
	for i := range visited {
		visited[i] = make([]bool, n)
	}

	type cell struct{ x, y, dist int }
	parent := map[string][2]int{}
	key := func(x, y int) string { return fmt.Sprintf("%d,%d", x, y) }

	queue := []cell{{0, 0, 1}}
	visited[0][0] = true

	snapVisited := func() [][]bool {
		cp := make([][]bool, m)
		for i := range visited {
			cp[i] = make([]bool, n)
			copy(cp[i], visited[i])
		}
		return cp
	}
	snapQueue := func() []gin.H {
		s := make([]gin.H, len(queue))
		for i, c := range queue {
			s[i] = gin.H{"x": c.x, "y": c.y, "dist": c.dist}
		}
		return s
	}

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"queue": snapQueue(), "visited": snapVisited(), "cur": nil, "nx": nil, "ny": nil, "path": [][]int{},
		"icon": "rocket-bold",
		"msg":    "Init: enqueue (0,0) dist=1, mark visited",
		"detail": fmt.Sprintf("Grid %d×%d, start=(0,0), goal=(%d,%d)", m, n, m-1, n-1),
		"result": nil,
	})

	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]
		x, y, dist := cur.x, cur.y, cur.dist

		steps = append(steps, gin.H{
			"phase": "dequeue", "line": "dequeue",
			"queue": snapQueue(), "visited": snapVisited(),
			"cur": gin.H{"x": x, "y": y, "dist": dist}, "nx": nil, "ny": nil, "path": [][]int{},
			"icon": "inbox-bold",
			"msg":    fmt.Sprintf("Dequeue (%d,%d) dist=%d  |queue|=%d", x, y, dist, len(queue)),
			"detail": fmt.Sprintf("Processing cell at row=%d col=%d", x, y),
			"result": nil,
		})

		if x == m-1 && y == n-1 {
			// Reconstruct path
			path := [][2]int{{x, y}}
			cx, cy := x, y
			for !(cx == 0 && cy == 0) {
				p := parent[key(cx, cy)]
				cx, cy = p[0], p[1]
				path = append(path, [2]int{cx, cy})
			}
			// Reverse
			for lo, hi := 0, len(path)-1; lo < hi; lo, hi = lo+1, hi-1 {
				path[lo], path[hi] = path[hi], path[lo]
			}
			pathH := make([][]int, len(path))
			for i, p := range path {
				pathH[i] = []int{p[0], p[1]}
			}
			done := gin.H{
				"phase": "done_found", "line": "done_found",
				"queue": snapQueue(), "visited": snapVisited(),
				"cur": gin.H{"x": x, "y": y, "dist": dist}, "nx": nil, "ny": nil, "path": pathH,
				"icon": "crown-bold",
				"msg":    fmt.Sprintf("Goal! (%d,%d) reached in %d steps", x, y, dist),
				"detail": fmt.Sprintf("Shortest path length = %d", dist),
				"result": dist,
			}
			steps = append(steps, done)
			return steps
		}

		for di, d := range mazeDirs {
			nx, ny := x+d[0], y+d[1]
			if nx < 0 || ny < 0 || nx >= m || ny >= n {
				steps = append(steps, gin.H{
					"phase": "out_of_bounds", "line": "check_neighbor",
					"queue": snapQueue(), "visited": snapVisited(),
					"cur": gin.H{"x": x, "y": y, "dist": dist}, "nx": nx, "ny": ny, "path": [][]int{},
					"icon": "forbidden-circle-bold",
					"msg":    fmt.Sprintf("(%d,%d) %s → out of bounds", nx, ny, mazeDirNames[di]),
					"detail": "skip",
					"result": nil,
				})
				continue
			}
			if maze[nx][ny] == 0 {
				steps = append(steps, gin.H{
					"phase": "wall", "line": "check_neighbor",
					"queue": snapQueue(), "visited": snapVisited(),
					"cur": gin.H{"x": x, "y": y, "dist": dist}, "nx": nx, "ny": ny, "path": [][]int{},
					"icon": "close-circle-bold",
					"msg":    fmt.Sprintf("(%d,%d) %s → wall", nx, ny, mazeDirNames[di]),
					"detail": "maze[nx][ny] == 0",
					"result": nil,
				})
				continue
			}
			if visited[nx][ny] {
				steps = append(steps, gin.H{
					"phase": "visited", "line": "check_neighbor",
					"queue": snapQueue(), "visited": snapVisited(),
					"cur": gin.H{"x": x, "y": y, "dist": dist}, "nx": nx, "ny": ny, "path": [][]int{},
					"icon": "close-circle-bold",
					"msg":    fmt.Sprintf("(%d,%d) %s → already visited", nx, ny, mazeDirNames[di]),
					"detail": "skip",
					"result": nil,
				})
				continue
			}

			visited[nx][ny] = true
			parent[key(nx, ny)] = [2]int{x, y}
			queue = append(queue, cell{nx, ny, dist + 1})

			steps = append(steps, gin.H{
				"phase": "enqueue", "line": "enqueue",
				"queue": snapQueue(), "visited": snapVisited(),
				"cur": gin.H{"x": x, "y": y, "dist": dist}, "nx": nx, "ny": ny, "path": [][]int{},
				"icon": "add-circle-bold",
				"msg":    fmt.Sprintf("Enqueue (%d,%d) %s dist=%d", nx, ny, mazeDirNames[di], dist+1),
				"detail": fmt.Sprintf("queue size: %d", len(queue)),
				"result": nil,
			})
		}
	}

	steps = append(steps, gin.H{
		"phase": "done_fail", "line": "done_fail",
		"queue": []gin.H{}, "visited": snapVisited(), "cur": nil, "nx": nil, "ny": nil, "path": [][]int{},
		"icon": "close-circle-bold",
		"msg":    "Queue exhausted — no path to goal → return -1",
		"detail": "return -1",
		"result": -1,
	})
	return steps
}

func make2DBool(m, n int) [][]bool {
	g := make([][]bool, m)
	for i := range g {
		g[i] = make([]bool, n)
	}
	return g
}
