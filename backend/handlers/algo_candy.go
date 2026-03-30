package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CandyRequest struct {
	Ratings []int `json:"ratings" binding:"required"`
}

func CandySteps(c *gin.Context) {
	var req CandyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Ratings) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ratings must not be empty"})
		return
	}
	if len(req.Ratings) > 64 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ratings too large (max 64)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildCandySteps(req.Ratings)})
}

func buildCandySteps(ratings []int) []gin.H {
	steps := []gin.H{}
	n := len(ratings)
	candies := make([]int, n)
	for i := range candies {
		candies[i] = 1
	}

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"candies": copySlice(candies), "activeIdx": nil, "passDir": nil, "total": nil,
		"icon": "rocket-bold",
		"msg":    `Init: give every child 1 candy`,
		"detail": fmt.Sprintf("candies = [%s]", joinInts(candies)),
		"result": nil,
	})

	// Left → right pass
	for i := 1; i < n; i++ {
		ratingUp := ratings[i] > ratings[i-1]
		phase := "ltr_skip"
		line := "ltr_check"
		icon := "minus-bold"
		var msg string
		if ratingUp {
			phase = "ltr_update"
			line = "ltr_update"
			icon = "arrow-up-bold"
			msg = fmt.Sprintf("L→R [%d]: ratings[%d](%d) > ratings[%d](%d) → candies[%d] = candies[%d]+1 = %d",
				i, i, ratings[i], i-1, ratings[i-1], i, i-1, candies[i-1]+1)
		} else {
			msg = fmt.Sprintf("L→R [%d]: ratings[%d](%d) ≤ ratings[%d](%d) → keep %d",
				i, i, ratings[i], i-1, ratings[i-1], candies[i])
		}
		detail := "Must have more than left neighbor"
		if !ratingUp {
			detail = "No left-neighbor constraint triggered"
		}
		if ratingUp {
			candies[i] = candies[i-1] + 1
		}
		steps = append(steps, gin.H{
			"phase": phase, "line": line,
			"candies": copySlice(candies), "activeIdx": i, "passDir": "ltr", "total": nil,
			"icon": icon, "msg": msg, "detail": detail,
			"result": nil,
		})
	}

	// Right → left pass
	for i := n - 2; i >= 0; i-- {
		ratingUp := ratings[i] > ratings[i+1]
		needsMore := ratingUp && candies[i] <= candies[i+1]

		var phase, line, icon, msg, detail string
		if !ratingUp {
			phase = "rtl_skip"
			line = "rtl_check"
			icon = "minus-bold"
			msg = fmt.Sprintf("R→L [%d]: ratings[%d](%d) ≤ ratings[%d](%d) → keep %d",
				i, i, ratings[i], i+1, ratings[i+1], candies[i])
			detail = "No right-neighbor constraint"
		} else if needsMore {
			phase = "rtl_update"
			line = "rtl_update"
			icon = "arrow-up-bold"
			msg = fmt.Sprintf("R→L [%d]: candies[%d](%d) ≤ candies[%d](%d) → update to %d",
				i, i, candies[i], i+1, candies[i+1], candies[i+1]+1)
			detail = fmt.Sprintf("ratings[%d] > ratings[%d], checking candies constraint", i, i+1)
		} else {
			phase = "rtl_skip"
			line = "rtl_skip"
			icon = "check-circle-bold"
			msg = fmt.Sprintf("R→L [%d]: ratings higher but candies[%d](%d) > candies[%d](%d) — already satisfied",
				i, i, candies[i], i+1, candies[i+1])
			detail = fmt.Sprintf("ratings[%d] > ratings[%d], checking candies constraint", i, i+1)
		}
		if needsMore {
			candies[i] = candies[i+1] + 1
		}
		steps = append(steps, gin.H{
			"phase": phase, "line": line,
			"candies": copySlice(candies), "activeIdx": i, "passDir": "rtl", "total": nil,
			"icon": icon, "msg": msg, "detail": detail,
			"result": nil,
		})
	}

	// Sum pass
	total := 0
	for i := 0; i < n; i++ {
		total += candies[i]
		steps = append(steps, gin.H{
			"phase": "sum", "line": "sum",
			"candies": copySlice(candies), "activeIdx": i, "passDir": "sum", "total": total,
			"icon": "calculator-minimalistic-bold",
			"msg":    fmt.Sprintf("Sum [%d]: total += %d → total = %d", i, candies[i], total),
			"detail": fmt.Sprintf("candies[%d] = %d", i, candies[i]),
			"result": nil,
		})
	}

	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"candies": copySlice(candies), "activeIdx": nil, "passDir": nil, "total": total,
		"icon": "flag-bold",
		"msg":    fmt.Sprintf("Done! Total candies = %d", total),
		"detail": fmt.Sprintf("return %d", total),
		"result": total,
	})
	return steps
}
