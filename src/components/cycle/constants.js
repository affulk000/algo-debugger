export const PRESETS = [
  { nodes: [3,2,0,-4], tail: 1,  label: "Has cycle",   answer: true  },
  { nodes: [1,2],      tail: 0,  label: "2-node cycle", answer: true  },
  { nodes: [1],        tail: -1, label: "Single node",  answer: false },
  { nodes: [1,2,3,4,5,6], tail: 3, label: "Long cycle", answer: true },
  { nodes: [1,2,3,4,5],   tail: -1, label: "No cycle",  answer: false },
];

export const CODE_LINES = [
  `func hasCycle(head *ListNode) bool {`,             // 0
  `    if head == nil || head.Next == nil {`,         // 1
  `        return false`,                             // 2
  `    }`,                                            // 3
  `    slow := head`,                                 // 4
  `    fast := head.Next`,                            // 5
  `    for fast != nil && fast.Next != nil {`,        // 6
  `        if slow == fast {`,                        // 7
  `            return true  // cycle!`,               // 8
  `        }`,                                        // 9
  `        slow = slow.Next`,                         // 10
  `        fast = fast.Next.Next`,                    // 11
  `    }`,                                            // 12
  `    return false  // no cycle`,                    // 13
  `}`,                                                // 14
];

export const LINE_ACTIVE = {
  nil_check:  [1, 2],
  init:       [4, 5],
  check_meet: [6, 7],
  met:        [7, 8],
  advance:    [10, 11],
  no_cycle:   [13],
  done_true:  [8],
  done_false: [13],
};
