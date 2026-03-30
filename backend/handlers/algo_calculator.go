package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CalculatorRequest struct {
	S string `json:"s" binding:"required"`
}

func CalculatorSteps(c *gin.Context) {
	var req CalculatorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.S) > 256 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "expression too long (max 256)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildCalculatorSteps(req.S)})
}

func buildCalculatorSteps(s string) []gin.H {
	steps := []gin.H{}
	n := len(s)
	stack := []int{}
	result := 0
	sign := 1

	snap := func(phase, line string, i int, char interface{}, numVal interface{}, msg, detail string, extra gin.H) gin.H {
		stackCopy := copySlice(stack)
		h := gin.H{
			"phase": phase, "line": line,
			"s": s, "i": i, "char": char, "sign": sign,
			"stack": stackCopy,
			"numVal": numVal,
			"icon": map[string]string{
				"open_paren":  "add-square-bold",
				"close_paren": "close-square-bold",
				"digit":       "calculator-bold",
				"done":        "flag-bold",
			}[phase],
			"msg": msg, "detail": detail, "result_final": nil,
		}
		if h["icon"] == nil {
			h["icon"] = "arrow-right-bold"
		}
		for k, v := range extra {
			h[k] = v
		}
		return h
	}

	steps = append(steps, snap("init", "init", -1, nil, nil,
		`Init: result=0, sign=+1, stack=[]`,
		fmt.Sprintf(`Start scanning "%s"`, s), gin.H{}))

	i := 0
	for i < n {
		ch := s[i]

		if ch == ' ' {
			i++
			continue
		}

		if ch >= '0' && ch <= '9' {
			num := 0
			numStart := i
			for i < n && s[i] >= '0' && s[i] <= '9' {
				num = num*10 + int(s[i]-'0')
				i++
			}
			prevResult := result
			result += sign * num
			signStr := "+"
			if sign < 0 {
				signStr = "−"
			}
			steps = append(steps, snap("digit", "digit", i-1, s[numStart:i], num,
				fmt.Sprintf(`Number "%d":  result = %d %s %d = %d`, num, prevResult, signStr, num, result),
				fmt.Sprintf(`sign=%d  num=%d`, sign, num),
				gin.H{"numStart": numStart, "numEnd": i - 1}))
			i-- // compensate for outer i++
		} else if ch == '+' {
			sign = 1
			steps = append(steps, snap("plus", "plus", i, "+", nil,
				`'+' → sign = +1`, `Next number adds`, gin.H{}))
		} else if ch == '-' {
			sign = -1
			steps = append(steps, snap("minus", "minus", i, "-", nil,
				`'-' → sign = −1`, `Next number subtracts`, gin.H{}))
		} else if ch == '(' {
			savedResult := result
			savedSign := sign
			stack = append(stack, result, sign)
			result = 0
			sign = 1
			signStr := "+1"
			if savedSign < 0 {
				signStr = "-1"
			}
			steps = append(steps, snap("open_paren", "open_paren", i, "(", nil,
				fmt.Sprintf("'(' → push {result:%d, sign:%s} → reset scope", savedResult, signStr),
				fmt.Sprintf("stack depth: %d frame(s)", len(stack)/2), gin.H{}))
		} else if ch == ')' {
			prevSign := stack[len(stack)-1]
			prevResult := stack[len(stack)-2]
			inner := result
			stack = stack[:len(stack)-2]
			result = prevResult + prevSign*inner
			prevSignStr := "+1"
			if prevSign < 0 {
				prevSignStr = "-1"
			}
			steps = append(steps, snap("close_paren", "close_paren", i, ")", nil,
				fmt.Sprintf("')' → %d + (%s × %d) = %d", prevResult, prevSignStr, inner, result),
				fmt.Sprintf("prevResult=%d  prevSign=%s  inner=%d", prevResult, prevSignStr, inner), gin.H{}))
		}
		i++
	}

	done := snap("done", "done", n, nil, nil,
		fmt.Sprintf("Done! return %d", result),
		fmt.Sprintf("return %d", result), gin.H{})
	done["result_final"] = result
	steps = append(steps, done)
	return steps
}
