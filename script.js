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
const svmDegree = document.getElementById('svmDegree');
const degreeControl = document.getElementById('degreeControl');
const svmResult = document.getElementById('svmResult');
const cValue = document.getElementById('cValue');
const gValue = document.getElementById('gValue');
const degreeValue = document.getElementById('degreeValue');
const svmBoundary = document.getElementById('svmBoundary');
const svmMargin1 = document.getElementById('svmMargin1');
const svmMargin2 = document.getElementById('svmMargin2');
const presetButtons = document.querySelectorAll('[data-svm-preset]');

const petalLength = document.getElementById('petalLength');
const petalWidth = document.getElementById('petalWidth');
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
  if (!blueGroup || !pinkGroup) return;

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

function getPolyPath(offset = 0, degree = 3) {
  const topBend = clamp(192 - degree * 4, 162, 188);
  const midBend = clamp(154 - degree * 5, 112, 148);
  const lowBend = clamp(136 - degree * 4, 96, 132);
  return `M ${198 + offset} 16 C ${topBend + offset} 42, ${midBend + offset} 88, ${152 + offset} 132 C ${lowBend + offset} 158, ${132 + offset} 182, ${118 + offset} 204`;
}

function getRbfPath(offset = 0, gamma = 40) {
  const curve1 = clamp(54 - Math.round(gamma / 4), 22, 60);
  const curve2 = clamp(102 + Math.round(gamma / 3), 92, 138);
  const curve3 = clamp(176 - Math.round(gamma / 4), 138, 184);
  return `M ${208 + offset} 16 C ${156 + offset} ${curve1}, ${206 + offset} ${curve2}, ${166 + offset} 126 C ${146 + offset} ${curve3}, ${140 + offset} 182, ${126 + offset} 204`;
}

function updateDegreeVisibility() {
  if (!svmKernel || !degreeControl) return;
  degreeControl.style.display = svmKernel.value === 'poly' ? 'block' : 'none';
}

function updateSVM() {
  if (!svmKernel || !svmC || !svmGamma || !svmBoundary || !svmMargin1 || !svmMargin2) return;

  const kernel = svmKernel.value;
  const c = Number(svmC.value);
  const gamma = Number(svmGamma.value);
  const degree = Number(svmDegree ? svmDegree.value : 3);

  if (cValue) cValue.textContent = c;
  if (gValue) gValue.textContent = gamma;
  if (degreeValue) degreeValue.textContent = degree;
  updateDegreeVisibility();

  let mainPath = '';
  let kernelText = '';

  if (kernel === 'linear') {
    mainPath = getLinearPath(0);
    kernelText = 'Sekarang model memakai kernel linear. Artinya, model mencoba memisahkan data dengan batas yang lurus.';
  } else if (kernel === 'poly') {
    mainPath = getPolyPath(0, degree);
    kernelText = 'Sekarang model memakai kernel polynomial. Batas pemisahnya jadi lebih melengkung, dan degree membantu menentukan seberapa rumit lengkungannya.';
  } else {
    mainPath = getRbfPath(0, gamma);
    kernelText = 'Sekarang model memakai kernel RBF. Kernel ini lebih fleksibel, jadi cocok saat pola data tidak bisa dipisahkan dengan garis lurus sederhana.';
  }

  const marginShift = Math.max(10, Math.round((100 - c) / 3));
  let marginPath1 = '';
  let marginPath2 = '';

  if (kernel === 'linear') {
    marginPath1 = getLinearPath(marginShift);
    marginPath2 = getLinearPath(-marginShift);
  } else if (kernel === 'poly') {
    marginPath1 = getPolyPath(marginShift, degree);
    marginPath2 = getPolyPath(-marginShift, degree);
  } else {
    marginPath1 = getRbfPath(marginShift, gamma);
    marginPath2 = getRbfPath(-marginShift, gamma);
  }

  svmBoundary.setAttribute('d', mainPath);
  svmMargin1.setAttribute('d', marginPath1);
  svmMargin2.setAttribute('d', marginPath2);

  const cText = c < 35
    ? 'Nilai C saat ini cenderung rendah, jadi model masih cukup toleran terhadap beberapa kesalahan dan margin biasanya terasa lebih longgar.'
    : c < 70
    ? 'Nilai C saat ini berada di tengah, jadi model mencoba menyeimbangkan margin yang cukup aman dengan usaha memisahkan data dengan baik.'
    : 'Nilai C saat ini cukup tinggi, jadi model lebih ketat dan berusaha keras agar data latihan terpisah sebaik mungkin.';

  const gammaText = gamma < 35
    ? 'Gamma saat ini rendah, jadi model melihat pola secara lebih luas dan batas keputusannya cenderung lebih halus.'
    : gamma < 70
    ? 'Gamma saat ini sedang, jadi model cukup peka terhadap bentuk data tanpa terlalu berlebihan pada detail kecil.'
    : 'Gamma saat ini tinggi, jadi model lebih sensitif terhadap titik-titik di sekitar batas dan bentuknya bisa menjadi lebih detail.';

  const degreeText = kernel === 'poly'
    ? `<br>Degree saat ini adalah ${degree}. Semakin besar nilainya, kurva polynomial bisa menjadi semakin kompleks.`
    : '';

  if (svmResult) {
    svmResult.innerHTML = `
      <strong>Apa yang sedang terjadi?</strong><br>
      ${kernelText}<br>
      ${cText}<br>
      ${gammaText}${degreeText}<br><br>
      <strong>Inti yang perlu diperhatikan:</strong> walaupun parameternya berubah, tujuan SVM tetap sama, yaitu mencari batas pemisah yang paling baik antar kelas.
    `;
  }
}

