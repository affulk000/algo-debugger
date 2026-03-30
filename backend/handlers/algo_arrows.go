package handlers

import (
	"fmt"
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
)

type ArrowsRequest struct {
	Points [][]int `json:"points" binding:"required"`
}

func ArrowsSteps(c *gin.Context) {
	var req ArrowsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Points) > 128 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "points too large (max 128)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildArrowsSteps(req.Points)})
}

func buildArrowsSteps(rawPoints [][]int) []gin.H {
	steps := []gin.H{}

	if len(rawPoints) == 0 {
		steps = append(steps, gin.H{
			"phase": "done", "line": "done",
			"sorted": [][]int{}, "i": nil, "arrows": 0, "currentEnd": nil, "burst": []int{},
			"icon": "flag-bold", "msg": "Empty input → 0", "detail": "",
		})
		return steps
	}

	sorted := make([][]int, len(rawPoints))
	for i, p := range rawPoints {
		sorted[i] = []int{p[0], p[1]}
	}
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i][1] < sorted[j][1]
	})

	fmtSorted := func(s [][]int) string {
		parts := make([]string, len(s))
		for i, p := range s {
			parts[i] = fmt.Sprintf("[%d,%d]", p[0], p[1])
		}
		return "[" + joinStrings(parts) + "]"
	}

	steps = append(steps, gin.H{
		"phase": "sort", "line": "sort",
		"sorted": deepCopy2D(sorted), "i": nil, "arrows": 0, "currentEnd": nil, "burst": []int{},
		"icon": "sort-by-time-bold",
		"msg":    fmt.Sprintf("Sort %d balloons by end coordinate", len(rawPoints)),
		"detail": fmt.Sprintf("Sorted: %s", fmtSorted(sorted)),
		"result": nil,
	})

	arrows := 1
	currentEnd := sorted[0][1]
	burst := []int{0}

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"sorted": deepCopy2D(sorted), "i": 0, "arrows": arrows, "currentEnd": currentEnd, "burst": copyIntSlice(burst),
		"icon": "rocket-bold",
		"msg":    fmt.Sprintf("First arrow at x=%d  (end of balloon 0)", currentEnd),
		"detail": fmt.Sprintf("arrows=1, currentEnd=%d", currentEnd),
		"result": nil,
	})

	for i := 1; i < len(sorted); i++ {
		start, end := sorted[i][0], sorted[i][1]
		hit := start <= currentEnd

		phase := "check_hit"
		if hit {
			phase = "hit"
		}
		steps = append(steps, gin.H{
			"phase": phase, "line": "check_hit",
			"sorted": deepCopy2D(sorted), "i": i, "arrows": arrows, "currentEnd": currentEnd, "burst": copyIntSlice(burst),
			"icon": map[bool]string{true: "check-circle-bold", false: "close-circle-bold"}[hit],
			"msg": map[bool]string{
				true:  fmt.Sprintf("Balloon %d: start(%d) ≤ currentEnd(%d) → already burst by arrow", i, start, currentEnd),
				false: fmt.Sprintf("Balloon %d: start(%d) > currentEnd(%d) → need new arrow!", i, start, currentEnd),
			}[hit],
			"detail": fmt.Sprintf("points[%d] = [%d, %d]  hit=%v", i, start, end, hit),
			"result": nil,
		})

		if !hit {
			arrows++
			currentEnd = end
			burst = append(burst, i)

			steps = append(steps, gin.H{
				"phase": "new_arrow", "line": "new_arrow",
				"sorted": deepCopy2D(sorted), "i": i, "arrows": arrows, "currentEnd": currentEnd, "burst": copyIntSlice(burst),
				"icon": "arrow-down-bold",
				"msg":    fmt.Sprintf("New arrow #%d at x=%d", arrows, currentEnd),
				"detail": fmt.Sprintf("arrows=%d, currentEnd updated to %d", arrows, currentEnd),
				"result": nil,
			})
		} else {
			burst = append(burst, i)
		}
	}

	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"sorted": deepCopy2D(sorted), "i": nil, "arrows": arrows, "currentEnd": currentEnd, "burst": copyIntSlice(burst),
		"icon": "flag-bold",
		"msg":    fmt.Sprintf("Done! Minimum arrows = %d", arrows),
		"detail": fmt.Sprintf("return %d", arrows),
		"result": arrows,
	})
	return steps
}

func deepCopy2D(s [][]int) [][]int {
	out := make([][]int, len(s))
	for i, row := range s {
		out[i] = copySlice(row)
	}
	return out
}
