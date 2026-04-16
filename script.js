const bluePoints = [
  [40, 34], [62, 48], [78, 69], [55, 94], [81, 110], [42, 132], [70, 150], [98, 174], [92, 35], [103, 96], [60, 184], [118, 58]
];

const pinkPoints = [
  [278, 32], [248, 56], [292, 76], [253, 94], [284, 116], [244, 136], [274, 158], [302, 178], [221, 72], [230, 116], [212, 166], [310, 104]
];

const blueGroup = document.getElementById('svmBlue');
const pinkGroup = document.getElementById('svmPink');
const svmKernel = document.getElementById('svmKernel');
const svmC = document.getElementById('svmC');
const svmGamma = document.getElementById('svmGamma');
const svmResult = document.getElementById('svmResult');
const cValue = document.getElementById('cValue');
const gValue = document.getElementById('gValue');
const svmBoundary = document.getElementById('svmBoundary');
const svmMargin1 = document.getElementById('svmMargin1');
const svmMargin2 = document.getElementById('svmMargin2');
const presetButtons = document.querySelectorAll('[data-svm-preset]');

const petalLength = document.getElementById('petalLength');
const petalWidth = document.getElementById('petalWidth');
const treeDepth = document.getElementById('treeDepth');
const depthValue = document.getElementById('depthValue');
const treeDiagram = document.getElementById('treeDiagram');
const treeFlow = document.getElementById('treeFlow');
const treeResult = document.getElementById('treeResult');

const forestSample = document.getElementById('forestSample');
const forestTrees = document.getElementById('forestTrees');
const forestTreesValue = document.getElementById('forestTreesValue');
const forestVotes = document.getElementById('forestVotes');
const forestSummary = document.getElementById('forestSummary');
const forestResult = document.getElementById('forestResult');

function drawInitialPoints() {
  bluePoints.forEach(([x, y]) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 5);
    circle.setAttribute('fill', '#3b82f6');
    blueGroup.appendChild(circle);
  });

  pinkPoints.forEach(([x, y]) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x - 4);
    rect.setAttribute('y', y - 4);
    rect.setAttribute('width', 8);
    rect.setAttribute('height', 8);
    rect.setAttribute('rx', 1.5);
    rect.setAttribute('fill', '#ec4899');
    pinkGroup.appendChild(rect);
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getLinearPath(offset = 0) {
  return `M ${185 + offset} 16 L ${170 + offset} 204`;
}

function getPolyPath(offset = 0) {
  return `M ${194 + offset} 16 C ${178 + offset} 54, ${168 + offset} 94, ${152 + offset} 138 C ${146 + offset} 160, ${138 + offset} 182, ${126 + offset} 204`;
}

function getRbfPath(offset = 0, gamma = 40) {
  const curve1 = clamp(54 - Math.round(gamma / 4), 22, 60);
  const curve2 = clamp(102 + Math.round(gamma / 3), 92, 138);
  const curve3 = clamp(176 - Math.round(gamma / 4), 138, 184);
  return `M ${208 + offset} 16 C ${156 + offset} ${curve1}, ${206 + offset} ${curve2}, ${166 + offset} 126 C ${146 + offset} ${curve3}, ${140 + offset} 182, ${126 + offset} 204`;
}

