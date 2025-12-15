let model;

// Назви ознак
const featureNames = [
  'Alcohol', 'Malic Acid', 'Ash', 'Alcalinity of Ash', 
  'Magnesium', 'Total Phenols', 'Flavanoids', 'Nonflavanoid Phenols', 
  'Proanthocyanins', 'Color Intensity', 'Hue', 
  'OD280/OD315 of Diluted Wines', 'Proline'
];

// Класи вин
const classNames = ['Barolo', 'Grignolino', 'Barbera'];

// UI елементи
const featuresDiv = document.getElementById('features');
const predictBtn = document.getElementById('predict-btn');
const resultDiv = document.getElementById('result');

// 1. Створюємо поля вводу динамічно
function createFeatureInputs() {
  featureNames.forEach((name, i) => {
    // Створюємо контейнер для кожного поля (для стилізації Grid)
    const wrapper = document.createElement('div');
    wrapper.className = 'input-group';

    const label = document.createElement('label');
    label.setAttribute('for', `feature_${i}`);
    label.innerText = name;

    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.id = `feature_${i}`;
    input.placeholder = '0.0';
    // Додаємо required, щоб браузер сам валідував порожні поля
    input.required = true; 

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    featuresDiv.appendChild(wrapper);
  });
}

// 2. Завантаження моделі
async function loadModel() {
  try {
    // Шлях до моделі має бути правильним відносно index.html
    model = await tf.loadGraphModel('model/model.json');
    
    // Активуємо кнопку після завантаження
    predictBtn.disabled = false;
    predictBtn.innerText = 'Predict Class';
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
    predictBtn.innerText = 'Error Loading Model';
    alert('Failed to load the model. Check console for details.');
  }
}

// 3. Обробка передбачення
async function handlePredict(event) {
  event.preventDefault();

  const inputs = [];
  
  // Збір даних
  for (let i = 0; i < featureNames.length; i++) {
    const inputEl = document.getElementById(`feature_${i}`);
    const val = parseFloat(inputEl.value);

    // Додаткова перевірка (хоча input type="number" і required вже допомагають)
    if (isNaN(val)) {
      alert(`Please enter a valid number for ${featureNames[i]}`);
      inputEl.focus();
      return;
    }
    inputs.push(val);
  }

  // Створюємо тензор
  const inputTensor = tf.tensor2d([inputs]);

  // Передбачення
  const output = model.predict(inputTensor);
  const data = await output.data();

  // Знаходимо індекс з найбільшою ймовірністю
  const predictedIndex = data.indexOf(Math.max(...data));
  const className = classNames[predictedIndex];
  
  // Виведення результату
  displayResult(className, predictedIndex);
  
  // Очистка пам'яті тензора
  inputTensor.dispose();
}

function displayResult(className, index) {
  resultDiv.innerHTML = `
    <span>Result:</span><br>
    The wine is classified as <strong>${className}</strong>
  `;
  resultDiv.classList.remove('hidden');
  
  // Плавний скрол до результату на мобільних
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Ініціалізація
window.addEventListener('DOMContentLoaded', async () => {
  createFeatureInputs();
  await loadModel();

  const form = document.getElementById('wine-form');
  form.addEventListener('submit', handlePredict);
});