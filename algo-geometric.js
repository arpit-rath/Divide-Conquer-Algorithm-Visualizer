/* =======================================
   CLOSEST PAIR OF POINTS - Step Generation
   ======================================= */
function closestPairSteps(pts) {
  const steps = [];
  const points = pts.map((p, i) => ({ ...p, idx: i }));
  points.sort((a, b) => a.x - b.x);
  const allPts = points.map(p => ({ x: p.x, y: p.y }));

  function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

  steps.push({ phase: 'ready', description: `${points.length} points sorted by x-coordinate. Finding closest pair.`, points: allPts });

  function solve(pts, lo, hi) {
    if (hi - lo < 3) {
      let bestD = Infinity, bestP = [lo, lo + 1];
      for (let i = lo; i <= hi; i++) {
        for (let j = i + 1; j <= hi; j++) {
          const d = dist(points[i], points[j]);
          if (d < bestD) { bestD = d; bestP = [i, j]; }
        }
      }
      steps.push({ phase: 'base', description: `Base case: ${hi - lo + 1} points. Closest = ${bestD.toFixed(2)}`, points: allPts, highlightPts: [bestP[0], bestP[1]], connection: [allPts[bestP[0]], allPts[bestP[1]]] });
      return { dist: bestD, pair: bestP };
    }

    const mid = Math.floor((lo + hi) / 2);
    const midX = points[mid].x;
    const leftSet = [], rightSet = [];
    for (let i = lo; i <= mid; i++) leftSet.push(i);
    for (let i = mid + 1; i <= hi; i++) rightSet.push(i);

    steps.push({ phase: 'divide', description: `Divide at x = ${midX}. Left: ${leftSet.length} points, Right: ${rightSet.length} points`, points: allPts, leftSet, rightSet, dividerX: midX });

    const leftRes = solve(pts, lo, mid);
    const rightRes = solve(pts, mid + 1, hi);

    let delta = Math.min(leftRes.dist, rightRes.dist);
    let bestPair = leftRes.dist <= rightRes.dist ? leftRes.pair : rightRes.pair;

    steps.push({ phase: 'conquer', description: `Left closest: ${leftRes.dist.toFixed(2)}, Right closest: ${rightRes.dist.toFixed(2)}. δ = ${delta.toFixed(2)}`, points: allPts, leftSet, rightSet, dividerX: midX, connection: [allPts[bestPair[0]], allPts[bestPair[1]]] });

    // Strip
    const stripPts = [];
    for (let i = lo; i <= hi; i++) {
      if (Math.abs(points[i].x - midX) < delta) stripPts.push(i);
    }
    const stripLeft = midX - delta, stripRight = midX + delta;
    steps.push({ phase: 'combine', description: `Strip of width 2δ = ${(2 * delta).toFixed(2)} around x = ${midX}. ${stripPts.length} points in strip.`, points: allPts, dividerX: midX, strip: [stripLeft, stripRight], highlightPts: stripPts, connection: [allPts[bestPair[0]], allPts[bestPair[1]]] });

    // Check strip pairs
    const stripSorted = stripPts.slice().sort((a, b) => points[a].y - points[b].y);
    for (let i = 0; i < stripSorted.length; i++) {
      for (let j = i + 1; j < stripSorted.length && (points[stripSorted[j]].y - points[stripSorted[i]].y) < delta; j++) {
        const d = dist(points[stripSorted[i]], points[stripSorted[j]]);
        if (d < delta) {
          delta = d;
          bestPair = [stripSorted[i], stripSorted[j]];
          steps.push({ phase: 'combine', description: `Found closer pair in strip! Distance = ${d.toFixed(2)}`, points: allPts, strip: [stripLeft, stripRight], resultPts: [bestPair[0], bestPair[1]], connection: [allPts[bestPair[0]], allPts[bestPair[1]]] });
        }
      }
    }

    steps.push({ phase: 'combine', description: `Result for region [${lo}..${hi}]: closest = ${delta.toFixed(2)}`, points: allPts, resultPts: [bestPair[0], bestPair[1]], connection: [allPts[bestPair[0]], allPts[bestPair[1]]] });
    return { dist: delta, pair: bestPair };
  }

  const result = solve(points, 0, points.length - 1);
  steps.push({ phase: 'complete', description: `Closest pair found! Distance = ${result.dist.toFixed(2)}`, points: allPts, resultPts: result.pair, connection: [allPts[result.pair[0]], allPts[result.pair[1]]] });
  return steps;
}

