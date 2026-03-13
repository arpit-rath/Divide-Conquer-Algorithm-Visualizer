/* =======================================
   MERGE SORT - Step Generation
   ======================================= */
function mergeSortSteps(arr) {
  const steps = [];
  const a = [...arr];

  steps.push({ phase: 'ready', description: `Initial array: [${a.join(', ')}]`, array: [...a] });

  function ms(lo, hi) {
    if (lo >= hi) {
      steps.push({ phase: 'base', description: `Base case: single element [${a[lo]}] at index ${lo}`, array: [...a], highlightActive: [lo] });
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ phase: 'divide', description: `Divide array[${lo}..${hi}] at midpoint index ${mid}`, array: [...a], leftRange: [lo, mid], rightRange: [mid + 1, hi] });
    ms(lo, mid);
    ms(mid + 1, hi);
    merge(lo, mid, hi);
  }

  function merge(lo, mid, hi) {
    steps.push({ phase: 'combine', description: `Merging: array[${lo}..${mid}] and array[${mid + 1}..${hi}]`, array: [...a], leftRange: [lo, mid], rightRange: [mid + 1, hi] });
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      const li = lo + i, ri = mid + 1 + j;
      steps.push({ phase: 'combine', description: `Comparing ${left[i]} and ${right[j]}`, array: [...a], comparing: [li, ri], leftRange: [lo, mid], rightRange: [mid + 1, hi] });
      if (left[i] <= right[j]) { a[k++] = left[i++]; } else { a[k++] = right[j++]; }
      steps.push({ phase: 'combine', description: `Placed ${a[k - 1]} at index ${k - 1}`, array: [...a], merging: [k - 1], leftRange: [lo, mid], rightRange: [mid + 1, hi] });
    }
    while (i < left.length) { a[k++] = left[i++]; steps.push({ phase: 'combine', description: `Placed remaining ${a[k - 1]}`, array: [...a], merging: [k - 1] }); }
    while (j < right.length) { a[k++] = right[j++]; steps.push({ phase: 'combine', description: `Placed remaining ${a[k - 1]}`, array: [...a], merging: [k - 1] }); }
    const sorted = [];
    for (let x = lo; x <= hi; x++) sorted.push(x);
    steps.push({ phase: 'combine', description: `Merged result: [${a.slice(lo, hi + 1).join(', ')}]`, array: [...a], sorted });
  }

  ms(0, a.length - 1);
  const allIdx = a.map((_, i) => i);
  steps.push({ phase: 'complete', description: `Sorting complete! Result: [${a.join(', ')}]`, array: [...a], sorted: allIdx });
  return steps;
}

/* =======================================
   QUICK SORT - Step Generation
   ======================================= */
function quickSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const sortedSet = new Set();

  steps.push({ phase: 'ready', description: `Initial array: [${a.join(', ')}]`, array: [...a] });

  function qs(lo, hi) {
    if (lo >= hi) {
      if (lo === hi) sortedSet.add(lo);
      if (lo >= 0 && lo < a.length) {
        steps.push({ phase: 'base', description: `Base case at index ${lo}: element ${a[lo]}`, array: [...a], sorted: [...sortedSet], highlightActive: [lo] });
      }
      return;
    }
    const pivotVal = a[hi];
    steps.push({ phase: 'divide', description: `Choose pivot = ${pivotVal} (index ${hi})`, array: [...a], pivot: hi, leftRange: [lo, hi - 1], sorted: [...sortedSet] });

    let i = lo;
    for (let j = lo; j < hi; j++) {
      steps.push({ phase: 'divide', description: `Comparing ${a[j]} with pivot ${pivotVal}`, array: [...a], comparing: [j], pivot: hi, sorted: [...sortedSet] });
      if (a[j] < pivotVal) {
        [a[i], a[j]] = [a[j], a[i]];
        if (i !== j) steps.push({ phase: 'divide', description: `Swapped ${a[j]} and ${a[i]}`, array: [...a], comparing: [i, j], pivot: hi, sorted: [...sortedSet] });
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    sortedSet.add(i);
    steps.push({ phase: 'conquer', description: `Pivot ${pivotVal} placed at correct index ${i}`, array: [...a], pivot: i, leftRange: [lo, i - 1], rightRange: [i + 1, hi], sorted: [...sortedSet] });

    qs(lo, i - 1);
    qs(i + 1, hi);
  }

  qs(0, a.length - 1);
  steps.push({ phase: 'complete', description: `Sorting complete! Result: [${a.join(', ')}]`, array: [...a], sorted: a.map((_, i) => i) });
  return steps;
}
