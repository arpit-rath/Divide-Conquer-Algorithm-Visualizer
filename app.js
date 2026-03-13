/* =======================================
   DIVIDE & CONQUER ALGORITHM VISUALIZER
   Main Application Controller
   ======================================= */

// ---- STATE ----
const state = {
  currentAlgo: 'mergeSort',
  steps: [],
  currentStep: -1,
  isPlaying: false,
  playTimer: null,
  data: null
};

// ---- DOM REFS ----
const $ = id => document.getElementById(id);
const viz = $('visualization');
const algoTitle = $('algo-title');
const phaseBadge = $('phase-badge');
const phaseText = $('phase-text');
const stepDesc = $('step-description');
const stepPhaseLabel = $('step-phase-label');
const btnGen = $('btn-generate');
const btnPrev = $('btn-prev');
const btnPlay = $('btn-play');
const btnNext = $('btn-next');
const speedSlider = $('speed-slider');
const curStepEl = $('current-step');
const totalStepEl = $('total-steps');

// ---- ALGORITHM REGISTRY ----
const algorithms = {
  mergeSort: {
    name: 'Merge Sort',
    renderer: 'bars',
    generate: () => randomArray(14, 5, 95),
    computeSteps: mergeSortSteps,
    complexity: {
      recurrence: 'T(n) = 2T(n/2) + O(n)',
      analysis: 'By Master Theorem: a=2, b=2, f(n)=n\nlog_b(a) = log₂(2) = 1\nf(n) = Θ(n^1) → Case 2 applies\nT(n) = Θ(n log n)',
      bigO: 'O(n log n)',
      space: 'O(n)',
      steps: [
        { text: 'Divide array into two halves', cls: 'step-divide' },
        { text: 'Recursively sort each half', cls: 'step-conquer' },
        { text: 'Merge sorted halves together', cls: 'step-combine' }
      ]
    }
  },
  quickSort: {
    name: 'Quick Sort',
    renderer: 'bars',
    generate: () => randomArray(14, 5, 95),
    computeSteps: quickSortSteps,
    complexity: {
      recurrence: 'T(n) = T(k) + T(n-k-1) + O(n)\nAverage: T(n) = 2T(n/2) + O(n)',
      analysis: 'Average case: a=2, b=2, f(n)=n\nlog₂(2) = 1 → Case 2\nWorst case (sorted): T(n) = T(n-1) + O(n) = O(n²)',
      bigO: 'O(n log n) avg\nO(n²) worst',
      space: 'O(log n)',
      steps: [
        { text: 'Choose pivot element', cls: 'step-divide' },
        { text: 'Partition: elements < pivot left, > pivot right', cls: 'step-divide' },
        { text: 'Recursively sort left and right partitions', cls: 'step-conquer' },
        { text: 'Array is sorted in-place', cls: 'step-combine' }
      ]
    }
  },
  minMax: {
    name: 'Min & Max Finding',
    renderer: 'cards',
    generate: () => randomArray(8, 1, 99),
    computeSteps: minMaxSteps,
    complexity: {
      recurrence: 'T(n) = 2T(n/2) + 2',
      analysis: 'Each level does 2 comparisons.\nTotal comparisons: 3n/2 - 2\nMuch better than naive 2(n-1).',
      bigO: 'O(n)',
      space: 'O(log n)',
      steps: [
        { text: 'Divide array into two halves', cls: 'step-divide' },
        { text: 'Find min & max in each half recursively', cls: 'step-conquer' },
        { text: 'Compare mins and maxes from both halves', cls: 'step-combine' }
      ]
    }
  },
  largestSubarray: {
    name: 'Largest Subarray Sum',
    renderer: 'cards',
    generate: () => randomSignedArray(10, -20, 30),
    computeSteps: largestSubarraySteps,
    complexity: {
      recurrence: 'T(n) = 2T(n/2) + O(n)',
      analysis: 'By Master Theorem: a=2, b=2, f(n)=n\nlog₂(2) = 1 → Case 2\nCross-boundary scan is O(n)',
      bigO: 'O(n log n)',
      space: 'O(log n)',
      steps: [
        { text: 'Divide array at midpoint', cls: 'step-divide' },
        { text: 'Find max subarray in left and right halves', cls: 'step-conquer' },
        { text: 'Find max crossing subarray spanning midpoint', cls: 'step-combine' },
        { text: 'Return maximum of the three', cls: 'step-combine' }
      ]
    }
  },
  closestPair: {
    name: 'Closest Pair of Points',
    renderer: 'scatter',
    generate: () => randomPoints(16, 20, 580, 20, 380),
    computeSteps: closestPairSteps,
    complexity: {
      recurrence: 'T(n) = 2T(n/2) + O(n)',
      analysis: 'Sort points by x: O(n log n)\nEach level: O(n) strip check\nlog₂(2) = 1 → Case 2 of Master Theorem',
      bigO: 'O(n log n)',
      space: 'O(n)',
      steps: [
        { text: 'Sort points by x-coordinate', cls: 'step-divide' },
        { text: 'Divide into left and right halves', cls: 'step-divide' },
        { text: 'Find closest pair in each half recursively', cls: 'step-conquer' },
        { text: 'Check strip of width 2δ around dividing line', cls: 'step-combine' },
        { text: 'Return minimum distance overall', cls: 'step-combine' }
      ]
    }
  },
  convexHull: {
    name: 'Convex Hull',
    renderer: 'scatter',
    generate: () => randomPoints(20, 30, 570, 30, 370),
    computeSteps: convexHullSteps,
    complexity: {
      recurrence: 'T(n) = 2T(n/2) + O(n)',
      analysis: 'Sort points: O(n log n)\nMerge hulls: O(n) with tangent finding\nlog₂(2) = 1 → Case 2',
      bigO: 'O(n log n)',
      space: 'O(n)',
      steps: [
        { text: 'Sort points by x-coordinate', cls: 'step-divide' },
        { text: 'Divide into left and right point sets', cls: 'step-divide' },
        { text: 'Compute convex hull of each set recursively', cls: 'step-conquer' },
        { text: 'Merge hulls by finding upper & lower tangents', cls: 'step-combine' }
      ]
    }
  },
  matrixMultiply: {
    name: 'Matrix Multiplication (D&C)',
    renderer: 'matrix',
    generate: () => ({ A: randomMatrix(4), B: randomMatrix(4) }),
    computeSteps: matrixMultiplySteps,
    complexity: {
      recurrence: 'T(n) = 8T(n/2) + O(n²)',
      analysis: 'a=8, b=2, f(n)=n²\nlog₂(8) = 3 > 2\nCase 1: n^(log_b a) dominates',
      bigO: 'O(n³)',
      space: 'O(n²)',
      steps: [
        { text: 'Divide each matrix into 4 sub-matrices', cls: 'step-divide' },
        { text: 'Compute 8 recursive sub-matrix products', cls: 'step-conquer' },
        { text: 'Add products to form result quadrants', cls: 'step-combine' }
      ]
    }
  },
  strassen: {
    name: "Strassen's Matrix Multiplication",
    renderer: 'matrix',
    generate: () => ({ A: randomMatrix(4), B: randomMatrix(4) }),
    computeSteps: strassenSteps,
    complexity: {
      recurrence: 'T(n) = 7T(n/2) + O(n²)',
      analysis: 'a=7, b=2, f(n)=n²\nlog₂(7) ≈ 2.807 > 2\nCase 1: n^(log_b a) dominates\nSaves 1 multiplication per level!',
      bigO: 'O(n^2.807)',
      space: 'O(n²)',
      steps: [
        { text: 'Divide each matrix into 4 sub-matrices', cls: 'step-divide' },
        { text: 'Compute 7 special products M1..M7', cls: 'step-conquer' },
        { text: 'C₁₁=M1+M4−M5+M7, C₁₂=M3+M5', cls: 'step-combine' },
        { text: 'C₂₁=M2+M4, C₂₂=M1−M2+M3+M6', cls: 'step-combine' }
      ]
    }
  }
};

