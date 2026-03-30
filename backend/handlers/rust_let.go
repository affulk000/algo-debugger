package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AlgorithmStep is a single visualization step returned by the backend.
type AlgorithmStep struct {
	Phase     string `json:"phase"`
	Line      int    `json:"line"`
	Lo        int    `json:"lo"`
	Hi        int    `json:"hi"`
	Mid       int    `json:"mid"` // -1 when not yet computed
	Target    int    `json:"target"`
	Val       *int   `json:"val"` // nil when mid not yet computed
	Highlight []int  `json:"highlight"`
	Icon      string `json:"icon"`
	Msg       string `json:"msg"`
	Detail    string `json:"detail"`
	Result    *int   `json:"result"` // nil until final step; -1 means not found
}

type RustLetRequest struct {
	Nums   []int `json:"nums"   binding:"required"`
	Target int   `json:"target"`
}

// RustLetSteps handles POST /algorithms/rustlet/steps.
// Computes binary-search steps server-side with Rust-style let-binding semantics
// and returns the full step sequence as JSON.
func RustLetSteps(c *gin.Context) {
	var req RustLetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Nums) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nums must not be empty"})
		return
	}
	if len(req.Nums) > 64 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nums too large (max 64)"})
		return
	}

	steps := buildBinarySearchSteps(req.Nums, req.Target)
	c.JSON(http.StatusOK, gin.H{"steps": steps})
}

func intRef(v int) *int { return &v }

func buildBinarySearchSteps(nums []int, target int) []AlgorithmStep {
	steps := []AlgorithmStep{}

	lo := 0
	hi := len(nums)

	steps = append(steps, AlgorithmStep{
		Phase: "init", Line: 1,
		Lo: lo, Hi: hi, Mid: -1, Target: target, Val: nil,
		Highlight: []int{},
		Icon:      "rocket-bold",
		Msg:       fmt.Sprintf("Initialize: let mut lo = 0, let mut hi = %d", hi),
		Detail:    fmt.Sprintf("let mut lo = 0_usize;\nlet mut hi = %d;", hi),
		Result:    nil,
	})

	iter := 0
	for lo < hi {
		iter++
		mid := lo + (hi-lo)/2
		val := nums[mid]

		steps = append(steps, AlgorithmStep{
			Phase: "scan", Line: 2,
			Lo: lo, Hi: hi, Mid: mid, Target: target, Val: nil,
			Highlight: rangeHighlight(lo, hi),
			Icon:      "magnifer-bold",
			Msg:       fmt.Sprintf("Iteration %d: while lo(%d) < hi(%d) — search window [%d, %d)", iter, lo, hi, lo, hi),
			Detail:    fmt.Sprintf("while lo(%d) < hi(%d)", lo, hi),
			Result:    nil,
		})

		steps = append(steps, AlgorithmStep{
			Phase: "compute", Line: 3,
			Lo: lo, Hi: hi, Mid: mid, Target: target, Val: intRef(val),
			Highlight: []int{mid},
			Icon:      "calculator-minimalistic-bold",
			Msg:       fmt.Sprintf("let mid = %d + (%d − %d) / 2 = %d  →  nums[%d] = %d", lo, hi, lo, mid, mid, val),
			Detail:    fmt.Sprintf("let mid = %d;\nlet val = nums[%d] = %d;", mid, mid, val),
			Result:    nil,
		})

		if val == target {
			steps = append(steps, AlgorithmStep{
				Phase: "found", Line: 4,
				Lo: lo, Hi: hi, Mid: mid, Target: target, Val: intRef(val),
				Highlight: []int{mid},
				Icon:      "check-circle-bold",
				Msg:       fmt.Sprintf("FOUND — nums[%d] = %d == target %d → return %d as i32", mid, val, target, mid),
				Detail:    fmt.Sprintf("val(%d) == target(%d)\nreturn %d as i32", val, target, mid),
				Result:    intRef(mid),
			})
			return steps
		} else if val < target {
			steps = append(steps, AlgorithmStep{
				Phase: "right", Line: 5,
				Lo: lo, Hi: hi, Mid: mid, Target: target, Val: intRef(val),
				Highlight: []int{mid},
				Icon:      "double-alt-arrow-right-bold",
				Msg:       fmt.Sprintf("nums[%d]=%d < target=%d → right half: lo = %d + 1 = %d", mid, val, target, mid, mid+1),
				Detail:    fmt.Sprintf("val(%d) < target(%d)\nlo = mid + 1 = %d;", val, target, mid+1),
				Result:    nil,
			})
			lo = mid + 1
		} else {
			steps = append(steps, AlgorithmStep{
				Phase: "left", Line: 6,
				Lo: lo, Hi: hi, Mid: mid, Target: target, Val: intRef(val),
				Highlight: []int{mid},
				Icon:      "double-alt-arrow-left-bold",
				Msg:       fmt.Sprintf("nums[%d]=%d > target=%d → left half: hi = %d", mid, val, target, mid),
				Detail:    fmt.Sprintf("val(%d) > target(%d)\nhi = mid = %d;", val, target, mid),
				Result:    nil,
			})
			hi = mid
		}
	}

	steps = append(steps, AlgorithmStep{
		Phase: "nil", Line: 7,
		Lo: lo, Hi: hi, Mid: -1, Target: target, Val: nil,
		Highlight: []int{},
		Icon:      "forbidden-circle-bold",
		Msg:       fmt.Sprintf("Not found — lo(%d) == hi(%d), target %d absent → return -1", lo, hi, target),
		Detail:    "return -1",
		Result:    intRef(-1),
	})

	return steps
}

// rangeHighlight returns indices [lo, hi) clamped to a reasonable display count.
func rangeHighlight(lo, hi int) []int {
	out := make([]int, 0, hi-lo)
	for i := lo; i < hi; i++ {
		out = append(out, i)
	}
	return out
}