/* =======================================
   CONVEX HULL (D&C) - Step Generation
   Uses upper/lower hull merge approach
   ======================================= */
function convexHullSteps(pts) {
  const steps = [];
  const points = pts.map((p, i) => ({ ...p, idx: i }));
  points.sort((a, b) => a.x - b.x || a.y - b.y);
  const allPts = points.map(p => ({ x: p.x, y: p.y }));

  function cross(O, A, B) { return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x); }

  function hullOf(indices) {
    if (indices.length <= 1) return indices;
    const pts = indices.map(i => ({ ...allPts[i], idx: i }));
    pts.sort((a, b) => a.x - b.x || a.y - b.y);
    const upper = [], lower = [];
    for (const p of pts) {
      while (upper.length >= 2 && cross(allPts[upper[upper.length - 2]], allPts[upper[upper.length - 1]], p) >= 0) upper.pop();
      upper.push(p.idx);
    }
    for (const p of pts) {
      while (lower.length >= 2 && cross(allPts[lower[lower.length - 2]], allPts[lower[lower.length - 1]], p) <= 0) lower.pop();
      lower.push(p.idx);
    }
    const hull = [...new Set([...upper, ...lower.reverse()])];
    return hull;
  }

  function hullEdges(hullIndices) {
    const edges = [];
    for (let i = 0; i < hullIndices.length; i++) {
      const j = (i + 1) % hullIndices.length;
      edges.push([allPts[hullIndices[i]], allPts[hullIndices[j]]]);
    }
    return edges;
  }

  steps.push({ phase: 'ready', description: `${points.length} points sorted by x-coordinate. Computing convex hull using Divide & Conquer.`, points: allPts });

  function solve(indices) {
    if (indices.length <= 3) {
      const hull = hullOf(indices);
      steps.push({ phase: 'base', description: `Base case: ${indices.length} point(s). Hull has ${hull.length} vertices.`, points: allPts, highlightPts: indices, hullEdges: hullEdges(hull), hullFill: hull.map(i => allPts[i]) });
      return hull;
    }

    const mid = Math.floor(indices.length / 2);
    const leftIdx = indices.slice(0, mid);
    const rightIdx = indices.slice(mid);
    const midX = allPts[indices[mid]].x;

    steps.push({ phase: 'divide', description: `Divide ${indices.length} points at x ≈ ${midX}. Left: ${leftIdx.length}, Right: ${rightIdx.length}`, points: allPts, leftSet: leftIdx, rightSet: rightIdx, dividerX: midX });

    const leftHull = solve(leftIdx);
    const rightHull = solve(rightIdx);

    steps.push({ phase: 'conquer', description: `Left hull: ${leftHull.length} vertices, Right hull: ${rightHull.length} vertices. Now merging...`, points: allPts, leftSet: leftIdx, rightSet: rightIdx, hullEdges: [...hullEdges(leftHull), ...hullEdges(rightHull)], dividerX: midX });

    const merged = hullOf([...leftHull, ...rightHull]);
    steps.push({ phase: 'combine', description: `Merged hull has ${merged.length} vertices`, points: allPts, hullEdges: hullEdges(merged), hullFill: merged.map(i => allPts[i]), resultPts: merged });
    return merged;
  }

  const allIndices = points.map((_, i) => i);
  const result = solve(allIndices);
  steps.push({ phase: 'complete', description: `Convex hull complete! ${result.length} vertices on the hull.`, points: allPts, hullEdges: hullEdges(result), hullFill: result.map(i => allPts[i]), resultPts: result });
  return steps;
}
