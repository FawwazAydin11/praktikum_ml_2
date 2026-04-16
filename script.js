const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.remove('hidden');
  });
});

const bluePoints = [
  [40, 34],[62,48],[78,69],[55,94],[81,110],[42,132],[70,150],[98,174],[92,35],[103,96],[60,184],[118,58]
];
const pinkPoints = [
  [278,32],[248,56],[292,76],[253,94],[284,116],[244,136],[274,158],[302,178],[221,72],[230,116],[212,166],[310,104]
];

const blueGroup = document.getElementById('svmBlue');
const pinkGroup = document.getElementById('svmPink');

bluePoints.forEach(([x, y]) => {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', x);
  c.setAttribute('cy', y);
  c.setAttribute('r', 5);
  c.setAttribute('fill', '#3b82f6');
  blueGroup.appendChild(c);
});

pinkPoints.forEach(([x, y]) => {
  const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  r.setAttribute('x', x - 4);
  r.setAttribute('y', y - 4);
  r.setAttribute('width', 8);
  r.setAttribute('height', 8);
  r.setAttribute('rx', 1.5);
  r.setAttribute('fill', '#ec4899');
  pinkGroup.appendChild(r);
});

const svmKernel = document.getElementById('svmKernel');
const svmC = document.getElementById('svmC');
const svmGamma = document.getElementById('svmGamma');
const svmResult = document.getElementById('svmResult');
const cValue = document.getElementById('cValue');
const gValue = document.getElementById('gValue');
const svmBoundary = document.getElementById('svmBoundary');
const svmMargin1 = document.getElementById('svmMargin1');
const svmMargin2 = document.getElementById('svmMargin2');

function offsetPath(points, offset) {
  return points.map((p, i) => {
    if (i === 0 && p.length === 2) return `M ${p[0] + offset} ${p[1]}`;
    if (p.length === 6) return `C ${p[0] + offset} ${p[1]}, ${p[2] + offset} ${p[3]}, ${p[4] + offset} ${p[5]}`;
    return `L ${p[0] + offset} ${p[1]}`;
  }).join(' ');
}

function updateSVM() {
  const kernel = svmKernel.value;
  const c = Number(svmC.value);
  const gamma = Number(svmGamma.value);
  cValue.textContent = c;
  gValue.textContent = gamma;

  let boundaryPoints;
  let kernelText;

  if (kernel === 'linear') {
    boundaryPoints = [[185, 15], [170, 205]];
    kernelText = 'Kernel linear cocok saat data relatif bisa dipisahkan dengan garis lurus.';
  } else if (kernel === 'poly') {
    boundaryPoints = [[198, 14, 176, 60, 164, 110], [156, 140, 145, 170, 128, 205]];
    kernelText = 'Kernel polynomial membuat batas keputusan lebih melengkung daripada linear.';
  } else {
    const bend = Math.max(18, Math.round(gamma / 2));
    boundaryPoints = [[212, 14, 150, 36 + bend, 196, 104], [220, 146, 150, 180, 128, 205]];
    kernelText = 'Kernel RBF sangat fleksibel dan sering dipakai saat pola data tidak linier.';
  }

  const mainPath = offsetPath(boundaryPoints, 0);
  const margin = Math.max(10, Math.round((100 - c) / 3));
  svmBoundary.setAttribute('d', mainPath);
  svmMargin1.setAttribute('d', offsetPath(boundaryPoints, margin));
  svmMargin2.setAttribute('d', offsetPath(boundaryPoints, -margin));

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

  svmResult.innerHTML = `<b>Penjelasan saat ini:</b><br>${kernelText}<br>${cText}<br>${gammaText}<br><br><b>Cara menjelaskannya di kelas:</b> ubah-ubah nilai parameter, lalu tunjukkan bahwa bentuk dan perilaku batas keputusan bisa berubah walaupun tujuan modelnya tetap sama, yaitu memisahkan dua kelas sebaik mungkin.`;
}

svmKernel.addEventListener('change', updateSVM);
svmC.addEventListener('input', updateSVM);
svmGamma.addEventListener('input', updateSVM);
updateSVM();

const petalLength = document.getElementById('petalLength');
const petalWidth = document.getElementById('petalWidth');
const treeDepth = document.getElementById('treeDepth');
const depthValue = document.getElementById('depthValue');
const treeFlow = document.getElementById('treeFlow');
const treeResult = document.getElementById('treeResult');