function setSvmPreset(type) {
  if (!svmKernel || !svmC || !svmGamma) return;

  if (type === 'linear') {
    svmKernel.value = 'linear';
    svmC.value = '55';
    svmGamma.value = '20';
    if (svmDegree) svmDegree.value = '3';
  } else if (type === 'poly') {
    svmKernel.value = 'poly';
    svmC.value = '60';
    svmGamma.value = '35';
    if (svmDegree) svmDegree.value = '4';
  } else if (type === 'rbf-soft') {
    svmKernel.value = 'rbf';
    svmC.value = '30';
    svmGamma.value = '25';
    if (svmDegree) svmDegree.value = '3';
  } else if (type === 'rbf-tight') {
    svmKernel.value = 'rbf';
    svmC.value = '85';
    svmGamma.value = '80';
    if (svmDegree) svmDegree.value = '3';
  }

  updateSVM();
}

function buildTreeDiagram(prediction, width) {
  if (!treeDiagram) return;

  const setosaActive = prediction === 'Setosa';
  const rightBranchActive = prediction !== 'Setosa';
  const wideActive = width === 'lebar' && rightBranchActive;
  const notWideActive = width !== 'lebar' && rightBranchActive;

  treeDiagram.innerHTML = `
    <div class="tree-visual-root active">Root: semua data</div>
    <div class="tree-helper">Pertanyaan 1: apakah petal length pendek?</div>
    <div class="tree-visual-row two">
      <div class="tree-visual-node ${setosaActive ? 'active' : ''}">Ya</div>
      <div class="tree-visual-node ${rightBranchActive ? 'active' : ''}">Tidak</div>
    </div>
    <div class="tree-visual-row two">
      <div class="tree-visual-leaf ${setosaActive ? 'active' : ''}">Leaf: Setosa</div>
      <div class="tree-visual-node ${rightBranchActive ? 'active' : ''}">Pertanyaan 2: apakah petal width lebar?</div>
    </div>
    <div class="tree-visual-row two">
      <div class="tree-visual-leaf ${notWideActive ? 'active' : ''}">Tidak → Versicolor</div>
      <div class="tree-visual-leaf ${wideActive ? 'active' : ''}">Ya → Virginica</div>
    </div>
    <div class="tree-helper">Cabang yang aktif diberi sorotan supaya alurnya lebih mudah diikuti.</div>
  `;
}

