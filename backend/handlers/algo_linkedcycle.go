package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LinkedCycleRequest struct {
	NodeVals []int `json:"nodeVals" binding:"required"`
	CyclePos int   `json:"cyclePos"` // -1 = no cycle
}

func LinkedCycleSteps(c *gin.Context) {
	var req LinkedCycleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.NodeVals) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nodeVals must not be empty"})
		return
	}
	if len(req.NodeVals) > 64 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nodeVals too large (max 64)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildLinkedCycleSteps(req.NodeVals, req.CyclePos)})
}

func buildLinkedCycleSteps(nodeVals []int, cyclePos int) []gin.H {
	steps := []gin.H{}
	n := len(nodeVals)

	nextOf := func(i int) int {
		if i == n-1 {
			return cyclePos
		}
		return i + 1
	}

	if n == 0 {
		steps = append(steps, gin.H{
			"phase": "done_false", "line": "done_false",
			"slow": -1, "fast": -1, "visited": []int{}, "meet": -1,
			"icon": "flag-bold", "msg": "Empty list → false", "detail": "",
		})
		return steps
	}
	if n == 1 && cyclePos < 0 {
		steps = append(steps, gin.H{
			"phase": "done_false", "line": "done_false",
			"slow": 0, "fast": -1, "visited": []int{}, "meet": -1,
			"icon": "flag-bold", "msg": "Single node, no next → false", "detail": "head.Next == nil",
		})
		return steps
	}

	slow := 0
	fast := nextOf(0)

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"slow": slow, "fast": fast, "visited": []int{slow, fast}, "meet": -1,
		"icon": "rocket-bold",
		"msg":    fmt.Sprintf("Init: slow=node[%d](%d)  fast=node[%d](%d)", slow, nodeVals[slow], fast, nodeVals[fast]),
		"detail": `slow=head, fast=head.Next`,
		"result": nil,
	})

	safety := 0
	for fast != -1 && nextOf(fast) != -1 && safety < 200 {
		safety++
		visited := []int{slow}
		if fast >= 0 {
			visited = append(visited, fast)
		}

		steps = append(steps, gin.H{
			"phase": "loop_check", "line": "loop_check",
			"slow": slow, "fast": fast, "visited": visited, "meet": -1,
			"icon": "refresh-bold",
			"msg":    fmt.Sprintf("Loop: fast(%d)≠nil && fast.Next(%d)≠nil", fast, nextOf(fast)),
			"detail": `Condition holds — enter body`,
			"result": nil,
		})

		if slow == fast {
			steps = append(steps, gin.H{
				"phase": "found", "line": "found",
				"slow": slow, "fast": fast, "visited": visited, "meet": slow,
				"icon": "crown-bold",
				"msg":    fmt.Sprintf("slow(%d) == fast(%d) → CYCLE DETECTED!", slow, fast),
				"detail": fmt.Sprintf("Both pointers at node[%d] val=%d", slow, nodeVals[slow]),
				"result": true,
			})
			steps = append(steps, gin.H{
				"phase": "found", "line": "found",
				"slow": slow, "fast": fast, "visited": visited, "meet": slow,
				"icon": "flag-bold",
				"msg":    `return true`,
				"detail": `Cycle confirmed — has cycle = true`,
				"result": true,
			})
			return steps
		}

		steps = append(steps, gin.H{
			"phase": "meet_check", "line": "meet_check",
			"slow": slow, "fast": fast, "visited": visited, "meet": -1,
			"icon": "close-circle-bold",
			"msg":    fmt.Sprintf("slow(%d) ≠ fast(%d) — advance pointers", slow, fast),
			"detail": `No meeting yet`,
			"result": nil,
		})

		prevSlow, prevFast := slow, fast
		slow = nextOf(slow)
		fastNext := nextOf(fast)
		if fastNext < 0 {
			fast = -1
		} else {
			fast = nextOf(fastNext)
		}

		newVisited := []int{}
		if slow >= 0 {
			newVisited = append(newVisited, slow)
		}
		if fast >= 0 {
			newVisited = append(newVisited, fast)
		}

		slowVal := "nil"
		if slow >= 0 && slow < n {
			slowVal = fmt.Sprintf("%d", nodeVals[slow])
		}
		fastVal := "nil"
		if fast >= 0 && fast < n {
			fastVal = fmt.Sprintf("%d", nodeVals[fast])
		}

		steps = append(steps, gin.H{
			"phase": "advance", "line": "advance",
			"slow": slow, "fast": fast, "visited": newVisited, "meet": -1,
			"prevSlow": prevSlow, "prevFast": prevFast,
			"icon": "arrow-right-bold",
			"msg":    fmt.Sprintf("slow: %d→%d  fast: %d→%d→%d", prevSlow, slow, prevFast, fastNext, fast),
			"detail": fmt.Sprintf("slow.Next=%s  fast.Next.Next=%s", slowVal, fastVal),
			"result": nil,
		})
	}

	steps = append(steps, gin.H{
		"phase": "done_false", "line": "done_false",
		"slow": slow, "fast": -1, "visited": []int{}, "meet": -1,
		"icon": "flag-bold",
		"msg":    `fast reached nil → no cycle → return false`,
		"detail": `return false`,
		"result": false,
	})
	return steps
}
