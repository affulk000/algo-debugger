package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type SimplifyRequest struct {
	Path string `json:"path" binding:"required"`
}

func SimplifySteps(c *gin.Context) {
	var req SimplifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Path) > 512 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "path too long (max 512)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildSimplifySteps(req.Path)})
}

func buildSimplifySteps(path string) []gin.H {
	steps := []gin.H{}
	parts := strings.Split(path, "/")
	stack := []string{}

	quotedParts := make([]string, len(parts))
	for i, p := range parts {
		quotedParts[i] = fmt.Sprintf(`"%s"`, p)
	}

	steps = append(steps, gin.H{
		"phase": "init", "line": "init",
		"parts": parts, "stack": []string{}, "currentPart": nil, "partIdx": nil,
		"icon": "rocket-bold",
		"msg":    fmt.Sprintf(`Split "%s" by "/"`, path),
		"detail": fmt.Sprintf("%d parts: [%s]", len(parts), strings.Join(quotedParts, ", ")),
		"result": nil,
	})

	for i, part := range parts {
		steps = append(steps, gin.H{
			"phase": "iter", "line": "iter",
			"parts": parts, "stack": copyStringSlice(stack), "currentPart": part, "partIdx": i,
			"icon": "arrow-right-bold",
			"msg":    fmt.Sprintf(`part = "%s"`, part),
			"detail": fmt.Sprintf("Iteration %d/%d", i+1, len(parts)),
			"result": nil,
		})

		if part == "" || part == "." {
			var skipMsg string
			if part == "" {
				skipMsg = `Skip ""  — empty segment (from // or leading/trailing /)`
			} else {
				skipMsg = `Skip "."  — current directory, no-op`
			}
			steps = append(steps, gin.H{
				"phase": "skip", "line": "skip",
				"parts": parts, "stack": copyStringSlice(stack), "currentPart": part, "partIdx": i,
				"icon": "forbidden-circle-bold",
				"msg":    skipMsg,
				"detail": `continue → next part`,
				"result": nil,
			})
			continue
		}

		if part == ".." {
			steps = append(steps, gin.H{
				"phase": "check_up", "line": "check_up",
				"parts": parts, "stack": copyStringSlice(stack), "currentPart": part, "partIdx": i,
				"icon": "arrow-up-bold",
				"msg":    `".." → go up one level`,
				"detail": fmt.Sprintf("stack length = %d", len(stack)),
				"result": nil,
			})

			if len(stack) > 0 {
				popped := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				steps = append(steps, gin.H{
					"phase": "pop", "line": "pop",
					"parts": parts, "stack": copyStringSlice(stack), "currentPart": part, "partIdx": i,
					"popped": popped,
					"icon": "alt-arrow-up-bold",
					"msg":    fmt.Sprintf(`Pop "%s" from stack`, popped),
					"detail": fmt.Sprintf("stack = [%s]", quotedStringSlice(stack)),
					"result": nil,
				})
			} else {
				steps = append(steps, gin.H{
					"phase": "pop_empty", "line": "pop_empty",
					"parts": parts, "stack": copyStringSlice(stack), "currentPart": part, "partIdx": i,
					"popped": nil,
					"icon": "close-circle-bold",
					"msg":    `".." at root — stack is empty, nothing to pop`,
					"detail": `Already at root "/"`,
					"result": nil,
				})
			}
		} else {
			stack = append(stack, part)
			steps = append(steps, gin.H{
				"phase": "push", "line": "push",
				"parts": parts, "stack": copyStringSlice(stack), "currentPart": part, "partIdx": i,
				"icon": "add-circle-bold",
				"msg":    fmt.Sprintf(`Push "%s" onto stack`, part),
				"detail": fmt.Sprintf("stack = [%s]", quotedStringSlice(stack)),
				"result": nil,
			})
		}
	}

	result := "/" + strings.Join(stack, "/")
	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"parts": parts, "stack": copyStringSlice(stack), "currentPart": nil, "partIdx": nil,
		"icon": "flag-bold",
		"msg":    fmt.Sprintf(`Join: "/" + "%s" = "%s"`, strings.Join(stack, "/"), result),
		"detail": fmt.Sprintf(`return "%s"`, result),
		"result": result,
	})
	return steps
}

func copyStringSlice(s []string) []string {
	out := make([]string, len(s))
	copy(out, s)
	return out
}

func quotedStringSlice(s []string) string {
	parts := make([]string, len(s))
	for i, v := range s {
		parts[i] = fmt.Sprintf(`"%s"`, v)
	}
	return strings.Join(parts, ", ")
}
