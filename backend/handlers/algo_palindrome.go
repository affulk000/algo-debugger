package handlers

import (
	"fmt"
	"net/http"
	"unicode"

	"github.com/gin-gonic/gin"
)

type PalindromeRequest struct {
	S string `json:"s" binding:"required"`
}

func PalindromeSteps(c *gin.Context) {
	var req PalindromeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.S) > 512 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "string too long (max 512)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildPalindromeSteps(req.S)})
}

func isAlnum(r rune) bool {
	return unicode.IsLetter(r) || unicode.IsDigit(r)
}

func buildPalindromeSteps(s string) []gin.H {
	steps := []gin.H{}
	chars := []rune(s)
	left, right := 0, len(chars)-1

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"left": left, "right": right, "lChar": nil, "rChar": nil,
		"icon":   "rocket-bold",
		"msg":    fmt.Sprintf("Initialize: left=0, right=%d", right),
		"detail": fmt.Sprintf(`Input: "%s"  (%d chars)`, s, len(chars)),
		"result": nil,
	})

	for left < right {
		lCh, rCh := chars[left], chars[right]

		steps = append(steps, gin.H{
			"phase": "check_loop", "line": "check_loop",
			"left": left, "right": right, "lChar": string(lCh), "rChar": string(rCh),
			"icon":   "refresh-bold",
			"msg":    fmt.Sprintf("Loop: left(%d) < right(%d) ✓", left, right),
			"detail": fmt.Sprintf("s[%d]='%c'  s[%d]='%c'", left, lCh, right, rCh),
			"result": nil,
		})

		steps = append(steps, gin.H{
			"phase": "read_runes", "line": "read_runes",
			"left": left, "right": right, "lChar": string(lCh), "rChar": string(rCh),
			"icon":   "text-bold",
			"msg":    fmt.Sprintf("Read runes: lRune='%c'  rRune='%c'", lCh, rCh),
			"detail": fmt.Sprintf("lRune=rune(s[%d])  rRune=rune(s[%d])", left, right),
			"result": nil,
		})

		if !isAlnum(lCh) {
			left++
			steps = append(steps, gin.H{
				"phase": "skip_left", "line": "skip_left",
				"left": left, "right": right, "lChar": string(lCh), "rChar": string(rCh),
				"icon":   "skip-next-bold",
				"msg":    fmt.Sprintf("'%c' is not alphanumeric → skip left, left++ → %d", lCh, left),
				"detail": `!IsLetter && !IsDigit → left++; continue`,
				"result": nil,
			})
			continue
		}

		if !isAlnum(rCh) {
			right--
			steps = append(steps, gin.H{
				"phase": "skip_right", "line": "skip_right",
				"left": left, "right": right, "lChar": string(lCh), "rChar": string(rCh),
				"icon":   "skip-previous-bold",
				"msg":    fmt.Sprintf("'%c' is not alphanumeric → skip right, right-- → %d", rCh, right),
				"detail": `!IsLetter && !IsDigit → right--; continue`,
				"result": nil,
			})
			continue
		}

		lLow := unicode.ToLower(lCh)
		rLow := unicode.ToLower(rCh)

		steps = append(steps, gin.H{
			"phase": "compare", "line": "compare",
			"left":  left, "right": right,
			"lChar": string(lCh), "rChar": string(rCh),
			"lLow":  string(lLow), "rLow": string(rLow),
			"icon":   "eye-bold",
			"msg":    fmt.Sprintf("Compare: toLower('%c')='%c'  vs  toLower('%c')='%c'", lCh, lLow, rCh, rLow),
			"detail": fmt.Sprintf("unicode.ToLower(lRune) %s unicode.ToLower(rRune)", eqStr(lLow == rLow)),
			"result": nil,
		})

		if lLow != rLow {
			steps = append(steps, gin.H{
				"phase": "mismatch", "line": "mismatch",
				"left":  left, "right": right,
				"lChar": string(lCh), "rChar": string(rCh),
				"lLow":  string(lLow), "rLow": string(rLow),
				"icon":   "close-circle-bold",
				"msg":    fmt.Sprintf("Mismatch! '%c' ≠ '%c' → return false", lLow, rLow),
				"detail": `Characters differ — not a palindrome`,
				"result": false,
			})
			steps = append(steps, gin.H{
				"phase": "done_false", "line": "done_false",
				"left":  left, "right": right,
				"lChar": string(lCh), "rChar": string(rCh),
				"icon":   "flag-bold",
				"msg":    `Done! isPalindrome = false`,
				"detail": `return false`,
				"result": false,
			})
			return steps
		}

		steps = append(steps, gin.H{
			"phase": "match", "line": "match",
			"left":  left, "right": right,
			"lChar": string(lCh), "rChar": string(rCh),
			"lLow":  string(lLow), "rLow": string(rLow),
			"icon":   "check-circle-bold",
			"msg":    fmt.Sprintf("Match! '%c' == '%c' → left++, right--", lLow, rLow),
			"detail": `Advance both pointers inward`,
			"result": nil,
		})
		left++
		right--
	}

	steps = append(steps, gin.H{
		"phase": "check_loop", "line": "check_loop",
		"left": left, "right": right, "lChar": nil, "rChar": nil,
		"icon":   "close-circle-bold",
		"msg":    fmt.Sprintf("Loop ends: left(%d) ≥ right(%d) — all chars checked", left, right),
		"detail": `Pointers met — no mismatch found`,
		"result": nil,
	})

	steps = append(steps, gin.H{
		"phase": "done_true", "line": "done_true",
		"left": left, "right": right, "lChar": nil, "rChar": nil,
		"icon":   "flag-bold",
		"msg":    `Done! isPalindrome = true`,
		"detail": `return true`,
		"result": true,
	})
	return steps
}

func eqStr(eq bool) string {
	if eq {
		return "=="
	}
	return "!="
}