// ---- DATA GENERATORS ----
function randomArray(n, min, max) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}
function randomSignedArray(n, min, max) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}
function randomPoints(n, xMin, xMax, yMin, yMax) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    pts.push({ x: Math.round(Math.random() * (xMax - xMin) + xMin), y: Math.round(Math.random() * (yMax - yMin) + yMin) });
  }
  return pts;
}
function randomMatrix(n) {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => Math.floor(Math.random() * 19) - 9));
}

// ---- ANIMATION CONTROLLER ----
function getDelay() { return 1200 - (speedSlider.value - 1) * 110; }

function updateControls() {
  const hasSteps = state.steps.length > 0;
  btnPrev.disabled = !hasSteps || state.currentStep <= 0;
  btnNext.disabled = !hasSteps || state.currentStep >= state.steps.length - 1;
  btnPlay.disabled = !hasSteps;
  btnPlay.textContent = state.isPlaying ? '⏸' : '▶';
  curStepEl.textContent = hasSteps ? state.currentStep + 1 : 0;
  totalStepEl.textContent = state.steps.length;
}

function showStep(idx) {
  if (idx < 0 || idx >= state.steps.length) return;
  state.currentStep = idx;
  const step = state.steps[idx];
  // Phase badge
  phaseBadge.className = 'phase-' + (step.phase || 'ready');
  phaseText.textContent = capitalize(step.phase || 'ready');
  // Step info
  stepPhaseLabel.className = (step.phase || '') + ' show';
  stepPhaseLabel.textContent = capitalize(step.phase || '');
  stepDesc.textContent = step.description;
  // Render visualization
  const algo = algorithms[state.currentAlgo];
  renderStep(algo.renderer, step);
  updateControls();
}

