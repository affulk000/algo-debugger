package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SudokuRequest struct {
	Board [][]string `json:"board" binding:"required"`
}

func SudokuSteps(c *gin.Context) {
	var req SudokuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Board) != 9 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "board must be 9 rows"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildSudokuSteps(req.Board)})
}

func buildSudokuSteps(board [][]string) []gin.H {
	steps := []gin.H{}

	rows := make([][]bool, 9)
	cols := make([][]bool, 9)
	boxes := make([][]bool, 9)
	for i := range rows {
		rows[i] = make([]bool, 9)
		cols[i] = make([]bool, 9)
		boxes[i] = make([]bool, 9)
	}

	snap := func() gin.H {
		rowsCp := make([][]bool, 9)
		colsCp := make([][]bool, 9)
		boxesCp := make([][]bool, 9)
		for i := range rows {
			rowsCp[i] = make([]bool, 9)
			copy(rowsCp[i], rows[i])
			colsCp[i] = make([]bool, 9)
			copy(colsCp[i], cols[i])
			boxesCp[i] = make([]bool, 9)
			copy(boxesCp[i], boxes[i])
		}
		return gin.H{"rows": rowsCp, "cols": colsCp, "boxes": boxesCp}
	}

	s := snap()
	s["phase"] = "init"
	s["line"] = "init"
	s["r"] = nil
	s["c"] = nil
	s["num"] = nil
	s["boxIndex"] = nil
	s["conflict"] = false
	s["conflictIn"] = nil
	s["icon"] = "rocket-bold"
	s["msg"] = "Init: rows, cols, boxes all false"
	s["detail"] = "9×9 boolean arrays for row / col / 3×3 box tracking"
	s["result"] = nil
	steps = append(steps, s)

	for r := 0; r < 9; r++ {
		for c := 0; c < 9; c++ {
			ch := board[r][c]

			if ch == "." {
				s := snap()
				s["phase"] = "skip"
				s["line"] = "skip"
				s["r"] = r
				s["c"] = c
				s["num"] = nil
				s["boxIndex"] = nil
				s["conflict"] = false
				s["conflictIn"] = nil
				s["icon"] = "forbidden-circle-bold"
				s["msg"] = fmt.Sprintf("(%d,%d) = '.' → skip", r, c)
				s["detail"] = "Empty cell — nothing to validate"
				s["result"] = nil
				steps = append(steps, s)
				continue
			}

			num := int(ch[0] - '1')
			boxIndex := (r/3)*3 + c/3

			readSnap := snap()
			readSnap["phase"] = "read"
			readSnap["line"] = "read"
			readSnap["r"] = r
			readSnap["c"] = c
			readSnap["num"] = num
			readSnap["boxIndex"] = boxIndex
			readSnap["conflict"] = false
			readSnap["conflictIn"] = nil
			readSnap["icon"] = "magnifer-bold"
			readSnap["msg"] = fmt.Sprintf("(%d,%d) = '%s'  num=%d  boxIndex=%d", r, c, ch, num, boxIndex)
			readSnap["detail"] = fmt.Sprintf("row=%d, col=%d, box=%d  (num = '%s'-'1' = %d)", r, c, boxIndex, ch, num)
			readSnap["result"] = nil
			steps = append(steps, readSnap)

			rowConflict := rows[r][num]
			colConflict := cols[c][num]
			boxConflict := boxes[boxIndex][num]
			conflict := rowConflict || colConflict || boxConflict
			conflictIn := ""
			if rowConflict {
				conflictIn = "row"
			} else if colConflict {
				conflictIn = "col"
			} else if boxConflict {
				conflictIn = "box"
			}

			if conflict {
				conflSnap := snap()
				conflSnap["phase"] = "conflict"
				conflSnap["line"] = "conflict"
				conflSnap["r"] = r
				conflSnap["c"] = c
				conflSnap["num"] = num
				conflSnap["boxIndex"] = boxIndex
				conflSnap["conflict"] = true
				conflSnap["conflictIn"] = conflictIn
				conflSnap["icon"] = "close-circle-bold"
				conflSnap["msg"] = fmt.Sprintf("CONFLICT! %s in %s already has %s", ch, conflictIn, ch)
				conflSnap["detail"] = fmt.Sprintf("Duplicate '%s' in %s %d", ch, conflictIn, r)
				conflSnap["result"] = false
				steps = append(steps, conflSnap)

				doneSnap := snap()
				doneSnap["phase"] = "done_false"
				doneSnap["line"] = "done_false"
				doneSnap["r"] = r
				doneSnap["c"] = c
				doneSnap["num"] = num
				doneSnap["boxIndex"] = boxIndex
				doneSnap["conflict"] = true
				doneSnap["conflictIn"] = conflictIn
				doneSnap["icon"] = "flag-bold"
				doneSnap["msg"] = "Done! isValidSudoku = false"
				doneSnap["detail"] = "return false"
				doneSnap["result"] = false
				steps = append(steps, doneSnap)
				return steps
			}

			rows[r][num] = true
			cols[c][num] = true
			boxes[boxIndex][num] = true

			markSnap := snap()
			markSnap["phase"] = "mark"
			markSnap["line"] = "mark"
			markSnap["r"] = r
			markSnap["c"] = c
			markSnap["num"] = num
			markSnap["boxIndex"] = boxIndex
			markSnap["conflict"] = false
			markSnap["conflictIn"] = nil
			markSnap["icon"] = "check-circle-bold"
			markSnap["msg"] = fmt.Sprintf("Mark '%s': rows[%d][%d]=cols[%d][%d]=boxes[%d][%d]=true", ch, r, num, c, num, boxIndex, num)
			markSnap["detail"] = "No conflict — record presence"
			markSnap["result"] = nil
			steps = append(steps, markSnap)
		}
	}

	doneSnap := snap()
	doneSnap["phase"] = "done_true"
	doneSnap["line"] = "done_true"
	doneSnap["r"] = nil
	doneSnap["c"] = nil
	doneSnap["num"] = nil
	doneSnap["boxIndex"] = nil
	doneSnap["conflict"] = false
	doneSnap["conflictIn"] = nil
	doneSnap["icon"] = "flag-bold"
	doneSnap["msg"] = "Done! isValidSudoku = true"
	doneSnap["detail"] = "return true"
	doneSnap["result"] = true
	steps = append(steps, doneSnap)
	return steps
}
