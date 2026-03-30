package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RustBubbleRequest struct {
	Nums []int `json:"nums" binding:"required"`
}

func RustBubbleSteps(c *gin.Context) {
	var req RustBubbleRequest
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
	c.JSON(http.StatusOK, gin.H{"steps": buildRustBubbleSteps(req.Nums)})
}

// buildRustBubbleSteps mirrors the Rust bubble_sort(&mut Vec<i32>) logic.
// Rust code:
//
//	fn bubble_sort(nums: &mut Vec<i32>) {
//	    let n = nums.len();
//	    for i in 0..n {
//	        let mut swapped = false;
//	        for j in 0..n - 1 - i {
//	            if nums[j] > nums[j + 1] {
//	                nums.swap(j, j + 1);
//	                swapped = true;
//	            }
//	        }
//	        if !swapped { break; }
//	    }
//	}
func buildRustBubbleSteps(nums []int) []gin.H {
	steps := []gin.H{}
	arr := copySlice(nums)
	n := len(arr)

	steps = append(steps, gin.H{
		"phase": "init",
		"arr": copySlice(arr), "n": n, "i": nil, "j": nil, "sortedFrom": n,
		"icon": "rocket-bold",
		"msg":    fmt.Sprintf("Initialize: n = %d", n),
		"detail": fmt.Sprintf("nums = [%s]", joinInts(arr)),
		"result": nil,
	})

	for i := 0; i < n; i++ {
		steps = append(steps, gin.H{
			"phase": "outer_loop",
			"arr": copySlice(arr), "n": n, "i": i, "j": nil, "sortedFrom": n - i,
			"icon": "refresh-bold",
			"msg":    fmt.Sprintf("Outer loop: i = %d  (pass %d of up to %d)", i, i+1, n),
			"detail": fmt.Sprintf("Active window: indices 0..%d", n-1-i),
			"result": nil,
		})

		steps = append(steps, gin.H{
			"phase": "reset_swap",
			"arr": copySlice(arr), "n": n, "i": i, "j": nil, "sortedFrom": n - i,
			"icon": "variable-bold",
			"msg":    `let mut swapped = false`,
			"detail": `Reset swap flag for this pass`,
			"result": nil,
		})

		swapped := false
		limit := n - 1 - i

		for j := 0; j < limit; j++ {
			steps = append(steps, gin.H{
				"phase": "compare",
				"arr": copySlice(arr), "n": n, "i": i, "j": j, "sortedFrom": n - i,
				"icon": "magnifer-bold",
				"msg":    fmt.Sprintf("Compare nums[%d]=%d  vs  nums[%d]=%d", j, arr[j], j+1, arr[j+1]),
				"detail": fmt.Sprintf("%d > %d  →  %v", arr[j], arr[j+1], arr[j] > arr[j+1]),
				"result": nil,
			})

			if arr[j] > arr[j+1] {
				arr[j], arr[j+1] = arr[j+1], arr[j]
				swapped = true

				steps = append(steps, gin.H{
					"phase": "swap",
					"arr": copySlice(arr), "n": n, "i": i, "j": j, "sortedFrom": n - i,
					"icon": "transfer-horizontal-bold",
					"msg":    fmt.Sprintf("nums.swap(%d, %d)  →  [%d, %d]", j, j+1, arr[j], arr[j+1]),
					"detail": fmt.Sprintf("arr = [%s]", joinInts(arr)),
					"result": nil,
				})
			} else {
				steps = append(steps, gin.H{
					"phase": "no_swap",
					"arr": copySlice(arr), "n": n, "i": i, "j": j, "sortedFrom": n - i,
					"icon": "check-bold",
					"msg":    fmt.Sprintf("No swap: %d ≤ %d  — order OK", arr[j], arr[j+1]),
					"detail": `Nothing to do`,
					"result": nil,
				})
			}
		}

		if !swapped {
			passStr := "pass"
			if i > 0 {
				passStr = "passes"
			}
			steps = append(steps, gin.H{
				"phase": "early_exit",
				"arr": copySlice(arr), "n": n, "i": i, "j": nil, "sortedFrom": 0,
				"icon": "check-circle-bold",
				"msg":    `!swapped → break  — array already sorted!`,
				"detail": fmt.Sprintf("Early exit after %d %s", i+1, passStr),
				"result": copySlice(arr),
			})
			return steps
		}

		steps = append(steps, gin.H{
			"phase": "pass_done",
			"arr": copySlice(arr), "n": n, "i": i, "j": nil, "sortedFrom": n - i - 1,
			"icon": "lock-bold",
			"msg":    fmt.Sprintf("Pass %d done: nums[%d]=%d is in its final place", i+1, n-1-i, arr[n-1-i]),
			"detail": fmt.Sprintf("Sorted suffix starts at index %d", n-1-i),
			"result": nil,
		})
	}

	steps = append(steps, gin.H{
		"phase": "done",
		"arr": copySlice(arr), "n": n, "i": n, "j": nil, "sortedFrom": 0,
		"icon": "flag-bold",
		"msg":    `Fully sorted!`,
		"detail": fmt.Sprintf("Result: [%s]", joinInts(arr)),
		"result": copySlice(arr),
	})
	return steps
}