function play() {
  if (state.isPlaying) { pause(); return; }
  if (state.currentStep >= state.steps.length - 1) return;
  state.isPlaying = true;
  updateControls();
  tick();
}

function tick() {
  if (!state.isPlaying || state.currentStep >= state.steps.length - 1) { pause(); return; }
  state.currentStep++;
  showStep(state.currentStep);
  state.playTimer = setTimeout(tick, getDelay());
}

function pause() {
  state.isPlaying = false;
  clearTimeout(state.playTimer);
  updateControls();
}

function generate() {
  pause();
  const algo = algorithms[state.currentAlgo];
  state.data = algo.generate();
  state.steps = algo.computeSteps(state.data);
  state.currentStep = 0;
  showStep(0);
  updateComplexityPanel(algo);
}

function selectAlgo(key) {
  pause();
  state.currentAlgo = key;
  state.steps = [];
  state.currentStep = -1;
  const algo = algorithms[key];
  algoTitle.textContent = algo.name;
  // Update sidebar active
  document.querySelectorAll('.algo-category li').forEach(li => li.classList.remove('active'));
  document.querySelector(`[data-algo="${key}"]`).classList.add('active');
  // Reset viz
  viz.innerHTML = '<div class="viz-placeholder"><span class="placeholder-icon">🎯</span><p>Click <strong>Generate</strong> to start</p></div>';
  phaseBadge.className = 'phase-ready';
  phaseText.textContent = 'Ready';
  stepPhaseLabel.className = '';
  stepDesc.textContent = 'Click "Generate" to create a dataset and begin visualization.';
  updateControls();
  updateComplexityPanel(algo);
}

function updateComplexityPanel(algo) {
  const c = algo.complexity;
  $('recurrence').textContent = c.recurrence;
  $('analysis').textContent = c.analysis;
  $('big-o').textContent = c.bigO;
  $('space-complexity').textContent = c.space;
  const stepsBox = $('algo-steps');
  stepsBox.innerHTML = '<ol>' + c.steps.map(s => `<li class="${s.cls}">${s.text}</li>`).join('') + '</ol>';
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---- EVENT LISTENERS ----
btnGen.addEventListener('click', generate);
btnPrev.addEventListener('click', () => { if (state.currentStep > 0) showStep(state.currentStep - 1); });
btnNext.addEventListener('click', () => { if (state.currentStep < state.steps.length - 1) showStep(state.currentStep + 1); });
btnPlay.addEventListener('click', play);
document.querySelectorAll('.algo-category li').forEach(li => {
  li.addEventListener('click', () => selectAlgo(li.dataset.algo));
});
$('sidebar-toggle').addEventListener('click', () => $('sidebar').classList.toggle('collapsed'));
$('panel-toggle').addEventListener('click', () => $('complexity-panel').classList.toggle('collapsed'));

// Keyboard controls
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') btnNext.click();
  else if (e.key === 'ArrowLeft') btnPrev.click();
  else if (e.key === ' ') { e.preventDefault(); btnPlay.click(); }
});

// ---- INIT ----
updateControls();
updateComplexityPanel(algorithms.mergeSort);