function updateSVM() {
  const kernel = svmKernel.value;
  const c = Number(svmC.value);
  const gamma = Number(svmGamma.value);

  cValue.textContent = c;
  gValue.textContent = gamma;

  let mainPath = '';
  let kernelText = '';

  if (kernel === 'linear') {
    mainPath = getLinearPath(0);
    kernelText = 'Kernel linear cocok saat data relatif bisa dipisahkan dengan garis lurus.';
  } else if (kernel === 'poly') {
    mainPath = getPolyPath(0);
    kernelText = 'Kernel polynomial membuat batas keputusan lebih melengkung daripada linear.';
  } else {
    mainPath = getRbfPath(0, gamma);
    kernelText = 'Kernel RBF sangat fleksibel dan sering dipakai saat pola data tidak linier.';
  }

  const marginShift = Math.max(10, Math.round((100 - c) / 3));
  let marginPath1 = '';
  let marginPath2 = '';

  if (kernel === 'linear') {
    marginPath1 = getLinearPath(marginShift);
    marginPath2 = getLinearPath(-marginShift);
  } else if (kernel === 'poly') {
    marginPath1 = getPolyPath(marginShift);
    marginPath2 = getPolyPath(-marginShift);
  } else {
    marginPath1 = getRbfPath(marginShift, gamma);
    marginPath2 = getRbfPath(-marginShift, gamma);
  }

  svmBoundary.setAttribute('d', mainPath);
  svmMargin1.setAttribute('d', marginPath1);
  svmMargin2.setAttribute('d', marginPath2);

  const cText = c < 35
    ? 'Nilai C rendah membuat model lebih toleran terhadap beberapa kesalahan pada data latihan, sehingga margin cenderung lebih lebar.'
    : c < 70
    ? 'Nilai C sedang memberi keseimbangan antara margin yang cukup lebar dan usaha memisahkan data dengan baik.'
    : 'Nilai C tinggi membuat model lebih ketat agar data latihan terpisah sebaik mungkin, tetapi margin bisa menjadi lebih sempit.';

  const gammaText = gamma < 35
    ? 'Gamma rendah membuat batas keputusan lebih halus dan lebih umum.'
    : gamma < 70
    ? 'Gamma sedang membuat model cukup fleksibel mengikuti pola data.'
    : 'Gamma tinggi membuat model sangat sensitif terhadap pola di sekitar titik data.';

  svmResult.innerHTML = `
    <strong>Apa yang sedang terjadi?</strong><br>
    ${kernelText}<br>
    ${cText}<br>
    ${gammaText}<br><br>
    <strong>Inti yang perlu dipahami:</strong> walaupun parameternya berubah, tujuan SVM tetap sama, yaitu mencari batas pemisah yang paling baik antar kelas.
  `;
}

function setSvmPreset(type) {
  if (type === 'linear') {
    svmKernel.value = 'linear';
    svmC.value = '55';
    svmGamma.value = '20';
  } else if (type === 'rbf-soft') {
    svmKernel.value = 'rbf';
    svmC.value = '30';
    svmGamma.value = '25';
  } else if (type === 'rbf-tight') {
    svmKernel.value = 'rbf';
    svmC.value = '85';
    svmGamma.value = '80';
  }
  updateSVM();
}

function buildTreeDiagram(prediction, width) {
  const leftLeafActive = prediction === 'Setosa';
  const centerLeafActive = prediction === 'Versicolor';
  const rightLeafActive = prediction === 'Virginica';
  const rightBranchActive = prediction !== 'Setosa';
  const wideActive = width === 'lebar' && rightBranchActive;
  const notWideActive = width !== 'lebar' && rightBranchActive;

  treeDiagram.innerHTML = `
    <div class="tree-visual-root active">Root: semua data</div>
    <div class="tree-helper">Pertanyaan 1: apakah petal length pendek?</div>
    <div class="tree-visual-row two">
      <div class="tree-visual-node ${leftLeafActive ? 'active' : ''}">Ya</div>
      <div class="tree-visual-node ${rightBranchActive ? 'active' : ''}">Tidak</div>
    </div>
    <div class="tree-visual-row two">
      <div class="tree-visual-leaf ${leftLeafActive ? 'active' : ''}">Leaf: Setosa</div>
      <div class="tree-visual-node ${rightBranchActive ? 'active' : ''}">Pertanyaan 2: apakah petal width lebar?</div>
    </div>
    <div class="tree-visual-row two">
      <div class="tree-visual-leaf ${centerLeafActive ? 'active' : ''}">Tidak → Versicolor</div>
      <div class="tree-visual-leaf ${rightLeafActive ? 'active' : ''}">Ya → Virginica</div>
    </div>
    <div class="tree-helper">Cabang yang aktif akan diberi sorotan.</div>
  `;
}

