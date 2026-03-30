package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type TwoSum2Request struct {
	Numbers []int `json:"numbers" binding:"required"`
	Target  int   `json:"target"`
}

func TwoSum2Steps(c *gin.Context) {
	var req TwoSum2Request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Numbers) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "numbers must have at least 2 elements"})
		return
	}
	if len(req.Numbers) > 128 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "numbers too large (max 128)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildTwoSum2Steps(req.Numbers, req.Target)})
}

func buildTwoSum2Steps(numbers []int, target int) []gin.H {
	steps := []gin.H{}
	left, right := 0, len(numbers)-1

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"left": left, "right": right, "sum": nil,
		"icon": "rocket-bold",
		"msg":    fmt.Sprintf("Initialize: left=0, right=%d, target=%d", right, target),
		"detail": fmt.Sprintf("Sorted array of %d elements", len(numbers)),
		"result": nil,
	})

	for left < right {
		steps = append(steps, gin.H{
			"phase": "check_loop", "line": "check_loop",
			"left": left, "right": right, "sum": nil,
			"icon": "refresh-bold",
			"msg":    fmt.Sprintf("Loop: left(%d) < right(%d) ✓", left, right),
			"detail": fmt.Sprintf("numbers[left]=%d, numbers[right]=%d", numbers[left], numbers[right]),
			"result": nil,
		})

		sum := numbers[left] + numbers[right]
		steps = append(steps, gin.H{
			"phase": "calc_sum", "line": "calc_sum",
			"left": left, "right": right, "sum": sum,
			"icon": "calculator-minimalistic-bold",
			"msg":    fmt.Sprintf("sum = numbers[%d](%d) + numbers[%d](%d) = %d", left, numbers[left], right, numbers[right], sum),
			"detail": fmt.Sprintf("Compare sum(%d) with target(%d)", sum, target),
			"result": nil,
		})

		if sum == target {
			ans := []int{left + 1, right + 1}
			steps = append(steps, gin.H{
				"phase": "found", "line": "found",
				"left": left, "right": right, "sum": sum,
				"icon": "check-circle-bold",
				"msg":    fmt.Sprintf("Found! sum(%d) == target(%d)", sum, target),
				"detail": fmt.Sprintf("Return 1-based indices [%d, %d]", ans[0], ans[1]),
				"result": ans,
			})
			steps = append(steps, gin.H{
				"phase": "done", "line": "done",
				"left": left, "right": right, "sum": sum,
				"icon": "flag-bold",
				"msg":    fmt.Sprintf("Done! Answer = [%d, %d]", ans[0], ans[1]),
				"detail": fmt.Sprintf("numbers[%d](%d) + numbers[%d](%d) = %d", left, numbers[left], right, numbers[right], target),
				"result": ans,
			})
			return steps
		}

		moveLeft := sum < target
		var cmpMsg, cmpDetail string
		if moveLeft {
			cmpMsg = fmt.Sprintf("sum(%d) < target(%d) → need bigger → left++", sum, target)
			cmpDetail = `Moving left pointer right to increase sum`
		} else {
			cmpMsg = fmt.Sprintf("sum(%d) > target(%d) → need smaller → right--", sum, target)
			cmpDetail = `Moving right pointer left to decrease sum`
		}
		cmpIcon := "arrow-right-bold"
		if !moveLeft {
			cmpIcon = "arrow-left-bold"
		}
		steps = append(steps, gin.H{
			"phase": "cmp_sum", "line": "cmp_sum",
			"left": left, "right": right, "sum": sum,
			"icon": cmpIcon,
			"msg": cmpMsg, "detail": cmpDetail,
			"result": nil,
		})

		if moveLeft {
			left++
			steps = append(steps, gin.H{
				"phase": "move_left", "line": "move_left",
				"left": left, "right": right, "sum": sum,
				"icon": "arrow-right-bold",
				"msg":    fmt.Sprintf("left++ → left = %d  (now numbers[left]=%d)", left, numbers[left]),
				"detail": `Sum was too small — advancing left to larger value`,
				"result": nil,
			})
		} else {
			right--
			steps = append(steps, gin.H{
				"phase": "move_right", "line": "move_right",
				"left": left, "right": right, "sum": sum,
				"icon": "arrow-left-bold",
				"msg":    fmt.Sprintf("right-- → right = %d  (now numbers[right]=%d)", right, numbers[right]),
				"detail": `Sum was too large — retreating right to smaller value`,
				"result": nil,
			})
		}
	}

	steps = append(steps, gin.H{
		"phase": "check_loop", "line": "check_loop",
		"left": left, "right": right, "sum": nil,
		"icon": "close-circle-bold",
		"msg":    fmt.Sprintf("Loop ends: left(%d) ≥ right(%d)", left, right),
		"detail": `No solution found`,
		"result": nil,
	})
	steps = append(steps, gin.H{
		"phase": "no_solution", "line": "no_solution",
		"left": left, "right": right, "sum": nil,
		"icon": "flag-bold",
		"msg":    `Return empty (no solution found)`,
		"detail": `return []int{}`,
		"result": []int{},
	})
	return steps
}
