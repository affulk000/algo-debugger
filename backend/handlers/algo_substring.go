package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SubstringRequest struct {
	S string `json:"s" binding:"required"`
}

func SubstringSteps(c *gin.Context) {
	var req SubstringRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.S) > 512 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "string too long (max 512)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildSubstringSteps(req.S)})
}

func buildSubstringSteps(s string) []gin.H {
	steps := []gin.H{}
	chars := []rune(s)
	n := len(chars)

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"left": 0, "right": nil, "maxLength": 0,
		"lastSeen": gin.H{},
		"icon": "rocket-bold",
		"msg":    `Initialize: lastSeen={}, maxLength=0, left=0`,
		"detail": fmt.Sprintf(`Input: "%s"  (%d chars)`, s, n),
		"result": nil,
	})

	lastSeen := map[rune]int{}
	left, maxLength := 0, 0

	for right := 0; right < n; right++ {
		ch := chars[right]

		steps = append(steps, gin.H{
			"phase": "move_right", "line": "move_right",
			"left": left, "right": right, "maxLength": maxLength,
			"lastSeen": runeMapToH(lastSeen),
			"icon": "arrow-right-bold",
			"msg":    fmt.Sprintf("right → [%d]  char = '%c'", right, ch),
			"detail": fmt.Sprintf("Scanning s[%d] = '%c'", right, ch),
			"result": nil,
		})

		prevIdx, seen := lastSeen[ch]
		inWindow := seen && prevIdx >= left

		phase := "no_jump"
		icon := "check-circle-bold"
		if inWindow {
			phase = "check_in"
			icon = "danger-bold"
		}
		var checkMsg string
		if inWindow {
			checkMsg = fmt.Sprintf("'%c' in window! lastSeen['%c']=%d ≥ left(%d)", ch, ch, prevIdx, left)
		} else if seen {
			checkMsg = fmt.Sprintf("'%c' seen before at [%d], but outside window (< left=%d)", ch, prevIdx, left)
		} else {
			checkMsg = fmt.Sprintf("'%c' not in lastSeen — no conflict", ch)
		}
		var detailMsg string
		if seen {
			detailMsg = fmt.Sprintf("lastSeen['%c'] = %d", ch, prevIdx)
		} else {
			detailMsg = fmt.Sprintf("lastSeen['%c'] → not found", ch)
		}

		steps = append(steps, gin.H{
			"phase": phase, "line": "check_in",
			"left": left, "right": right, "maxLength": maxLength,
			"lastSeen": runeMapToH(lastSeen),
			"icon": icon,
			"msg":    checkMsg,
			"detail": detailMsg,
			"result": nil,
		})

		if inWindow {
			newLeft := prevIdx + 1
			left = newLeft
			steps = append(steps, gin.H{
				"phase": "jump_left", "line": "jump_left",
				"left": left, "right": right, "maxLength": maxLength,
				"lastSeen": runeMapToH(lastSeen),
				"icon": "double-alt-arrow-right-bold",
				"msg":    fmt.Sprintf("Jump! left = lastSeen['%c'] + 1 = %d", ch, newLeft),
				"detail": fmt.Sprintf("Window shrinks: [%d..%d]", newLeft, right),
				"result": nil,
			})
		}

		lastSeen[ch] = right
		steps = append(steps, gin.H{
			"phase": "update_map", "line": "update_map",
			"left": left, "right": right, "maxLength": maxLength,
			"lastSeen": runeMapToH(lastSeen),
			"icon": "diskette-bold",
			"msg":    fmt.Sprintf("Store: lastSeen['%c'] = %d", ch, right),
			"detail": fmt.Sprintf("Map size: %d", len(lastSeen)),
			"result": nil,
		})

		windowLen := right - left + 1
		isNewMax := windowLen > maxLength
		if isNewMax {
			maxLength = windowLen
		}

		phase2 := "calc_max"
		icon2 := "calculator-minimalistic-bold"
		var msg2 string
		if isNewMax {
			phase2 = "new_max"
			icon2 = "crown-bold"
			msg2 = fmt.Sprintf("New max! maxLength = %d  \"%s\"", maxLength, string(chars[left:right+1]))
		} else {
			msg2 = fmt.Sprintf("window(%d) ≤ maxLength(%d) — no update", windowLen, maxLength)
		}

		steps = append(steps, gin.H{
			"phase": phase2, "line": phase2,
			"left": left, "right": right, "maxLength": maxLength,
			"lastSeen": runeMapToH(lastSeen),
			"icon": icon2,
			"msg":    msg2,
			"detail": fmt.Sprintf("max(%d, %d-%d+1) = %d", maxLength, right, left, maxLength),
			"result": nil,
		})
	}

	rightFinal := n - 1
	if n == 0 {
		rightFinal = 0
	}
	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"left": left, "right": rightFinal, "maxLength": maxLength,
		"lastSeen": runeMapToH(lastSeen),
		"icon": "flag-bold",
		"msg":    fmt.Sprintf("Done! Longest substring without repeating = %d", maxLength),
		"detail": fmt.Sprintf("return maxLength = %d", maxLength),
		"result": []int{maxLength},
	})
	return steps
}

func runeMapToH(m map[rune]int) gin.H {
	out := make(gin.H, len(m))
	for k, v := range m {
		out[string(k)] = v
	}
	return out
}
