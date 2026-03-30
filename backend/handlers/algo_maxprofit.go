package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type MaxProfitRequest struct {
	Prices []int `json:"prices" binding:"required"`
}

func MaxProfitSteps(c *gin.Context) {
	var req MaxProfitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Prices) > 128 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "prices too large (max 128)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildMaxProfitSteps(req.Prices)})
}

func buildMaxProfitSteps(prices []int) []gin.H {
	steps := []gin.H{}

	if len(prices) == 0 {
		steps = append(steps, gin.H{
			"phase": "done", "line": "done", "prices": []int{}, "i": -1, "price": nil,
			"firstBuy": 0, "firstSell": 0, "secondBuy": 0, "secondSell": 0,
			"changed": []string{}, "icon": "flag-bold", "msg": "Empty → 0", "detail": "",
		})
		return steps
	}

	firstBuy := -prices[0]
	firstSell := 0
	secondBuy := -prices[0]
	secondSell := 0

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"prices": copySlice(prices), "i": 0, "price": prices[0],
		"firstBuy": firstBuy, "firstSell": firstSell, "secondBuy": secondBuy, "secondSell": secondSell,
		"changed": []string{"firstBuy", "secondBuy"},
		"icon": "arrow-right-bold",
		"msg":    fmt.Sprintf("Init: firstBuy=%d  firstSell=0  secondBuy=%d  secondSell=0", firstBuy, secondBuy),
		"detail": fmt.Sprintf("-prices[0] = %d", firstBuy),
		"result": nil,
	})

	for i := 1; i < len(prices); i++ {
		price := prices[i]

		steps = append(steps, gin.H{
			"phase": "scan", "line": "scan",
			"prices": copySlice(prices), "i": i, "price": price,
			"firstBuy": firstBuy, "firstSell": firstSell, "secondBuy": secondBuy, "secondSell": secondSell,
			"changed": []string{},
			"icon": "arrow-right-bold",
			"msg":    fmt.Sprintf("i=%d  price=%d", i, price),
			"detail": `Evaluate all 4 state transitions`,
			"result": nil,
		})

		changed := []string{}
		if firstBuy < -price {
			firstBuy = -price
			changed = append(changed, "firstBuy")
		}
		if len(changed) > 0 {
			steps = append(steps, gin.H{
				"phase": "update_fb", "line": "update_fb",
				"prices": copySlice(prices), "i": i, "price": price,
				"firstBuy": firstBuy, "firstSell": firstSell, "secondBuy": secondBuy, "secondSell": secondSell,
				"changed": copyStringSlice(changed),
				"icon": "refresh-bold",
				"msg":    fmt.Sprintf("firstBuy ← max(%d, %d) = %d  (best buy cost for txn 1)", firstBuy, -price, firstBuy),
				"detail": fmt.Sprintf("-price=%d", -price),
				"result": nil,
			})
			changed = changed[:0]
		}

		if firstSell < firstBuy+price {
			firstSell = firstBuy + price
			changed = append(changed, "firstSell")
		}
		steps = append(steps, gin.H{
			"phase": "update_fs", "line": "update_fs",
			"prices": copySlice(prices), "i": i, "price": price,
			"firstBuy": firstBuy, "firstSell": firstSell, "secondBuy": secondBuy, "secondSell": secondSell,
			"changed": copyStringSlice(changed),
			"icon": "refresh-bold",
			"msg":    fmt.Sprintf("firstSell ← max(%d, %d+%d) = %d  (best profit after txn 1)", firstSell, firstBuy, price, firstSell),
			"detail": fmt.Sprintf("firstBuy+price=%d", firstBuy+price),
			"result": nil,
		})
		changed = changed[:0]

		if secondBuy < firstSell-price {
			secondBuy = firstSell - price
			changed = append(changed, "secondBuy")
		}
		steps = append(steps, gin.H{
			"phase": "update_sb", "line": "update_sb",
			"prices": copySlice(prices), "i": i, "price": price,
			"firstBuy": firstBuy, "firstSell": firstSell, "secondBuy": secondBuy, "secondSell": secondSell,
			"changed": copyStringSlice(changed),
			"icon": "refresh-bold",
			"msg":    fmt.Sprintf("secondBuy ← max(%d, %d-%d) = %d  (re-invest txn 1 profit)", secondBuy, firstSell, price, secondBuy),
			"detail": fmt.Sprintf("firstSell-price=%d", firstSell-price),
			"result": nil,
		})
		changed = changed[:0]

		if secondSell < secondBuy+price {
			secondSell = secondBuy + price
			changed = append(changed, "secondSell")
		}
		steps = append(steps, gin.H{
			"phase": "update_ss", "line": "update_ss",
			"prices": copySlice(prices), "i": i, "price": price,
			"firstBuy": firstBuy, "firstSell": firstSell, "secondBuy": secondBuy, "secondSell": secondSell,
			"changed": copyStringSlice(changed),
			"icon": "refresh-bold",
			"msg":    fmt.Sprintf("secondSell ← max(%d, %d+%d) = %d  (total profit both txns)", secondSell, secondBuy, price, secondSell),
			"detail": fmt.Sprintf("secondBuy+price=%d", secondBuy+price),
			"result": nil,
		})
	}

	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"prices": copySlice(prices), "i": -1, "price": nil,
		"firstBuy": firstBuy, "firstSell": firstSell, "secondBuy": secondBuy, "secondSell": secondSell,
		"changed": []string{},
		"icon": "flag-bold",
		"msg":    fmt.Sprintf("Done! Max profit = %d", secondSell),
		"detail": fmt.Sprintf("return %d", secondSell),
		"result": secondSell,
	})
	return steps
}
