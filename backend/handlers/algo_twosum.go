package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type TwoSumRequest struct {
	Nums   []int `json:"nums"   binding:"required"`
	Target int   `json:"target"`
}

func TwoSumSteps(c *gin.Context) {
	var req TwoSumRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Nums) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nums must not be empty"})
		return
	}
	if len(req.Nums) > 128 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nums too large (max 128)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildTwoSumSteps(req.Nums, req.Target)})
}

func buildTwoSumSteps(nums []int, target int) []gin.H {
	steps := []gin.H{}
	seen := map[int]int{}

	steps = append(steps, gin.H{
		"phase": "init", "line": 1,
		"seen": gin.H{}, "i": nil, "num": nil, "needed": nil,
		"highlight": []int{}, "icon": "rocket-bold",
		"msg":    `Initialize: create empty map "seen"`,
		"detail": `seen = {}`,
		"result": nil,
	})

	for i, num := range nums {
		needed := target - num

		steps = append(steps, gin.H{
			"phase": "scan", "line": 2,
			"seen": copyIntMap(seen), "i": i, "num": num, "needed": nil,
			"highlight": []int{i}, "icon": "magnifer-bold",
			"msg":    fmt.Sprintf("Step %d: scanning [%d] = %d", i+1, i, num),
			"detail": fmt.Sprintf("i=%d, num=%d", i, num),
			"result": nil,
		})

		steps = append(steps, gin.H{
			"phase": "compute", "line": 3,
			"seen": copyIntMap(seen), "i": i, "num": num, "needed": needed,
			"highlight": []int{i}, "icon": "calculator-minimalistic-bold",
			"msg":    fmt.Sprintf("Compute needed = %d − %d = %d", target, num, needed),
			"detail": fmt.Sprintf("needed = %d - %d = %d", target, num, needed),
			"result": nil,
		})

		if idx, ok := seen[needed]; ok {
			steps = append(steps, gin.H{
				"phase": "found", "line": 4,
				"seen": copyIntMap(seen), "i": i, "num": num, "needed": needed,
				"highlight": []int{idx, i}, "icon": "check-circle-bold",
				"msg":    fmt.Sprintf("MATCH! %d found in seen at index %d", needed, idx),
				"detail": fmt.Sprintf("seen[%d] = %d → return [%d, %d]", needed, idx, idx, i),
				"result": []int{idx, i},
			})
			return steps
		}

		steps = append(steps, gin.H{
			"phase": "miss", "line": 4,
			"seen": copyIntMap(seen), "i": i, "num": num, "needed": needed,
			"highlight": []int{i}, "icon": "close-circle-bold",
			"msg":    fmt.Sprintf("%d not in seen yet", needed),
			"detail": fmt.Sprintf("seen[%d] → undefined", needed),
			"result": nil,
		})

		seen[num] = i

		steps = append(steps, gin.H{
			"phase": "store", "line": 5,
			"seen": copyIntMap(seen), "i": i, "num": num, "needed": needed,
			"highlight": []int{i}, "icon": "diskette-bold",
			"msg":    fmt.Sprintf("Store: seen[%d] = %d", num, i),
			"detail": fmt.Sprintf("Map size: %d", len(seen)),
			"result": nil,
		})
	}

	steps = append(steps, gin.H{
		"phase": "nil", "line": 6,
		"seen": copyIntMap(seen), "i": nil, "num": nil, "needed": nil,
		"highlight": []int{}, "icon": "forbidden-circle-bold",
		"msg":    `No solution → return nil`,
		"detail": `Exhausted all elements`,
		"result": nil,
	})
	return steps
}

func copyIntMap(m map[int]int) map[string]int {
	out := make(map[string]int, len(m))
	for k, v := range m {
		out[fmt.Sprintf("%d", k)] = v
	}
	return out
}
