# Algo Debugger

By [Emmanuel Afful](https://github.com/affulk000)

A step-by-step algorithm visualizer. Each algorithm runs on a Go backend that computes every execution step — the frontend animates through them with synchronized code highlighting and data structure visualization.

---

## Algorithms

### Arrays & Hash Maps
| Function | Technique | Complexity |
|---|---|---|
| `twoSum()` | Hash map | O(n) |
| `twoSum II()` | Two pointer | O(n) |
| `maxArea()` | Two pointer | O(n) |
| `isPalindrome()` | Two pointer | O(n) |
| `reverseWords()` | Two pointer | O(n) |
| `longestConsec()` | Hash set | O(n) |
| `isValidSudoku()` | Hash set | O(1) |
| `maxProfit()` | State machine | O(n) |

### Sliding Window
| Function | Technique | Complexity |
|---|---|---|
| `longestSubstr()` | Sliding window | O(n) |
| `findSubstring()` | Sliding window | O(n·k) |

### Stack & Greedy
| Function | Technique | Complexity |
|---|---|---|
| `simplifyPath()` | Stack | O(n) |
| `calculate()` | Stack | O(n) |
| `candy()` | Greedy | O(n) |
| `minArrowShots()` | Greedy | O(n log n) |

### Graphs & BFS/DFS
| Function | Technique | Complexity |
|---|---|---|
| `maze BFS()` | BFS | O(m·n) |
| `snakesLadders()` | BFS | O(n²) |
| `numIslands()` | DFS flood-fill | O(m·n) |
| `findWords()` | Trie + DFS | O(m·n·4^L) |
| `hasCycle()` | Floyd slow/fast | O(n) |

### Dynamic Programming
| Function | Technique | Complexity |
|---|---|---|
| `lengthOfLIS()` | Patience sort | O(n log n) |
| `mergeSorted()` | Two pointer | O(m+n) |

### Rust
| Function | Technique | Complexity |
|---|---|---|
| `binarySearch()` | `let` · Binary search | O(log n) |
| `bubbleSort()` | `&mut Vec` · Bubble sort | O(n²) |

---

## Stack

**Frontend** — React 19, Vite, Iconify (Solar icons)
**Backend** — Go 1.25, Gin, PostgreSQL (pgx)
**Auth** — OAuth2 / OIDC with JWT refresh tokens

---

## How it works

Each algorithm has a corresponding Go handler in `backend/handlers/` that:

1. Receives input via `POST /algorithms/{name}/steps`
2. Runs the algorithm, recording a snapshot at every meaningful state change
3. Returns the full step array as JSON

The frontend `useBackendSteps` hook fetches the steps, then `useStepPlayer` drives playback. The code panel highlights the active line(s) using the `lineActive` map returned by `GET /algorithms/{name}/meta`.

---

## Running locally

**Backend**
```bash
cd backend
cp .env.example .env   # fill in DB_URL, OAuth credentials
go run .
```

**Frontend**
```bash
npm install
npm run dev
```

The frontend proxies to `http://localhost:8081` by default (`VITE_API_URL` in `.env`).

---

## Project structure

```
├── backend/
│   ├── handlers/
│   │   ├── algo_twosum.go      # one file per algorithm
│   │   ├── algo_meta.go        # presets + code lines + line mappings
│   │   ├── api.go              # saved runs CRUD
│   │   └── auth.go             # OAuth2 / JWT
│   ├── config/
│   ├── db/
│   ├── middleware/
│   └── models/
└── src/
    ├── components/
    │   ├── twosum/             # one folder per algorithm
    │   │   ├── TwoSum.jsx      # main component
    │   │   ├── SeenMap.jsx     # sub-visualizer
    │   │   └── CustomInput.jsx
    │   └── ui/                 # shared: CodePanel, Controls, PresetBar...
    ├── hooks/
    │   ├── useBackendSteps.js  # fetches steps from backend
    │   ├── useAlgoMeta.js      # fetches presets + code lines
    │   └── useStepPlayer.js    # playback state machine
    └── api.js
```