function updateTree() {
  const length = petalLength.value;
  const width = petalWidth.value;
  const depth = Number(treeDepth.value);

  depthValue.textContent = depth;

  const steps = ['Root node: semua data mulai dari sini'];
  let prediction = '';
  let explanation = '';

  if (length === 'pendek') {
    steps.push('Decision node: apakah petal length pendek? Ya');
    prediction = 'Setosa';
    explanation = 'Karena petalnya pendek, data ini langsung mengarah ke kelas Setosa.';
  } else {
    steps.push('Decision node: apakah petal length pendek? Tidak');
    if (width === 'lebar') {
      steps.push('Decision node: apakah petal width lebar? Ya');
      prediction = 'Virginica';
      explanation = 'Karena petal cukup besar, data lebih dekat ke kelas Virginica.';
    } else {
      steps.push('Decision node: apakah petal width lebar? Tidak');
      prediction = 'Versicolor';
      explanation = 'Karena nilainya berada di tengah, data lebih dekat ke kelas Versicolor.';
    }
  }

  if (depth <= 2) {
    explanation += ' Kedalaman pohon rendah membuat aturan lebih sederhana.';
  } else if (depth >= 4) {
    explanation += ' Kedalaman pohon yang lebih besar membuat aturan lebih rinci, tetapi juga meningkatkan risiko overfitting.';
  } else {
    explanation += ' Kedalaman sedang biasanya cukup seimbang untuk memahami alur keputusan.';
  }

  treeFlow.innerHTML = steps.map(step => `<div class="tree-node">${step}</div>`).join('');
  treeResult.innerHTML = `
    <strong>Prediksi akhir:</strong> ${prediction}<br>
    ${explanation}
  `;

  buildTreeDiagram(prediction, width);
}

function generateVotes(sample, numTrees) {
  const easy = ['Setosa', 'Setosa', 'Setosa', 'Setosa', 'Setosa', 'Setosa', 'Setosa', 'Setosa', 'Setosa'];
  const medium = ['Versicolor', 'Versicolor', 'Virginica', 'Versicolor', 'Virginica', 'Versicolor', 'Versicolor', 'Virginica', 'Versicolor'];
  const hard = ['Virginica', 'Versicolor', 'Virginica', 'Virginica', 'Versicolor', 'Virginica', 'Versicolor', 'Virginica', 'Versicolor'];

  const source = sample === 'mudah' ? easy : sample === 'sulit' ? hard : medium;
  return source.slice(0, numTrees);
}

function renderVoteSummary(counts, total) {
  const classes = ['Setosa', 'Versicolor', 'Virginica'];
  const classMap = {
    Setosa: 'setosa',
    Versicolor: 'versicolor',
    Virginica: 'virginica'
  };

  forestSummary.innerHTML = classes.map(label => {
    const count = counts[label] || 0;
    const percent = total === 0 ? 0 : (count / total) * 100;
    return `
      <div class="summary-bar">
        <div class="summary-bar-label">
          <span>${label}</span>
          <span>${count} suara</span>
        </div>
        <div class="summary-track">
          <div class="summary-fill ${classMap[label]}" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function updateForest() {
  const sample = forestSample.value;
  const numTrees = Number(forestTrees.value);

  forestTreesValue.textContent = numTrees;

  const votes = generateVotes(sample, numTrees);
  forestVotes.innerHTML = votes.map((vote, index) => `
    <div class="vote-box">
      <strong>Tree ${index + 1}</strong><br>
      ${vote}
    </div>
  `).join('');

  const counts = {};
  votes.forEach(vote => {
    counts[vote] = (counts[vote] || 0) + 1;
  });

  renderVoteSummary(counts, votes.length);

  const winner = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];

  let note = '';
  if (sample === 'mudah') {
    note = 'Saat datanya mudah, hampir semua tree cenderung sepakat.';
  } else if (sample === 'sulit') {
    note = 'Saat datanya ambigu, beberapa tree bisa berbeda pendapat. Di sinilah voting mayoritas menjadi penting.';
  } else {
    note = 'Saat data berada di tengah, hasil voting membantu membuat keputusan lebih stabil.';
  }

  forestResult.innerHTML = `
    <strong>Prediksi akhir:</strong> ${winner}<br>
    ${note}<br><br>
    <strong>Inti yang perlu dipahami:</strong> Random Forest tidak bergantung pada satu pohon saja, tetapi menggabungkan banyak pohon agar hasil akhirnya lebih kuat.
  `;
}

function init() {
  drawInitialPoints();
  updateSVM();
  updateTree();
  updateForest();

  svmKernel.addEventListener('change', updateSVM);
  svmC.addEventListener('input', updateSVM);
  svmGamma.addEventListener('input', updateSVM);

  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      setSvmPreset(button.dataset.svmPreset);
    });
  });

  petalLength.addEventListener('change', updateTree);
  petalWidth.addEventListener('change', updateTree);
  treeDepth.addEventListener('input', updateTree);

  forestSample.addEventListener('change', updateForest);
  forestTrees.addEventListener('input', updateForest);
}

init();