function updateTree() {
  if (!petalLength || !petalWidth) return;

  const length = petalLength.value;
  const width = petalWidth.value;
  const steps = ['Root node: semua data mulai dari sini.'];
  let prediction = '';
  let explanation = '';

  if (length === 'pendek') {
    steps.push('Decision node: apakah petal length pendek? Ya.');
    prediction = 'Setosa';
    explanation = 'Karena petalnya pendek, model langsung mengarah ke kelas Setosa.';
  } else {
    steps.push('Decision node: apakah petal length pendek? Tidak.');
    if (width === 'lebar') {
      steps.push('Decision node: apakah petal width lebar? Ya.');
      prediction = 'Virginica';
      explanation = 'Karena petalnya tidak pendek dan lebarnya cenderung besar, model lebih dekat ke kelas Virginica.';
    } else {
      steps.push('Decision node: apakah petal width lebar? Tidak.');
      prediction = 'Versicolor';
      explanation = 'Karena petalnya tidak pendek tetapi juga tidak terlalu lebar, model lebih dekat ke kelas Versicolor.';
    }
  }

  if (treeFlow) {
    treeFlow.innerHTML = steps.map(step => `<div class="tree-node">${step}</div>`).join('');
  }

  if (treeResult) {
    treeResult.innerHTML = `
      <strong>Prediksi akhir:</strong> ${prediction}<br>
      ${explanation}<br><br>
      <strong>Inti yang perlu dipahami:</strong> Decision Tree bekerja seperti aturan if-else. Data bergerak dari root node, melewati decision node, lalu berakhir di leaf node.
    `;
  }

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
  if (!forestSummary) return;

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
  if (!forestSample || !forestTrees) return;

  const sample = forestSample.value;
  const numTrees = Number(forestTrees.value);

  if (forestTreesValue) forestTreesValue.textContent = numTrees;

  const votes = generateVotes(sample, numTrees);

  if (forestVotes) {
    forestVotes.innerHTML = votes.map((vote, index) => `
      <div class="vote-box">
        <strong>Tree ${index + 1}</strong><br>
        ${vote}
      </div>
    `).join('');
  }

  const counts = {};
  votes.forEach(vote => {
    counts[vote] = (counts[vote] || 0) + 1;
  });

  renderVoteSummary(counts, votes.length);

  const winner = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];

  let note = '';
  if (sample === 'mudah') {
    note = 'Karena datanya mudah, hampir semua tree cenderung sepakat pada kelas yang sama.';
  } else if (sample === 'sulit') {
    note = 'Karena datanya lebih ambigu, beberapa tree bisa berbeda pendapat. Di sinilah voting mayoritas menjadi penting.';
  } else {
    note = 'Saat data berada di tengah, hasil voting membantu membuat keputusan akhir menjadi lebih stabil.';
  }

  if (forestResult) {
    forestResult.innerHTML = `
      <strong>Prediksi akhir:</strong> ${winner}<br>
      ${note}<br><br>
      <strong>Inti yang perlu dipahami:</strong> Random Forest tidak bergantung pada satu pohon saja, tetapi menggabungkan banyak pohon agar hasil akhirnya lebih kuat.
    `;
  }
}

function init() {
  drawInitialPoints();
  updateSVM();
  updateTree();
  updateForest();

  if (svmKernel) svmKernel.addEventListener('change', updateSVM);
  if (svmC) svmC.addEventListener('input', updateSVM);
  if (svmGamma) svmGamma.addEventListener('input', updateSVM);
  if (svmDegree) svmDegree.addEventListener('input', updateSVM);

  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      setSvmPreset(button.dataset.svmPreset);
    });
  });

  if (petalLength) petalLength.addEventListener('change', updateTree);
  if (petalWidth) petalWidth.addEventListener('change', updateTree);

  if (forestSample) forestSample.addEventListener('change', updateForest);
  if (forestTrees) forestTrees.addEventListener('input', updateForest);
}

init();