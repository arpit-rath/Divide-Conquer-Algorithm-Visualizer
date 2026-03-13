/* =======================================
   MATRIX MULTIPLICATION (D&C) - Step Generation
   ======================================= */
function matrixMultiplySteps(data) {
  const steps = [];
  const { A, B } = data;
  const n = A.length;

  function matMul(a, b) {
    const n = a.length;
    const c = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        for (let k = 0; k < n; k++)
          c[i][j] += a[i][k] * b[k][j];
    return c;
  }

  function getQuad(m, r, c, s) {
    return Array.from({ length: s }, (_, i) => Array.from({ length: s }, (_, j) => m[r + i][c + j]));
  }

  function addMat(a, b) {
    return a.map((row, i) => row.map((v, j) => v + b[i][j]));
  }

  function quadHighlights(n, quad) {
    const h = n / 2, map = {};
    const cls = { tl: 'quad-tl', tr: 'quad-tr', bl: 'quad-bl', br: 'quad-br' };
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const q = (i < h ? (j < h ? 'tl' : 'tr') : (j < h ? 'bl' : 'br'));
        if (!quad || q === quad) map[`${i},${j}`] = cls[q];
      }
    return map;
  }

  // Initial
  steps.push({
    phase: 'ready',
    description: `Multiply ${n}×${n} matrices A × B using Divide & Conquer (8 sub-products).`,
    matrices: [
      { label: 'A', data: A, highlights: {} },
      { label: 'B', data: B, highlights: {} }
    ],
    operators: ['×']
  });

  // Show quadrants
  steps.push({
    phase: 'divide',
    description: `Divide each matrix into 4 quadrants of size ${n / 2}×${n / 2}.`,
    matrices: [
      { label: 'A', data: A, highlights: quadHighlights(n) },
      { label: 'B', data: B, highlights: quadHighlights(n) }
    ],
    operators: ['×']
  });

  const h = n / 2;
  const A11 = getQuad(A, 0, 0, h), A12 = getQuad(A, 0, h, h);
  const A21 = getQuad(A, h, 0, h), A22 = getQuad(A, h, h, h);
  const B11 = getQuad(B, 0, 0, h), B12 = getQuad(B, 0, h, h);
  const B21 = getQuad(B, h, 0, h), B22 = getQuad(B, h, h, h);

  const products = [
    { name: 'P1 = A₁₁ × B₁₁', a: A11, b: B11, aq: 'tl', bq: 'tl' },
    { name: 'P2 = A₁₁ × B₁₂', a: A11, b: B12, aq: 'tl', bq: 'tr' },
    { name: 'P3 = A₁₂ × B₂₁', a: A12, b: B21, aq: 'tr', bq: 'bl' },
    { name: 'P4 = A₁₂ × B₂₂', a: A12, b: B22, aq: 'tr', bq: 'br' },
    { name: 'P5 = A₂₁ × B₁₁', a: A21, b: B11, aq: 'bl', bq: 'tl' },
    { name: 'P6 = A₂₁ × B₁₂', a: A21, b: B12, aq: 'bl', bq: 'tr' },
    { name: 'P7 = A₂₂ × B₂₁', a: A22, b: B21, aq: 'br', bq: 'bl' },
    { name: 'P8 = A₂₂ × B₂₂', a: A22, b: B22, aq: 'br', bq: 'br' },
  ];

  products.forEach((p, idx) => {
    steps.push({
      phase: 'conquer',
      description: `Computing ${p.name} (product ${idx + 1} of 8)`,
      formula: p.name,
      matrices: [
        { label: 'A', data: A, highlights: quadHighlights(n, p.aq) },
        { label: 'B', data: B, highlights: quadHighlights(n, p.bq) },
        { label: p.name.split('=')[0].trim(), data: matMul(p.a, p.b), highlights: {} }
      ],
      operators: ['×', '=']
    });
  });

  // Combine
  const P1 = matMul(A11, B11), P2 = matMul(A11, B12);
  const P3 = matMul(A12, B21), P4 = matMul(A12, B22);
  const P5 = matMul(A21, B11), P6 = matMul(A21, B12);
  const P7 = matMul(A22, B21), P8 = matMul(A22, B22);

  const C11 = addMat(P1, P3);
  const C12 = addMat(P2, P4);
  const C21 = addMat(P5, P7);
  const C22 = addMat(P6, P8);

  steps.push({
    phase: 'combine',
    description: 'C₁₁ = P1 + P3, C₁₂ = P2 + P4, C₂₁ = P5 + P7, C₂₂ = P6 + P8',
    formula: 'C₁₁ = A₁₁B₁₁ + A₁₂B₂₁   C₁₂ = A₁₁B₁₂ + A₁₂B₂₂\nC₂₁ = A₂₁B₁₁ + A₂₂B₂₁   C₂₂ = A₂₁B₁₂ + A₂₂B₂₂',
    matrices: [
      { label: 'C₁₁', data: C11, highlights: {} },
      { label: 'C₁₂', data: C12, highlights: {} },
      { label: 'C₂₁', data: C21, highlights: {} },
      { label: 'C₂₂', data: C22, highlights: {} }
    ],
    operators: ['', '', '']
  });

  // Final result
  const C = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
    if (i < h && j < h) return C11[i][j];
    if (i < h) return C12[i][j - h];
    if (j < h) return C21[i - h][j];
    return C22[i - h][j - h];
  }));

  steps.push({
    phase: 'complete',
    description: `Matrix multiplication complete! Result is a ${n}×${n} matrix.`,
    matrices: [
      { label: 'A', data: A, highlights: {} },
      { label: 'B', data: B, highlights: {} },
      { label: 'C = A×B', data: C, highlights: quadHighlights(n) }
    ],
    operators: ['×', '=']
  });

  return steps;
}

