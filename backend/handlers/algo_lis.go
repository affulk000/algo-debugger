package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LISRequest struct {
	Nums []int `json:"nums" binding:"required"`
}

func LISSteps(c *gin.Context) {
	var req LISRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Nums) > 128 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nums too large (max 128)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildLISSteps(req.Nums)})
}

func buildLISSteps(nums []int) []gin.H {
	steps := []gin.H{}

	if len(nums) == 0 {
		steps = append(steps, gin.H{
			"phase": "done", "line": "done",
			"nums": []int{}, "tails": []int{}, "xi": -1, "x": nil,
			"left": nil, "right": nil, "mid": nil, "action": nil,
			"icon": "flag-bold", "msg": "Empty → 0", "detail": "",
		})
		return steps
	}

	tails := []int{}

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"nums": copySlice(nums), "tails": []int{}, "xi": -1, "x": nil,
		"left": nil, "right": nil, "mid": nil, "action": nil,
		"icon": "sort-by-time-bold",
		"msg":    `Init tails = []`,
		"detail": `tails stores smallest tail of each length`,
		"result": nil,
	})

	for xi, x := range nums {
		left, right := 0, len(tails)

		steps = append(steps, gin.H{
			"phase": "start_num", "line": "start_num",
			"nums": copySlice(nums), "tails": copySlice(tails), "xi": xi, "x": x,
			"left": left, "right": right, "mid": nil, "action": nil,
			"icon": "sort-by-time-bold",
			"msg":    fmt.Sprintf("x = %d  (nums[%d])  —  binary search in tails[0..%d]", x, xi, right-1),
			"detail": fmt.Sprintf("left=%d  right=%d", left, right),
			"result": nil,
		})

		for left < right {
			mid := left + (right-left)/2
			if tails[mid] < x {
				steps = append(steps, gin.H{
					"phase": "go_right", "line": "go_right",
					"nums": copySlice(nums), "tails": copySlice(tails), "xi": xi, "x": x,
					"left": left, "right": right, "mid": mid, "action": nil,
					"icon": "alt-arrow-right-bold",
					"msg":    fmt.Sprintf("tails[%d]=%d < %d  →  left = %d", mid, tails[mid], x, mid+1),
					"detail": `Search right half`,
					"result": nil,
				})
				left = mid + 1
			} else {
				steps = append(steps, gin.H{
					"phase": "go_left", "line": "go_left",
					"nums": copySlice(nums), "tails": copySlice(tails), "xi": xi, "x": x,
					"left": left, "right": right, "mid": mid, "action": nil,
					"icon": "alt-arrow-left-bold",
					"msg":    fmt.Sprintf("tails[%d]=%d ≥ %d  →  right = %d", mid, tails[mid], x, mid),
					"detail": `Search left half`,
					"result": nil,
				})
				right = mid
			}
		}

		if left == len(tails) {
			tails = append(tails, x)
			steps = append(steps, gin.H{
				"phase": "extend", "line": "extend",
				"nums": copySlice(nums), "tails": copySlice(tails), "xi": xi, "x": x,
				"left": left, "right": right, "mid": nil, "action": "extend",
				"icon": "add-circle-bold",
				"msg":    fmt.Sprintf("left(%d) == len(tails) → EXTEND: append %d  → LIS length = %d", left, x, len(tails)),
				"detail": fmt.Sprintf("tails = [%s]", joinInts(tails)),
				"result": nil,
			})
		} else {
			old := tails[left]
			tails[left] = x
			steps = append(steps, gin.H{
				"phase": "replace", "line": "replace",
				"nums": copySlice(nums), "tails": copySlice(tails), "xi": xi, "x": x,
				"left": left, "right": right, "mid": nil, "action": "replace",
				"icon": "refresh-bold",
				"msg":    fmt.Sprintf("left(%d) < len(tails) → REPLACE: tails[%d] = %d → %d", left, left, old, x),
				"detail": fmt.Sprintf("tails = [%s]", joinInts(tails)),
				"result": nil,
			})
		}
	}

	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"nums": copySlice(nums), "tails": copySlice(tails), "xi": -1, "x": nil,
		"left": nil, "right": nil, "mid": nil, "action": nil,
		"icon": "flag-bold",
		"msg":    fmt.Sprintf("Done! LIS length = %d", len(tails)),
		"detail": fmt.Sprintf("return %d", len(tails)),
		"result": len(tails),
	})
	return steps
}
