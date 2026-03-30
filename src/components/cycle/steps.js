// Build linked list nodes array with optional tail-to-index cycle
// Returns array of { id, val, nextId } and whether it has a cycle
function buildList(vals, tailIdx) {
  const nodes = vals.map((v, i) => ({ id: i, val: v, nextId: i < vals.length - 1 ? i + 1 : -1 }));
  if (tailIdx >= 0 && tailIdx < vals.length) {
    nodes[vals.length - 1].nextId = tailIdx; // last node points back
  }
  return nodes;
}

export function buildSteps(vals, tailIdx) {
  const steps = [];
  const nodes = buildList(vals, tailIdx);
  const hasCycle = tailIdx >= 0 && tailIdx < vals.length;

  const snap = (slowId, fastId, phase, line, msg, detail, met = false) => ({
    phase, line,
    nodes: nodes.map(n => ({ ...n })),
    slowId, fastId,
    tailIdx,
    met,
    icon: phase === "met" ? "check-circle-bold"
        : phase === "no_cycle" ? "close-circle-bold"
        : phase === "advance" ? "double-alt-arrow-right-bold"
        : "flag-bold",
    msg, detail,
    result: null,
  });

  // nil check
  if (vals.length === 0) {
    steps.push({ ...snap(null, null, "nil_check", "nil_check",
      "head == nil → return false", "Empty list"), result: false });
    steps[steps.length-1].result = false;
    return steps;
  }
  if (vals.length === 1 && tailIdx < 0) {
    steps.push({ ...snap(0, null, "nil_check", "nil_check",
      "head.Next == nil → return false", "Single node, no next"), result: false });
    steps[steps.length-1].result = false;
    return steps;
  }

  steps.push(snap(0, 1, "init", "init",
    `slow = head (node ${vals[0]}),  fast = head.Next (node ${vals[1]})`,
    `Initialize two pointers`));

  // Simulate Floyd's algorithm — cap at 200 steps to avoid infinite loop
  let slowId = 0;
  let fastId = 1;
  let iter = 0;

  while (iter++ < 200) {
    // Check loop condition: fast != nil && fast.Next != nil
    const fastNode = nodes[fastId];
    const fastNextId = fastNode ? fastNode.nextId : -1;

    if (fastId === -1 || fastNextId === -1) {
      steps.push(snap(slowId, fastId, "no_cycle", "no_cycle",
        `fast${fastId === -1 ? " == nil" : ".Next == nil"} → loop ends → return false`,
        `No cycle detected`));
      steps[steps.length-1].result = false;
      return steps;
    }

    // Check if slow == fast (meeting point)
    if (slowId === fastId) {
      steps.push({ ...snap(slowId, fastId, "met", "met",
        `slow == fast at node ${vals[slowId]} → cycle detected! return true`,
        `Pointers met at index ${slowId}`), met: true });
      steps[steps.length-1].result = true;
      return steps;
    }

    steps.push(snap(slowId, fastId, "check_meet",  "check_meet",
      `slow(${vals[slowId]}) ≠ fast(${vals[fastId]}) → advance`,
      `slow@${slowId}  fast@${fastId}`));

    // Advance
    const newSlowId = nodes[slowId].nextId;
    const newFastId = nodes[fastNextId] ? nodes[fastNextId].nextId : -1;

    steps.push(snap(newSlowId, newFastId, "advance", "advance",
      `slow → node ${newSlowId >= 0 ? vals[newSlowId] : "nil"},  fast → node ${newFastId >= 0 ? vals[newFastId] : "nil"}`,
      `slow.Next  |  fast.Next.Next`));

    slowId = newSlowId;
    fastId = newFastId;
  }

  return steps;
}
