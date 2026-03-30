package handlers

import (
	"fmt"
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
)

type ConsecutiveRequest struct {
	Nums []int `json:"nums" binding:"required"`
}

func ConsecutiveSteps(c *gin.Context) {
	var req ConsecutiveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Nums) > 128 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nums too large (max 128)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildConsecutiveSteps(req.Nums)})
}

func buildConsecutiveSteps(nums []int) []gin.H {
	steps := []gin.H{}

	if len(nums) == 0 {
		steps = append(steps, gin.H{
			"phase": "done", "line": "done",
			"set": []int{}, "n": nil, "cur": nil, "streak": 0, "longest": 0,
			"activeSeq": []int{}, "allSeqs": []gin.H{},
			"icon": "flag-bold", "msg": "Empty input → return 0", "detail": "",
		})
		return steps
	}

	setMap := map[int]bool{}
	for _, n := range nums {
		setMap[n] = true
	}
	setKeys := make([]int, 0, len(setMap))
	for k := range setMap {
		setKeys = append(setKeys, k)
	}
	sort.Ints(setKeys)

	longest := 0
	allSeqs := []gin.H{}

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"set": copySlice(setKeys), "n": nil, "cur": nil, "streak": 0, "longest": longest,
		"activeSeq": []int{}, "allSeqs": []gin.H{},
		"icon": "rocket-bold",
		"msg":    fmt.Sprintf("Build set from [%s]", joinInts(nums)),
		"detail": fmt.Sprintf("%d numbers → %d unique: {%s}", len(nums), len(setKeys), joinInts(setKeys)),
		"result": nil,
	})

	for _, n := range setKeys {
		isStart := !setMap[n-1]

		phase := "skip"
		icon := "skip-previous-bold"
		if isStart {
			phase = "start"
			icon = "play-bold"
		}
		var startMsg string
		if isStart {
			startMsg = fmt.Sprintf("n=%d: (n-1)=%d not in set → sequence start!", n, n-1)
		} else {
			startMsg = fmt.Sprintf("n=%d: (n-1)=%d in set → skip (not a start)", n, n-1)
		}
		startDetail := fmt.Sprintf("Begin counting from %d", n)
		if !isStart {
			startDetail = fmt.Sprintf("%d exists — %d is mid-sequence", n-1, n)
		}

		steps = append(steps, gin.H{
			"phase": phase, "line": phase,
			"set": copySlice(setKeys), "n": n, "cur": nil, "streak": 0, "longest": longest,
			"activeSeq": []int{}, "allSeqs": copyAllSeqs(allSeqs),
			"icon": icon, "msg": startMsg, "detail": startDetail,
			"result": nil,
		})

		if !isStart {
			continue
		}

		cur := n
		streak := 1

		for setMap[cur+1] {
			activeSeq := makeSeq(n, streak)
			steps = append(steps, gin.H{
				"phase": "extend", "line": "extend",
				"set": copySlice(setKeys), "n": n, "cur": cur, "streak": streak, "longest": longest,
				"activeSeq": activeSeq,
				"allSeqs": copyAllSeqs(allSeqs),
				"icon": "arrow-right-bold",
				"msg":    fmt.Sprintf("%d in set → extend: cur=%d, streak=%d", cur+1, cur+1, streak+1),
				"detail": fmt.Sprintf("Sequence so far: [%s → %d]", joinInts(activeSeq), cur+1),
				"result": nil,
			})
			cur++
			streak++
		}

		seq := makeSeq(n, streak)
		steps = append(steps, gin.H{
			"phase": "break_loop", "line": "break_loop",
			"set": copySlice(setKeys), "n": n, "cur": cur, "streak": streak, "longest": longest,
			"activeSeq": seq,
			"allSeqs": copyAllSeqs(allSeqs),
			"icon": "close-circle-bold",
			"msg":    fmt.Sprintf("%d not in set → stop. Streak = %d", cur+1, streak),
			"detail": fmt.Sprintf("Completed sequence: [%s]", joinInts(seq)),
			"result": nil,
		})

		updated := streak > longest
		if updated {
			longest = streak
		}
		allSeqs = append(allSeqs, gin.H{"start": n, "seq": seq})

		updPhase := "no_update"
		updIcon := "close-circle-bold"
		if updated {
			updPhase = "update"
			updIcon = "crown-bold"
		}
		updMsg := fmt.Sprintf("streak(%d) ≤ longest(%d) — no update", streak, longest)
		if updated {
			updMsg = fmt.Sprintf("streak(%d) > longest → longest = %d ✓", streak, longest)
		}
		updDetail := fmt.Sprintf("Current best stays at %d", longest)
		if updated {
			updDetail = fmt.Sprintf("New best: %d", longest)
		}
		steps = append(steps, gin.H{
			"phase": updPhase, "line": updPhase,
			"set": copySlice(setKeys), "n": n, "cur": cur, "streak": streak, "longest": longest,
			"activeSeq": seq,
			"allSeqs": copyAllSeqs(allSeqs),
			"icon": updIcon, "msg": updMsg, "detail": updDetail,
			"result": nil,
		})
	}

	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"set": copySlice(setKeys), "n": nil, "cur": nil, "streak": 0, "longest": longest,
		"activeSeq": []int{}, "allSeqs": copyAllSeqs(allSeqs),
		"icon": "flag-bold",
		"msg":    fmt.Sprintf("Done! longestConsecutive = %d", longest),
		"detail": fmt.Sprintf("return %d", longest),
		"result": longest,
	})
	return steps
}

func makeSeq(start, length int) []int {
	s := make([]int, length)
	for i := range s {
		s[i] = start + i
	}
	return s
}

func copyAllSeqs(seqs []gin.H) []gin.H {
	out := make([]gin.H, len(seqs))
	copy(out, seqs)
	return out
}
