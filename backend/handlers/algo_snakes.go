package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SnakesRequest struct {
	Board [][]int `json:"board" binding:"required"`
}

func SnakesSteps(c *gin.Context) {
	var req SnakesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	n := len(req.Board)
	if n < 2 || n > 20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "board must be 2–20 rows"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildSnakesSteps(req.Board)})
}

// getCoords converts a 1-based cell label to board [row, col] using Boustrophedon order.
func getCoords(label, n int) (int, int) {
	r := (label - 1) / n
	c := (label - 1) % n
	actualRow := n - 1 - r
	var actualCol int
	if r%2 == 1 {
		actualCol = n - 1 - c
	} else {
		actualCol = c
	}
	return actualRow, actualCol
}

func buildSnakesSteps(board [][]int) []gin.H {
	steps := []gin.H{}
	n := len(board)
	target := n * n

	type qItem struct {
		label, moves int
	}

	queue := []qItem{{1, 0}}
	visited := map[int]bool{1: true}
	visitedList := []int{1}

	snap := func(phase, line string, label, moves int, next, dest, diceVal interface{}, msg, detail string) gin.H {
		qSnap := make([][]int, len(queue))
		for i, q := range queue {
			qSnap[i] = []int{q.label, q.moves}
		}
		vCopy := copyIntSlice(visitedList)
		return gin.H{
			"phase": phase, "line": line,
			"board": board, "n": n,
			"queue": qSnap, "visited": vCopy,
			"label": label, "moves": moves,
			"next": next, "dest": dest, "diceVal": diceVal,
			"icon": map[string]string{
				"goal":      "crown-bold",
				"teleport":  "transfer-vertical-bold",
				"enqueue":   "add-circle-bold",
				"done_fail": "close-circle-bold",
				"dequeue":   "arrow-right-bold",
			}[phase],
			"msg": msg, "detail": detail,
		}
	}
	if snap("", "", 0, 0, nil, nil, nil, "", "")["icon"] == nil {
	}

	steps = append(steps, snap("init", "init", 1, 0, nil, nil, nil,
		fmt.Sprintf("Init: start at cell 1, target = %d", target),
		fmt.Sprintf("queue = [[1, 0]],  visited = {1}")))

	safety := 0
	for len(queue) > 0 && safety < 5000 {
		safety++
		item := queue[0]
		queue = queue[1:]
		label, moves := item.label, item.moves

		qSnap := make([][]int, len(queue))
		for i, q := range queue {
			qSnap[i] = []int{q.label, q.moves}
		}

		steps = append(steps, gin.H{
			"phase": "dequeue", "line": "dequeue",
			"board": board, "n": n,
			"queue": qSnap, "visited": copyIntSlice(visitedList),
			"label": label, "moves": moves, "next": nil, "dest": nil, "diceVal": nil,
			"icon": "arrow-right-bold",
			"msg":    fmt.Sprintf("Dequeue cell %d  (moves = %d)", label, moves),
			"detail": fmt.Sprintf("%d items remaining in queue", len(queue)),
			"result": nil,
		})

		if label == target {
			done := gin.H{
				"phase": "done_found", "line": "done_found",
				"board": board, "n": n,
				"queue": qSnap, "visited": copyIntSlice(visitedList),
				"label": label, "moves": moves, "next": nil, "dest": nil, "diceVal": nil,
				"icon": "crown-bold",
				"msg":    fmt.Sprintf("Reached cell %d! Minimum moves = %d", target, moves),
				"detail": fmt.Sprintf("return %d", moves),
				"result": moves,
			}
			steps = append(steps, done)
			return steps
		}

		for die := 1; die <= 6; die++ {
			next := label + die
			if next > target {
				break
			}

			r, c := getCoords(next, n)
			boardVal := board[r][c]
			dest := next
			isTeleport := boardVal != -1
			if isTeleport {
				dest = boardVal
			}

			if visited[dest] {
				continue
			}

			phase := "enqueue"
			icon := "add-circle-bold"
			msg := fmt.Sprintf("Die=%d: next=%d → enqueue (moves=%d)", die, dest, moves+1)
			detail := fmt.Sprintf("cell %d  no snake/ladder", next)
			if isTeleport {
				phase = "teleport"
				icon = "transfer-vertical-bold"
				msg = fmt.Sprintf("Die=%d: land %d → teleport to %d → enqueue (moves=%d)", die, next, dest, moves+1)
				detail = fmt.Sprintf("board[%d][%d] = %d", r, c, boardVal)
			}

			visited[dest] = true
			visitedList = append(visitedList, dest)
			queue = append(queue, qItem{dest, moves + 1})

			qS := make([][]int, len(queue))
			for i, q := range queue {
				qS[i] = []int{q.label, q.moves}
			}

			steps = append(steps, gin.H{
				"phase": phase, "line": phase,
				"board": board, "n": n,
				"queue": qS, "visited": copyIntSlice(visitedList),
				"label": label, "moves": moves,
				"next": next, "dest": dest, "diceVal": die,
				"icon": icon, "msg": msg, "detail": detail,
			})
		}
	}

	steps = append(steps, gin.H{
		"phase": "done_fail", "line": "done_fail",
		"board": board, "n": n,
		"queue": [][]int{}, "visited": copyIntSlice(visitedList),
		"label": nil, "moves": nil, "next": nil, "dest": nil, "diceVal": nil,
		"icon": "close-circle-bold",
		"msg":    "Queue exhausted — no path found → return -1",
		"detail": "return -1",
		"result": -1,
	})
	return steps
}
