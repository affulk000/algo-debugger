export const PRESETS = [
  {
    label: "Has cycle",
    nodes: [3,2,0,-4],
    cyclePos: 1,   // tail connects back to index 1
    answer: "true",
  },
  {
    label: "No cycle",
    nodes: [1,2,3,4,5],
    cyclePos: -1,
    answer: "false",
  },
  {
    label: "Two nodes",
    nodes: [1,2],
    cyclePos: 0,
    answer: "true",
  },
  {
    label: "Self loop",
    nodes: [1],
    cyclePos: 0,
    answer: "true",
  },
];

export const CODE_LINES = [
  `func hasCycle(head *ListNode) bool {`,          // 0
  `    if head == nil || head.Next == nil {`,       // 1
  `        return false`,                          // 2
  `    }`,                                         // 3
  `    slow := head`,                              // 4
  `    fast := head.Next`,                         // 5
  `    for fast != nil && fast.Next != nil {`,     // 6
  `        if slow == fast {`,                     // 7
  `            return true`,                       // 8
  `        }`,                                     // 9
  `        slow = slow.Next`,                      // 10
  `        fast = fast.Next.Next`,                 // 11
  `    }`,                                         // 12
  `    return false`,                              // 13
  `}`,                                             // 14
];

export const LINE_ACTIVE = {
  init:       [4, 5],
  loop_check: [6],
  meet_check: [7],
  found:      [7, 8],
  advance:    [10, 11],
  done_false: [13],
};
