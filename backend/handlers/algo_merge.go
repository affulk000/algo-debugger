package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type MergeRequest struct {
	A []int `json:"a" binding:"required"`
	B []int `json:"b" binding:"required"`
}

func MergeSteps(c *gin.Context) {
	var req MergeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.A)+len(req.B) > 128 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "combined length too large (max 128)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildMergeSteps(req.A, req.B)})
}

func buildMergeSteps(a, b []int) []gin.H {
	steps := []gin.H{}
	res := []int{}

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"ia": nil, "ib": nil, "res": []int{},
		"highlightA": []int{}, "highlightB": []int{},
		"icon": "rocket-bold",
		"msg":    `Initialize: res=[], i=0, j=0`,
		"detail": fmt.Sprintf("Merging [%s] + [%s]", joinInts(a), joinInts(b)),
		"result": nil,
	})

	i, j := 0, 0
	for i < len(a) && j < len(b) {
		steps = append(steps, gin.H{
			"phase": "loop", "line": "loop",
			"ia": i, "ib": j, "res": copySlice(res),
			"highlightA": []int{i}, "highlightB": []int{j},
			"icon": "refresh-bold",
			"msg":    fmt.Sprintf("Loop: i=%d < %d  &&  j=%d < %d", i, len(a), j, len(b)),
			"detail": fmt.Sprintf("a[%d]=%d, b[%d]=%d", i, a[i], j, b[j]),
			"result": nil,
		})

		cmp := "≤"
		side := "A"
		if a[i] > b[j] {
			cmp = ">"
			side = "B"
		}
		steps = append(steps, gin.H{
			"phase": "compare", "line": "compare",
			"ia": i, "ib": j, "res": copySlice(res),
			"highlightA": []int{i}, "highlightB": []int{j},
			"icon": "magnifer-bold",
			"msg":    fmt.Sprintf("Compare a[%d]=%d  vs  b[%d]=%d", i, a[i], j, b[j]),
			"detail": fmt.Sprintf("%d %s %d → pick from %s", a[i], cmp, b[j], side),
			"result": nil,
		})

		if a[i] <= b[j] {
			res = append(res, a[i])
			steps = append(steps, gin.H{
				"phase": "pick_a", "line": "pick_a",
				"ia": i, "ib": j, "res": copySlice(res),
				"highlightA": []int{i}, "highlightB": []int{},
				"icon": "arrow-right-down-bold",
				"msg":    fmt.Sprintf("Pick a[%d]=%d  →  append to result", i, a[i]),
				"detail": fmt.Sprintf("res = [%s]", joinInts(res)),
				"result": nil,
			})
			i++
		} else {
			res = append(res, b[j])
			steps = append(steps, gin.H{
				"phase": "pick_b", "line": "pick_b",
				"ia": i, "ib": j, "res": copySlice(res),
				"highlightA": []int{}, "highlightB": []int{j},
				"icon": "arrow-left-down-bold",
				"msg":    fmt.Sprintf("Pick b[%d]=%d  →  append to result", j, b[j]),
				"detail": fmt.Sprintf("res = [%s]", joinInts(res)),
				"result": nil,
			})
			j++
		}
	}

	if i < len(a) {
		leftover := a[i:]
		hA := make([]int, len(leftover))
		for k := range leftover {
			hA[k] = i + k
		}
		res = append(res, leftover...)
		steps = append(steps, gin.H{
			"phase": "leftover", "line": "leftover_a",
			"ia": i, "ib": j, "res": copySlice(res),
			"highlightA": hA, "highlightB": []int{},
			"icon": "layers-bold",
			"msg":    fmt.Sprintf("Append remaining A: [%s]", joinInts(leftover)),
			"detail": fmt.Sprintf("a[%d:] = [%s]", i, joinInts(leftover)),
			"result": nil,
		})
	}

	if j < len(b) {
		leftover := b[j:]
		hB := make([]int, len(leftover))
		for k := range leftover {
			hB[k] = j + k
		}
		res = append(res, leftover...)
		steps = append(steps, gin.H{
			"phase": "leftover", "line": "leftover_b",
			"ia": i, "ib": j, "res": copySlice(res),
			"highlightA": []int{}, "highlightB": hB,
			"icon": "layers-bold",
			"msg":    fmt.Sprintf("Append remaining B: [%s]", joinInts(leftover)),
			"detail": fmt.Sprintf("b[%d:] = [%s]", j, joinInts(leftover)),
			"result": nil,
		})
	}

	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"ia": nil, "ib": nil, "res": copySlice(res),
		"highlightA": []int{}, "highlightB": []int{},
		"icon": "check-circle-bold",
		"msg":    fmt.Sprintf("Done! Merged array has %d elements", len(res)),
		"detail": fmt.Sprintf("return [%s]", joinInts(res)),
		"result": copySlice(res),
	})
	return steps
}

func copySlice(s []int) []int {
	out := make([]int, len(s))
	copy(out, s)
	return out
}

func joinInts(s []int) string {
	parts := make([]string, len(s))
	for i, v := range s {
		parts[i] = fmt.Sprintf("%d", v)
	}
	return strings.Join(parts, ", ")
}