/* =======================================
   STRASSEN'S MULTIPLICATION - Step Generation
   ======================================= */
function strassenSteps(data) {
  const steps = [];
  const { A, B } = data;
  const n = A.length;

  function matMul(a, b) {
    const n = a.length;
    const c = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        for (let k = 0; k < n; k++) c[i][j] += a[i][k] * b[k][j];
    return c;
  }
  function addM(a, b) { return a.map((r, i) => r.map((v, j) => v + b[i][j])); }
  function subM(a, b) { return a.map((r, i) => r.map((v, j) => v - b[i][j])); }
  function getQ(m, r, c, s) { return Array.from({ length: s }, (_, i) => Array.from({ length: s }, (_, j) => m[r + i][c + j])); }
  function quadH(n, q) {
    const h = n / 2, map = {};
    const cls = { tl: 'quad-tl', tr: 'quad-tr', bl: 'quad-bl', br: 'quad-br' };
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const qd = (i < h ? (j < h ? 'tl' : 'tr') : (j < h ? 'bl' : 'br'));
        if (!q || qd === q) map[`${i},${j}`] = cls[qd];
      }
    return map;
  }

  steps.push({
    phase: 'ready',
    description: `Multiply ${n}×${n} matrices using Strassen's algorithm (only 7 multiplications!)`,
    matrices: [
      { label: 'A', data: A, highlights: {} },
      { label: 'B', data: B, highlights: {} }
    ],
    operators: ['×']
  });

  steps.push({
    phase: 'divide',
    description: `Divide each matrix into 4 sub-matrices of size ${n / 2}×${n / 2}`,
    matrices: [
      { label: 'A', data: A, highlights: quadH(n) },
      { label: 'B', data: B, highlights: quadH(n) }
    ],
    operators: ['×']
  });

  const h = n / 2;
  const A11 = getQ(A, 0, 0, h), A12 = getQ(A, 0, h, h);
  const A21 = getQ(A, h, 0, h), A22 = getQ(A, h, h, h);
  const B11 = getQ(B, 0, 0, h), B12 = getQ(B, 0, h, h);
  const B21 = getQ(B, h, 0, h), B22 = getQ(B, h, h, h);

  const Mlist = [
    { name: 'M1', formula: 'M1 = (A₁₁ + A₂₂)(B₁₁ + B₂₂)', val: matMul(addM(A11, A22), addM(B11, B22)) },
    { name: 'M2', formula: 'M2 = (A₂₁ + A₂₂) × B₁₁', val: matMul(addM(A21, A22), B11) },
    { name: 'M3', formula: 'M3 = A₁₁ × (B₁₂ − B₂₂)', val: matMul(A11, subM(B12, B22)) },
    { name: 'M4', formula: 'M4 = A₂₂ × (B₂₁ − B₁₁)', val: matMul(A22, subM(B21, B11)) },
    { name: 'M5', formula: 'M5 = (A₁₁ + A₁₂) × B₂₂', val: matMul(addM(A11, A12), B22) },
    { name: 'M6', formula: 'M6 = (A₂₁ − A₁₁)(B₁₁ + B₁₂)', val: matMul(subM(A21, A11), addM(B11, B12)) },
    { name: 'M7', formula: 'M7 = (A₁₂ − A₂₂)(B₂₁ + B₂₂)', val: matMul(subM(A12, A22), addM(B21, B22)) },
  ];

  Mlist.forEach((m, idx) => {
    const compH = {};
    m.val.forEach((row, r) => row.forEach((_, c) => { compH[`${r},${c}`] = 'computing'; }));
    steps.push({
      phase: 'conquer',
      description: `Computing ${m.formula} (product ${idx + 1} of 7)`,
      formula: m.formula,
      matrices: [
        { label: m.name, data: m.val, highlights: compH }
      ],
      operators: []
    });
  });

  const M1 = Mlist[0].val, M2 = Mlist[1].val, M3 = Mlist[2].val, M4 = Mlist[3].val;
  const M5 = Mlist[4].val, M6 = Mlist[5].val, M7 = Mlist[6].val;

  const C11 = addM(subM(addM(M1, M4), M5), M7);
  const C12 = addM(M3, M5);
  const C21 = addM(M2, M4);
  const C22 = addM(subM(addM(M1, M3), M2), M6);

  steps.push({
    phase: 'combine',
    description: 'Combining: C₁₁=M1+M4−M5+M7, C₁₂=M3+M5, C₂₁=M2+M4, C₂₂=M1−M2+M3+M6',
    formula: 'C₁₁ = M1+M4−M5+M7\nC₁₂ = M3+M5\nC₂₁ = M2+M4\nC₂₂ = M1−M2+M3+M6',
    matrices: [
      { label: 'C₁₁', data: C11, highlights: {} },
      { label: 'C₁₂', data: C12, highlights: {} },
      { label: 'C₂₁', data: C21, highlights: {} },
      { label: 'C₂₂', data: C22, highlights: {} }
    ],
    operators: ['', '', '']
  });

  const C = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
    if (i < h && j < h) return C11[i][j];
    if (i < h) return C12[i][j - h];
    if (j < h) return C21[i - h][j];
    return C22[i - h][j - h];
  }));

  steps.push({
    phase: 'complete',
    description: `Strassen's multiplication complete! Only 7 multiplications vs 8 in standard D&C.`,
    matrices: [
      { label: 'A', data: A, highlights: {} },
      { label: 'B', data: B, highlights: {} },
      { label: 'C = A×B', data: C, highlights: quadH(n) }
    ],
    operators: ['×', '=']
  });

  return steps;
}
