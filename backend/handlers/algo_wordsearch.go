package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type WordSearchRequest struct {
	Board [][]string `json:"board" binding:"required"`
	Words []string   `json:"words" binding:"required"`
}

func WordSearchSteps(c *gin.Context) {
	var req WordSearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Board) == 0 || len(req.Board) > 20 || len(req.Board[0]) > 20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "board must be 1–20 rows/cols"})
		return
	}
	if len(req.Words) == 0 || len(req.Words) > 32 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "words must be 1–32"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"steps": buildWordSearchSteps(req.Board, req.Words)})
}

// wsPathEntry is a single step in a word-search DFS path.
type wsPathEntry struct {
	r, c   int
	nodeID int
}

func wsPathToH(path []wsPathEntry) []gin.H {
	out := make([]gin.H, len(path))
	for i, p := range path {
		out[i] = gin.H{"r": p.r, "c": p.c, "nodeId": p.nodeID}
	}
	return out
}

// trieNode is an in-memory trie node for word search.
type trieNode struct {
	id       int
	depth    int
	char     string
	word     string // non-empty at terminal nodes
	parentID int
	children map[string]*trieNode
}

func buildTrie(words []string) (*trieNode, []gin.H) {
	counter := 1
	root := &trieNode{id: 0, children: map[string]*trieNode{}}
	allNodes := []gin.H{{"id": 0, "depth": 0, "char": nil, "word": nil, "parentId": -1}}

	for _, w := range words {
		node := root
		for i, ch := range w {
			s := string(ch)
			if _, ok := node.children[s]; !ok {
				nn := &trieNode{
					id: counter, depth: i + 1, char: s,
					parentID: node.id, children: map[string]*trieNode{},
				}
				node.children[s] = nn
				allNodes = append(allNodes, gin.H{
					"id": counter, "depth": i + 1, "char": s, "word": nil, "parentId": node.id,
				})
				counter++
			}
			node = node.children[s]
		}
		node.word = w
		// Update the allNodes entry with the word
		for idx := range allNodes {
			if allNodes[idx]["id"] == node.id {
				allNodes[idx]["word"] = w
			}
		}
	}
	return root, allNodes
}

func cloneBoard(board [][]string) [][]string {
	cp := make([][]string, len(board))
	for i, row := range board {
		cp[i] = make([]string, len(row))
		copy(cp[i], row)
	}
	return cp
}