function updateTree() {
  const length = petalLength.value;
  const width = petalWidth.value;
  const depth = Number(treeDepth.value);
  depthValue.textContent = depth;

  const steps = ['Root node: semua data masuk dari sini'];
  let prediction = '';
  let note = '';

  if (length === 'pendek') {
    steps.push('Decision node: apakah petal length pendek? Ya');
    prediction = 'Setosa';
    note = 'Karena petalnya pendek, data ini cepat masuk ke kelas Setosa.';
  } else {
    steps.push('Decision node: apakah petal length pendek? Tidak');
    if (width === 'lebar') {
      steps.push('Decision node: apakah petal width lebar? Ya');
      prediction = 'Virginica';
      note = 'Karena petal cukup besar, data diarahkan ke kelas Virginica.';
    } else {
      steps.push('Decision node: apakah petal width lebar? Tidak');
      prediction = 'Versicolor';
      note = 'Karena nilainya berada di tengah, data lebih dekat ke kelas Versicolor.';
    }
  }

  if (depth <= 2) {
    note += ' Pada simulasi ini, kedalaman pohon rendah sehingga aturan lebih sederhana.';
  } else if (depth >= 4) {
    note += ' Pada simulasi ini, kedalaman pohon lebih besar sehingga aturan bisa makin detail, tetapi risiko overfitting juga naik.';
  } else {
    note += ' Kedalaman sedang biasanya cukup seimbang untuk penjelasan awal.';
  }

  treeFlow.innerHTML = steps.map(step => `<div class="tree-node">${step}</div>`).join('');
  treeResult.innerHTML = `<b>Prediksi akhir:</b> ${prediction}<br>${note}`;
}

petalLength.addEventListener('change', updateTree);
petalWidth.addEventListener('change', updateTree);
treeDepth.addEventListener('input', updateTree);
updateTree();

const forestSample = document.getElementById('forestSample');
const forestTrees = document.getElementById('forestTrees');
const forestTreesValue = document.getElementById('forestTreesValue');
const forestVotes = document.getElementById('forestVotes');
const forestResult = document.getElementById('forestResult');

function generateVotes(sample, numTrees) {
  const easy = ['Setosa', 'Setosa', 'Setosa', 'Setosa', 'Setosa', 'Setosa', 'Setosa', 'Setosa', 'Setosa'];
  const medium = ['Versicolor', 'Versicolor', 'Virginica', 'Versicolor', 'Virginica', 'Versicolor', 'Versicolor', 'Virginica', 'Versicolor'];
  const hard = ['Virginica', 'Versicolor', 'Virginica', 'Virginica', 'Versicolor', 'Virginica', 'Versicolor', 'Virginica', 'Versicolor'];
  const source = sample === 'mudah' ? easy : sample === 'sulit' ? hard : medium;
  return source.slice(0, numTrees);
}

function updateForest() {
  const sample = forestSample.value;
  const numTrees = Number(forestTrees.value);
  forestTreesValue.textContent = numTrees;
  const votes = generateVotes(sample, numTrees);
  forestVotes.innerHTML = votes.map((vote, i) => `<div class="vote-box"><b>Tree ${i + 1}</b><br>${vote}</div>`).join('');

  const counts = {};
  votes.forEach(v => counts[v] = (counts[v] || 0) + 1);
  const winner = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];

  let note = '';
  if (sample === 'mudah') note = 'Saat data mudah, hampir semua tree cenderung sepakat.';
  else if (sample === 'sulit') note = 'Saat data ambigu, beberapa tree bisa berbeda pendapat, sehingga voting mayoritas menjadi penting.';
  else note = 'Saat data berada di tengah, hasil voting membantu membuat keputusan lebih stabil.';

  forestResult.innerHTML = `<b>Prediksi akhir:</b> ${winner}<br><b>Ringkasan:</b> ${note}<br><br><b>Cara menjelaskannya di kelas:</b> tunjukkan bahwa Random Forest tidak bergantung pada satu pohon saja, melainkan menggabungkan banyak pohon agar hasil akhir lebih kuat.`;
}

forestSample.addEventListener('change', updateForest);
forestTrees.addEventListener('input', updateForest);
updateForest();
