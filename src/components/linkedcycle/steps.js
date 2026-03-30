export function buildSteps(nodeVals, cyclePos) {
  const steps = [];
  const n = nodeVals.length;

  // Build adjacency: next[i] = i+1, last -> cyclePos (or -1)
  const nextOf = (i) => {
    if (i === n - 1) return cyclePos >= 0 ? cyclePos : -1;
    return i + 1;
  };

  // Guard: single node, no next
  if (n === 0) {
    steps.push({ phase:"done_false", line:"done_false", slow:-1, fast:-1, visited:[], meet:-1, icon:"flag-bold", msg:"Empty list → false", detail:"", result:false });
    return steps;
  }
  if (n === 1 && cyclePos < 0) {
    steps.push({ phase:"done_false", line:"done_false", slow:0, fast:-1, visited:[], meet:-1, icon:"flag-bold", msg:"Single node, no next → false", detail:"head.Next == nil", result:false });
    return steps;
  }

  let slow = 0;
  let fast = nextOf(0); // head.Next

  steps.push({
    phase:"init", line:"init",
    slow, fast, visited: new Set([slow, fast]), meet: -1,
    icon:"rocket-bold",
    msg:`Init: slow=node[${slow}](${nodeVals[slow]})  fast=node[${fast}](${nodeVals[fast]})`,
    detail:`slow=head, fast=head.Next`,
    result:null,
  });

  let safety = 0;
  while (fast !== -1 && nextOf(fast) !== -1 && safety++ < 200) {
    const visited = new Set([slow]);
    // add all nodes reachable up to fast along the path
    steps.push({
      phase:"loop_check", line:"loop_check",
      slow, fast, visited, meet: -1,
      icon:"refresh-bold",
      msg:`Loop: fast(${fast})≠nil && fast.Next(${nextOf(fast)})≠nil`,
      detail:`Condition holds — enter body`,
      result:null,
    });

    if (slow === fast) {
      steps.push({
        phase:"found", line:"found",
        slow, fast, visited, meet: slow,
        icon:"crown-bold",
        msg:`slow(${slow}) == fast(${fast}) → CYCLE DETECTED!`,
        detail:`Both pointers at node[${slow}] val=${nodeVals[slow]}`,
        result:true,
      });
      steps.push({
        phase:"found", line:"found",
        slow, fast, visited, meet: slow,
        icon:"flag-bold",
        msg:`return true`,
        detail:`Cycle confirmed — has cycle = true`,
        result:true,
      });
      return steps;
    }

    steps.push({
      phase:"meet_check", line:"meet_check",
      slow, fast, visited, meet:-1,
      icon:"close-circle-bold",
      msg:`slow(${slow}) ≠ fast(${fast}) — advance pointers`,
      detail:`No meeting yet`,
      result:null,
    });

    const prevSlow = slow, prevFast = fast;
    slow = nextOf(slow);
    fast = nextOf(nextOf(fast));

    steps.push({
      phase:"advance", line:"advance",
      slow, fast,
      visited: new Set([slow, fast >= 0 ? fast : -1].filter(x => x >= 0)),
      meet:-1,
      prevSlow, prevFast,
      icon:"arrow-right-bold",
      msg:`slow: ${prevSlow}→${slow}  fast: ${prevFast}→${nextOf(prevFast)}→${fast}`,
      detail:`slow.Next=${slow >= 0 ? nodeVals[slow] : "nil"}  fast.Next.Next=${fast >= 0 ? nodeVals[fast] : "nil"}`,
      result:null,
    });
  }

  steps.push({
    phase:"done_false", line:"done_false",
    slow, fast: -1, visited: new Set(), meet: -1,
    icon:"flag-bold",
    msg:`fast reached nil → no cycle → return false`,
    detail:`return false`,
    result:false,
  });
  return steps;
}
