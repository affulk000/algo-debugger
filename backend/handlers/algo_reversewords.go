package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"unicode"

	"github.com/gin-gonic/gin"
)

type ReverseWordsRequest struct {
	S string `json:"s" binding:"required"`
}

func ReverseWordsSteps(c *gin.Context) {
	var req ReverseWordsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.S) > 512 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "string too long (max 512)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildReverseWordsSteps(req.S)})
}

func buildReverseWordsSteps(s string) []gin.H {
	steps := []gin.H{}

	// Split on whitespace, filter empty
	rawWords := strings.FieldsFunc(s, unicode.IsSpace)
	words := make([]string, len(rawWords))
	copy(words, rawWords)

	quotedWords := func(ws []string) string {
		parts := make([]string, len(ws))
		for i, w := range ws {
			parts[i] = fmt.Sprintf(`"%s"`, w)
		}
		return "[" + strings.Join(parts, ", ") + "]"
	}

	left, right := 0, len(words)-1

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"words": copyStringSlice(words), "left": left, "right": right,
		"swapping": nil,
		"icon": "rocket-bold",
		"msg":    fmt.Sprintf(`Fields("%s") → %d words`, s, len(words)),
		"detail": fmt.Sprintf("%s   left=0  right=%d", quotedWords(words), right),
		"result": nil,
	})

	for left < right {
		steps = append(steps, gin.H{
			"phase": "swap", "line": "swap",
			"words": copyStringSlice(words), "left": left, "right": right,
			"swapping": []int{left, right},
			"icon": "transfer-horizontal-bold",
			"msg":    fmt.Sprintf(`Swap words[%d]="%s"  ↔  words[%d]="%s"`, left, words[left], right, words[right]),
			"detail": fmt.Sprintf("left=%d < right=%d → swap", left, right),
			"result": nil,
		})

		words[left], words[right] = words[right], words[left]
		left++
		right--

		steps = append(steps, gin.H{
			"phase": "swap", "line": "swap",
			"words": copyStringSlice(words), "left": left, "right": right,
			"swapping": nil,
			"icon": "check-circle-bold",
			"msg":    fmt.Sprintf("After swap → left=%d  right=%d", left, right),
			"detail": quotedWords(words),
			"result": nil,
		})
	}

	result := strings.Join(words, " ")
	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"words": copyStringSlice(words), "left": left, "right": right,
		"swapping": nil,
		"icon": "flag-bold",
		"msg":    fmt.Sprintf(`Done! Join with " " → "%s"`, result),
		"detail": fmt.Sprintf(`return "%s"`, result),
		"result": result,
	})
	return steps
}
