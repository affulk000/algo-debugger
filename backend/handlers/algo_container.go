package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ContainerRequest struct {
	Height []int `json:"height" binding:"required"`
}

func ContainerSteps(c *gin.Context) {
	var req ContainerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Height) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "height must have at least 2 elements"})
		return
	}
	if len(req.Height) > 128 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "height too large (max 128)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildContainerSteps(req.Height)})
}

func buildContainerSteps(height []int) []gin.H {
	steps := []gin.H{}
	left, right, maxWater := 0, len(height)-1, 0

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"left": left, "right": right, "maxWater": maxWater,
		"area": nil, "width": nil, "currentHeight": nil,
		"icon": "rocket-bold",
		"msg":    fmt.Sprintf("Initialize: left=0, right=%d, maxWater=0", right),
		"detail": fmt.Sprintf("Array length: %d", len(height)),
		"result": nil,
	})

	for left < right {
		steps = append(steps, gin.H{
			"phase": "check_loop", "line": "check_loop",
			"left": left, "right": right, "maxWater": maxWater,
			"area": nil, "width": nil, "currentHeight": nil,
			"icon": "refresh-bold",
			"msg":    fmt.Sprintf("Loop: left(%d) < right(%d) ✓", left, right),
			"detail": fmt.Sprintf("height[left]=%d, height[right]=%d", height[left], height[right]),
			"result": nil,
		})

		width := right - left
		steps = append(steps, gin.H{
			"phase": "calc_width", "line": "calc_width",
			"left": left, "right": right, "maxWater": maxWater,
			"area": nil, "width": width, "currentHeight": nil,
			"icon": "ruler-bold",
			"msg":    fmt.Sprintf("width = right(%d) − left(%d) = %d", right, left, width),
			"detail": `Horizontal distance between pointers`,
			"result": nil,
		})

		lh, rh := height[left], height[right]
		currentHeight := lh
		minIsLeft := true
		phase := "calc_height"
		if rh < lh {
			currentHeight = rh
			minIsLeft = false
			phase = "calc_height_b"
		}
		sideStr := fmt.Sprintf("a(%d) — left is shorter", lh)
		if !minIsLeft {
			sideStr = fmt.Sprintf("b(%d) — right is shorter", rh)
		}
		steps = append(steps, gin.H{
			"phase": phase, "line": phase,
			"left": left, "right": right, "maxWater": maxWater,
			"area": nil, "width": width, "currentHeight": currentHeight,
			"icon": "arrow-to-top-down-bold",
			"msg":    fmt.Sprintf("currentHeight = min(h[%d]=%d, h[%d]=%d) = %d", left, lh, right, rh, currentHeight),
			"detail": fmt.Sprintf("min() returns %s", sideStr),
			"result": nil,
		})

		area := width * currentHeight
		steps = append(steps, gin.H{
			"phase": "calc_area", "line": "calc_area",
			"left": left, "right": right, "maxWater": maxWater,
			"area": area, "width": width, "currentHeight": currentHeight,
			"icon": "calculator-minimalistic-bold",
			"msg":    fmt.Sprintf("area = %d × %d = %d", width, currentHeight, area),
			"detail": fmt.Sprintf("width(%d) × currentHeight(%d)", width, currentHeight),
			"result": nil,
		})

		isNewMax := area > maxWater
		oldMax := maxWater
		if isNewMax {
			maxWater = area
		}
		maxPhase := "no_max"
		maxIcon := "close-circle-bold"
		var maxMsg, maxDetail string
		if isNewMax {
			maxPhase = "new_max"
			maxIcon = "crown-bold"
			maxMsg = fmt.Sprintf("New max! maxWater = %d", maxWater)
			maxDetail = fmt.Sprintf("%d > %d → update maxWater", area, oldMax)
		} else {
			maxMsg = fmt.Sprintf("area(%d) ≤ maxWater(%d) — no update", area, maxWater)
			maxDetail = fmt.Sprintf("Keep maxWater = %d", maxWater)
		}
		steps = append(steps, gin.H{
			"phase": maxPhase, "line": maxPhase,
			"left": left, "right": right, "maxWater": maxWater,
			"area": area, "width": width, "currentHeight": currentHeight,
			"icon": maxIcon,
			"msg":    maxMsg,
			"detail": maxDetail,
			"result": nil,
		})

		moveLeft := height[left] < height[right]
		var movePhase, moveIcon, moveMsg, moveDetail string
		if moveLeft {
			movePhase = "move_left"
			moveIcon = "arrow-right-bold"
			moveMsg = fmt.Sprintf("Move left++  (h[left] was shorter: %d < %d)", height[left], height[right])
			moveDetail = `Advance shorter side to potentially find a taller line`
			left++
		} else {
			movePhase = "move_right"
			moveIcon = "arrow-left-bold"
			moveMsg = fmt.Sprintf("Move right-- (h[right] was ≤ h[left]: %d ≥ %d)", height[left], height[right])
			moveDetail = `Retreat shorter side to potentially find a taller line`
			right--
		}
		steps = append(steps, gin.H{
			"phase": movePhase, "line": movePhase,
			"left": left, "right": right, "maxWater": maxWater,
			"area": area, "width": width, "currentHeight": currentHeight,
			"icon": moveIcon,
			"msg":    moveMsg,
			"detail": moveDetail,
			"result": nil,
		})
	}

	steps = append(steps, gin.H{
		"phase": "check_loop", "line": "check_loop",
		"left": left, "right": right, "maxWater": maxWater,
		"area": nil, "width": nil, "currentHeight": nil,
		"icon": "close-circle-bold",
		"msg":    fmt.Sprintf("Loop ends: left(%d) ≥ right(%d)", left, right),
		"detail": `Pointers have met — all pairs considered`,
		"result": nil,
	})

	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"left": left, "right": right, "maxWater": maxWater,
		"area": nil, "width": nil, "currentHeight": nil,
		"icon": "flag-bold",
		"msg":    fmt.Sprintf("Done! Maximum water area = %d", maxWater),
		"detail": fmt.Sprintf("return maxWater = %d", maxWater),
		"result": []int{maxWater},
	})
	return steps
}
