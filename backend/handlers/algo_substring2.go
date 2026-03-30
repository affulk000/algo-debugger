package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Substring2Request struct {
	S     string   `json:"s"     binding:"required"`
	Words []string `json:"words" binding:"required"`
}

func Substring2Steps(c *gin.Context) {
	var req Substring2Request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.S) > 1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "s too long (max 1024)"})
		return
	}
	if len(req.Words) == 0 || len(req.Words) > 64 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "words must be 1–64 items"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildSubstring2Steps(req.S, req.Words)})
}

func buildSubstring2Steps(s string, words []string) []gin.H {
	steps := []gin.H{}
	if s == "" || len(words) == 0 {
		steps = append(steps, gin.H{"phase": "done", "line": "done", "results": []int{}})
		return steps
	}

	wordLen := len(words[0])
	numWords := len(words)
	counts := map[string]int{}
	for _, w := range words {
		counts[w]++
	}
	results := []int{}

	countsH := stringIntMapH(counts)

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"i": nil, "j": nil, "left": nil, "count": 0,
		"currCounts": gin.H{}, "counts": countsH,
		"windowWords": []string{}, "results": []int{},
		"word": nil, "leftWord": nil,
		"icon": "rocket-bold",
		"msg":    fmt.Sprintf("Init: wordLen=%d, numWords=%d", wordLen, numWords),
		"detail": fmt.Sprintf("counts = { %s }", fmtMapH(countsH)),
		"result": nil,
	})

	for i := 0; i < wordLen; i++ {
		left := i
		count := 0
		currCounts := map[string]int{}

		steps = append(steps, gin.H{
			"phase": "outer_loop", "line": "outer_loop",
			"i": i, "j": nil, "left": left, "count": count,
			"currCounts": gin.H{}, "counts": countsH,
			"windowWords": []string{}, "results": copyIntSlice(results),
			"word": nil, "leftWord": nil,
			"icon": "refresh-bold",
			"msg":    fmt.Sprintf("Outer loop: i=%d  (offset %d/%d)", i, i, wordLen-1),
			"detail": fmt.Sprintf("Reset window — left=%d, count=0", left),
			"result": nil,
		})

		for j := i; j <= len(s)-wordLen; j += wordLen {
			word := s[j : j+wordLen]

			steps = append(steps, gin.H{
				"phase": "inner_loop", "line": "inner_loop",
				"i": i, "j": j, "left": left, "count": count,
				"currCounts": stringIntMapH(currCounts), "counts": countsH,
				"windowWords": windowWords(s, left, count, wordLen),
				"results": copyIntSlice(results),
				"word": word, "leftWord": nil,
				"icon": "magnifer-bold",
				"msg":    fmt.Sprintf(`j=%d: word = s[%d..%d] = "%s"`, j, j, j+wordLen, word),
				"detail": fmt.Sprintf("window: [%d..%d], count=%d", left, j+wordLen, count),
				"result": nil,
			})

			if _, inDict := counts[word]; inDict {
				currCounts[word]++
				count++

				steps = append(steps, gin.H{
					"phase": "in_dict", "line": "in_dict",
					"i": i, "j": j, "left": left, "count": count,
					"currCounts": stringIntMapH(currCounts), "counts": countsH,
					"windowWords": []string{},
					"results": copyIntSlice(results),
					"word": word, "leftWord": nil,
					"icon": "check-circle-bold",
					"msg":    fmt.Sprintf(`"%s" in dict — currCounts["%s"]=%d, count=%d`, word, word, currCounts[word], count),
					"detail": `Valid word — extend window`,
					"result": nil,
				})

				for currCounts[word] > counts[word] {
					leftWord := s[left : left+wordLen]
					currCounts[leftWord]--
					count--
					left += wordLen

					steps = append(steps, gin.H{
						"phase": "shrink", "line": "shrink",
						"i": i, "j": j, "left": left, "count": count,
						"currCounts": stringIntMapH(currCounts), "counts": countsH,
						"windowWords": []string{},
						"results": copyIntSlice(results),
						"word": word, "leftWord": leftWord,
						"icon": "arrow-right-bold",
						"msg":    fmt.Sprintf(`Too many "%s" — evict "%s", left→%d, count=%d`, word, leftWord, left, count),
						"detail": fmt.Sprintf(`currCounts["%s"]-- → %d`, leftWord, currCounts[leftWord]),
						"result": nil,
					})
				}

				found := count == numWords
				if found {
					results = append(results, left)
				}
				ww := []string{}
				if found {
					ww = windowWords(s, left, numWords, wordLen)
				}
				foundPhase := "no_found"
				if found {
					foundPhase = "found"
				}
				steps = append(steps, gin.H{
					"phase": foundPhase, "line": foundPhase,
					"i": i, "j": j, "left": left, "count": count,
					"currCounts": stringIntMapH(currCounts), "counts": countsH,
					"windowWords": ww,
					"results": copyIntSlice(results),
					"word": word, "leftWord": nil,
					"icon": map[bool]string{true: "crown-bold", false: "close-circle-bold"}[found],
					"msg": map[bool]string{
						true:  fmt.Sprintf("✓ Found! count(%d) == numWords(%d) → append left=%d", count, numWords, left),
						false: fmt.Sprintf("count(%d) ≠ numWords(%d) — not yet", count, numWords),
					}[found],
					"detail": map[bool]string{
						true:  fmt.Sprintf("results = [%s]", joinInts(results)),
						false: fmt.Sprintf("Need %d more words", numWords-count),
					}[found],
					"result": nil,
				})
			} else {
				currCounts = map[string]int{}
				count = 0
				left = j + wordLen

				steps = append(steps, gin.H{
					"phase": "reset", "line": "reset",
					"i": i, "j": j, "left": left, "count": count,
					"currCounts": gin.H{}, "counts": countsH,
					"windowWords": []string{},
					"results": copyIntSlice(results),
					"word": word, "leftWord": nil,
					"icon": "close-circle-bold",
					"msg":    fmt.Sprintf(`"%s" NOT in dict — reset window, left=%d`, word, left),
					"detail": `currCounts cleared, count=0`,
					"result": nil,
				})
			}
		}
	}

	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"i": nil, "j": nil, "left": nil, "count": 0,
		"currCounts": gin.H{}, "counts": countsH,
		"windowWords": []string{}, "results": copyIntSlice(results),
		"word": nil, "leftWord": nil,
		"icon": "flag-bold",
		"msg":    fmt.Sprintf("Done! Results = [%s]", joinInts(results)),
		"detail": fmt.Sprintf("return [%s]", joinInts(results)),
		"result": copyIntSlice(results),
	})
	return steps
}

func windowWords(s string, left, count, wordLen int) []string {
	ww := make([]string, 0, count)
	for k := 0; k < count; k++ {
		start := left + k*wordLen
		if start+wordLen <= len(s) {
			ww = append(ww, s[start:start+wordLen])
		}
	}
	return ww
}

func stringIntMapH(m map[string]int) gin.H {
	h := make(gin.H, len(m))
	for k, v := range m {
		h[k] = v
	}
	return h
}

func fmtMapH(h gin.H) string {
	parts := []string{}
	for k, v := range h {
		parts = append(parts, fmt.Sprintf(`"%s":%v`, k, v))
	}
	return joinStrings(parts)
}

func joinStrings(s []string) string {
	result := ""
	for i, v := range s {
		if i > 0 {
			result += ", "
		}
		result += v
	}
	return result
}

func copyIntSlice(s []int) []int {
	out := make([]int, len(s))
	copy(out, s)
	return out
}
