/* =======================================
   MIN & MAX FINDING - Step Generation
   ======================================= */
function minMaxSteps(arr) {
  const steps = [];
  const a = [...arr];
  steps.push({ phase: 'ready', description: `Initial array: [${a.join(', ')}]. Find minimum and maximum using D&C.`, array: [...a] });

  function findMinMax(lo, hi) {
    if (lo === hi) {
      steps.push({ phase: 'base', description: `Base case: single element ${a[lo]} at index ${lo}. Min=${a[lo]}, Max=${a[lo]}`, array: [...a], highlightActive: [lo], info: [{ label: 'Min', value: a[lo] }, { label: 'Max', value: a[lo] }] });
      return { min: a[lo], max: a[lo], minIdx: lo, maxIdx: lo };
    }
    if (hi - lo === 1) {
      const mn = Math.min(a[lo], a[hi]), mx = Math.max(a[lo], a[hi]);
      const mnI = a[lo] <= a[hi] ? lo : hi, mxI = a[lo] >= a[hi] ? lo : hi;
      steps.push({ phase: 'base', description: `Two elements: compare ${a[lo]} and ${a[hi]}. Min=${mn}, Max=${mx}`, array: [...a], highlightMin: [mnI], highlightMax: [mxI], info: [{ label: 'Min', value: mn }, { label: 'Max', value: mx }] });
      return { min: mn, max: mx, minIdx: mnI, maxIdx: mxI };
    }
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ phase: 'divide', description: `Divide array[${lo}..${hi}] at midpoint ${mid}`, array: [...a], highlightLeft: [lo, mid], highlightRight: [mid + 1, hi] });

    const left = findMinMax(lo, mid);
    const right = findMinMax(mid + 1, hi);

    steps.push({ phase: 'combine', description: `Combine: Left min=${left.min}, max=${left.max} | Right min=${right.min}, max=${right.max}`, array: [...a], highlightMin: [left.minIdx, right.minIdx], highlightMax: [left.maxIdx, right.maxIdx], highlightLeft: [lo, mid], highlightRight: [mid + 1, hi] });

    const result = {
      min: Math.min(left.min, right.min),
      max: Math.max(left.max, right.max),
      minIdx: left.min <= right.min ? left.minIdx : right.minIdx,
      maxIdx: left.max >= right.max ? left.maxIdx : right.maxIdx
    };
    steps.push({ phase: 'combine', description: `Result for [${lo}..${hi}]: Min=${result.min}, Max=${result.max}`, array: [...a], highlightMin: [result.minIdx], highlightMax: [result.maxIdx], info: [{ label: 'Min', value: result.min }, { label: 'Max', value: result.max }] });
    return result;
  }

  const result = findMinMax(0, a.length - 1);
  steps.push({ phase: 'complete', description: `Complete! Minimum = ${result.min}, Maximum = ${result.max}`, array: [...a], highlightMin: [result.minIdx], highlightMax: [result.maxIdx], info: [{ label: 'Global Min', value: result.min }, { label: 'Global Max', value: result.max }] });
  return steps;
}

/* =======================================
   LARGEST SUBARRAY SUM - Step Generation
   ======================================= */
function largestSubarraySteps(arr) {
  const steps = [];
  const a = [...arr];
  steps.push({ phase: 'ready', description: `Array: [${a.join(', ')}]. Find contiguous subarray with largest sum.`, array: [...a] });

  function maxCross(lo, mid, hi) {
    let leftSum = -Infinity, sum = 0, maxLeft = mid;
    for (let i = mid; i >= lo; i--) {
      sum += a[i];
      if (sum > leftSum) { leftSum = sum; maxLeft = i; }
    }
    let rightSum = -Infinity; sum = 0; let maxRight = mid + 1;
    for (let i = mid + 1; i <= hi; i++) {
      sum += a[i];
      if (sum > rightSum) { rightSum = sum; maxRight = i; }
    }
    const crossRange = [];
    for (let i = maxLeft; i <= maxRight; i++) crossRange.push(i);
    steps.push({ phase: 'combine', description: `Crossing subarray [${maxLeft}..${maxRight}], sum = ${leftSum + rightSum}`, array: [...a], highlightCross: [maxLeft, maxRight], info: [{ label: 'Cross Sum', value: leftSum + rightSum }] });
    return { sum: leftSum + rightSum, lo: maxLeft, hi: maxRight };
  }

  function maxSub(lo, hi) {
    if (lo === hi) {
      steps.push({ phase: 'base', description: `Base case: element ${a[lo]} at index ${lo}`, array: [...a], highlightActive: [lo], info: [{ label: 'Sum', value: a[lo] }] });
      return { sum: a[lo], lo, hi };
    }
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ phase: 'divide', description: `Divide [${lo}..${hi}] at midpoint ${mid}`, array: [...a], highlightLeft: [lo, mid], highlightRight: [mid + 1, hi] });

    const left = maxSub(lo, mid);
    const right = maxSub(mid + 1, hi);
    const cross = maxCross(lo, mid, hi);

    let best;
    if (left.sum >= right.sum && left.sum >= cross.sum) best = left;
    else if (right.sum >= left.sum && right.sum >= cross.sum) best = right;
    else best = cross;

    const resultRange = [];
    for (let i = best.lo; i <= best.hi; i++) resultRange.push(i);
    steps.push({ phase: 'combine', description: `Best in [${lo}..${hi}]: sum = ${best.sum} from indices [${best.lo}..${best.hi}]`, array: [...a], highlightResult: resultRange, info: [{ label: 'Left', value: left.sum }, { label: 'Right', value: right.sum }, { label: 'Cross', value: cross.sum }, { label: 'Best', value: best.sum }] });
    return best;
  }

  const result = maxSub(0, a.length - 1);
  const resultRange = [];
  for (let i = result.lo; i <= result.hi; i++) resultRange.push(i);
  steps.push({ phase: 'complete', description: `Maximum subarray sum = ${result.sum}, subarray [${result.lo}..${result.hi}]: [${a.slice(result.lo, result.hi + 1).join(', ')}]`, array: [...a], highlightResult: resultRange, info: [{ label: 'Max Sum', value: result.sum }] });
  return steps;
}
