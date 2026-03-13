/* =======================================
   RENDERERS - Visualization rendering
   ======================================= */

function renderStep(type, step) {
  switch (type) {
    case 'bars': renderBars(step); break;
    case 'cards': renderCards(step); break;
    case 'scatter': renderScatter(step); break;
    case 'matrix': renderMatrix(step); break;
  }
}

// ---- BAR CHART RENDERER ----
function renderBars(step) {
  const arr = step.array;
  const maxVal = Math.max(...arr);
  let html = '<div class="bars-container">';
  arr.forEach((val, i) => {
    const h = Math.max(8, (val / maxVal) * 85);
    let cls = '';
    if (step.sorted && step.sorted.includes(i)) cls = 'sorted';
    if (step.leftRange && i >= step.leftRange[0] && i <= step.leftRange[1]) cls = 'left-part';
    if (step.rightRange && i >= step.rightRange[0] && i <= step.rightRange[1]) cls = 'right-part';
    if (step.comparing && step.comparing.includes(i)) cls = 'comparing';
    if (step.merging && step.merging.includes(i)) cls = 'merging';
    if (step.pivot === i) cls = 'pivot';
    if (step.placed && step.placed.includes(i)) cls = 'sorted';
    html += `<div class="bar-wrapper"><div class="bar ${cls}" style="height:${h}%"></div><span class="bar-label">${val}</span></div>`;
  });
  html += '</div>';
  viz.innerHTML = html;
}

// ---- CARD ARRAY RENDERER ----
function renderCards(step) {
  let html = '<div class="cards-container">';
  // Main array row
  html += '<div class="cards-row">';
  step.array.forEach((val, i) => {
    let cls = '';
    if (step.highlightLeft && i >= step.highlightLeft[0] && i <= step.highlightLeft[1]) cls = 'highlight-left';
    if (step.highlightRight && i >= step.highlightRight[0] && i <= step.highlightRight[1]) cls = 'highlight-right';
    if (step.highlightCross && i >= step.highlightCross[0] && i <= step.highlightCross[1]) cls = 'highlight-cross';
    if (step.highlightActive && step.highlightActive.includes(i)) cls = 'highlight-active';
    if (step.highlightResult && step.highlightResult.includes(i)) cls = 'highlight-result';
    if (step.highlightMin && step.highlightMin.includes(i)) cls = 'highlight-min';
    if (step.highlightMax && step.highlightMax.includes(i)) cls = 'highlight-max';
    if (step.dimmed && step.dimmed.includes(i)) cls += ' dimmed';
    html += `<div class="card ${cls}">${val}</div>`;
  });
  html += '</div>';
  // Info row
  if (step.info) {
    html += '<div class="cards-info-row">';
    step.info.forEach(item => {
      html += `<div><span class="cards-label">${item.label}</span><div class="cards-value">${item.value}</div></div>`;
    });
    html += '</div>';
  }
  html += '</div>';
  viz.innerHTML = html;
}

// ---- SCATTER PLOT RENDERER ----
function renderScatter(step) {
  const W = 600, H = 400;
  let svg = `<div class="scatter-container"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`;
  // Grid lines
  for (let x = 50; x < W; x += 50) svg += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" class="scatter-line"/>`;
  for (let y = 50; y < H; y += 50) svg += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" class="scatter-line"/>`;
  // Strip
  if (step.strip) {
    svg += `<rect x="${step.strip[0]}" y="0" width="${step.strip[1] - step.strip[0]}" height="${H}" class="scatter-strip"/>`;
  }
  // Divider
  if (step.dividerX != null) {
    svg += `<line x1="${step.dividerX}" y1="0" x2="${step.dividerX}" y2="${H}" class="scatter-divider"/>`;
  }
  // Hull fill
  if (step.hullFill && step.hullFill.length > 2) {
    svg += `<polygon points="${step.hullFill.map(p => `${p.x},${p.y}`).join(' ')}" class="scatter-hull-fill"/>`;
  }
  // Hull edges
  if (step.hullEdges) {
    step.hullEdges.forEach(e => {
      svg += `<line x1="${e[0].x}" y1="${e[0].y}" x2="${e[1].x}" y2="${e[1].y}" class="scatter-hull"/>`;
    });
  }
  // Connection line
  if (step.connection) {
    svg += `<line x1="${step.connection[0].x}" y1="${step.connection[0].y}" x2="${step.connection[1].x}" y2="${step.connection[1].y}" class="scatter-connection"/>`;
  }
  // Points
  step.points.forEach((p, i) => {
    let cls = 'scatter-point';
    if (step.leftSet && step.leftSet.includes(i)) cls += ' left-set';
    if (step.rightSet && step.rightSet.includes(i)) cls += ' right-set';
    if (step.highlightPts && step.highlightPts.includes(i)) cls += ' highlight';
    if (step.resultPts && step.resultPts.includes(i)) cls += ' result';
    svg += `<circle cx="${p.x}" cy="${p.y}" r="5" class="${cls}"/>`;
  });
  svg += '</svg></div>';
  viz.innerHTML = svg;
}

// ---- MATRIX RENDERER ----
function renderMatrix(step) {
  let html = '<div class="matrix-container">';
  if (step.formula) {
    html += `<div class="matrix-formula-display">${step.formula}</div>`;
  }
  html += '<div class="matrix-row-display">';
  step.matrices.forEach((mat, mi) => {
    if (mi > 0 && step.operators && step.operators[mi - 1]) {
      html += `<span class="matrix-operator">${step.operators[mi - 1]}</span>`;
    }
    const n = mat.data.length;
    html += `<div><div class="matrix-label">${mat.label}</div><div class="matrix-grid" style="grid-template-columns:repeat(${mat.data[0].length},1fr)">`;
    mat.data.forEach((row, r) => {
      row.forEach((val, c) => {
        let cls = 'matrix-cell';
        if (mat.highlights) {
          const key = `${r},${c}`;
          if (mat.highlights[key]) cls += ' ' + mat.highlights[key];
        }
        html += `<div class="${cls}">${val}</div>`;
      });
    });
    html += '</div></div>';
  });
  html += '</div></div>';
  viz.innerHTML = html;
}