func buildWordSearchSteps(boardInput [][]string, words []string) []gin.H {
	steps := []gin.H{}
	root, allNodes := buildTrie(words)

	steps = append(steps, gin.H{
		"phase": "build_trie", "line": "build_trie",
		"board": cloneBoard(boardInput),
		"path": []gin.H{}, "r": nil, "c": nil,
		"trieAllNodes": allNodes,
		"trieActiveIds": []int{},
		"found": []string{},
		"icon": "database-bold",
		"msg":    fmt.Sprintf("Build trie from %d words: [%s]", len(words), quotedStringSlice(words)),
		"detail": fmt.Sprintf("%d trie nodes created", len(allNodes)-1),
		"result": nil,
	})

	board := cloneBoard(boardInput)
	found := []string{}
	m := len(board)
	n := len(board[0])

	type frame struct {
		r, c      int
		node      *trieNode
		path      []wsPathEntry
		boardSnap [][]string
		restore   bool
		origChar  string
	}

	// BFS-style DFS: push all starting cells
	callStack := []frame{}
	for i := m - 1; i >= 0; i-- {
		for j := n - 1; j >= 0; j-- {
			if _, ok := root.children[board[i][j]]; ok {
				callStack = append(callStack, frame{
					r: i, c: j, node: root,
					path: []wsPathEntry{},
					boardSnap: cloneBoard(board),
					restore: false,
				})
			}
		}
	}

	dirs := [][2]int{{0, 1}, {0, -1}, {1, 0}, {-1, 0}}

	safety := 0
	for len(callStack) > 0 && safety < 8000 {
		safety++
		f := callStack[len(callStack)-1]
		callStack = callStack[:len(callStack)-1]

		r, c := f.r, f.c

		if f.restore {
			f.boardSnap[r][c] = f.origChar
			activeIDs := make([]int, 0, len(f.path))
			for _, p := range f.path {
				activeIDs = append(activeIDs, p.nodeID)
			}
			steps = append(steps, gin.H{
				"phase": "restore", "line": "restore",
				"board": cloneBoard(f.boardSnap), "path": wsPathToH(f.path),
				"r": r, "c": c,
				"trieAllNodes": allNodes, "trieActiveIds": activeIDs,
				"found": copyStringSlice(found),
				"icon": "restart-bold",
				"msg":    fmt.Sprintf("Restore board[%d][%d] = '%s'", r, c, f.origChar),
				"detail": "Backtrack",
				"result": nil,
			})
			continue
		}

		ch := f.boardSnap[r][c]
		node, ok := f.node.children[ch]
		if !ok {
			steps = append(steps, gin.H{
				"phase": "no_match", "line": "no_match",
				"board": cloneBoard(f.boardSnap), "path": wsPathToH(f.path),
				"r": r, "c": c,
				"trieAllNodes": allNodes, "trieActiveIds": []int{},
				"found": copyStringSlice(found),
				"icon": "close-circle-bold",
				"msg":    fmt.Sprintf("board[%d][%d]='%s' not in trie — prune", r, c, ch),
				"detail": "No trie child for this character",
				"result": nil,
			})
			continue
		}

		newPath := append(append([]wsPathEntry{}, f.path...), wsPathEntry{r, c, node.id})
		activeIDs := make([]int, 0, len(newPath))
		for _, p := range newPath {
			activeIDs = append(activeIDs, p.nodeID)
		}

		steps = append(steps, gin.H{
			"phase": "dfs_enter", "line": "dfs_enter",
			"board": cloneBoard(f.boardSnap), "path": wsPathToH(newPath),
			"r": r, "c": c,
			"trieAllNodes": allNodes, "trieActiveIds": activeIDs,
			"found": copyStringSlice(found),
			"icon": "arrow-right-bold",
			"msg":    fmt.Sprintf("Enter (%d,%d) char='%s'  depth=%d", r, c, ch, node.depth),
			"detail": fmt.Sprintf("Trie node id=%d", node.id),
			"result": nil,
		})

		if node.word != "" && !containsStr(found, node.word) {
			found = append(found, node.word)
			steps = append(steps, gin.H{
				"phase": "found_word", "line": "found_word",
				"board": cloneBoard(f.boardSnap), "path": wsPathToH(newPath),
				"r": r, "c": c,
				"trieAllNodes": allNodes, "trieActiveIds": activeIDs,
				"found": copyStringSlice(found),
				"icon": "crown-bold",
				"msg":    fmt.Sprintf(`Found word: "%s"!`, node.word),
				"detail": fmt.Sprintf("found = [%s]", quotedStringSlice(found)),
				"result": nil,
			})
		}

		// Mark visited
		orig := f.boardSnap[r][c]
		f.boardSnap[r][c] = "#"

		// Push restore frame
		callStack = append(callStack, frame{
			r: r, c: c, node: node, path: append([]wsPathEntry{}, f.path...),
			boardSnap: f.boardSnap, restore: true, origChar: orig,
		})

		// Push neighbors
		for di := len(dirs) - 1; di >= 0; di-- {
			nr, nc := r+dirs[di][0], c+dirs[di][1]
			if nr < 0 || nc < 0 || nr >= m || nc >= n || f.boardSnap[nr][nc] == "#" {
				continue
			}
			callStack = append(callStack, frame{
				r: nr, c: nc, node: node,
				path:      append([]wsPathEntry{}, newPath...),
				boardSnap: f.boardSnap,
				restore:   false,
			})
		}
	}

	steps = append(steps, gin.H{
		"phase": "done", "line": "done",
		"board": cloneBoard(boardInput), "path": []gin.H{},
		"r": nil, "c": nil,
		"trieAllNodes": allNodes, "trieActiveIds": []int{},
		"found": copyStringSlice(found),
		"icon": "flag-bold",
		"msg":    fmt.Sprintf("Done! Found %d word(s): [%s]", len(found), quotedStringSlice(found)),
		"detail": fmt.Sprintf("return [%s]", quotedStringSlice(found)),
		"result": copyStringSlice(found),
	})
	return steps
}

func containsStr(s []string, v string) bool {
	for _, x := range s {
		if x == v {
			return true
		}
	}
	return false
}
