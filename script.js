const menu = document.getElementById('menu');
const gameContainer = document.getElementById('game-container');
const panels = document.querySelectorAll('.panel');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('bestScore');
const playerNameInput = document.getElementById('playerName');
const gameOverModal = document.getElementById('gameOverModal');
const scoresTable = document.querySelector('#scoresTable tbody');

let sequence = [];
let userSequence = [];
let score = 0;
let gameStarted = false;
let currentPlayer = '';
const controls = document.getElementById('controls');

const soundFiles = {
    red: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    blue: 'https://actions.google.com/sounds/v1/alarms/medium_bell_ring_near.ogg',
    yellow: 'https://actions.google.com/sounds/v1/alarms/dosimeter_alarm.ogg',
    green: 'https://actions.google.com/sounds/v1/alarms/glass_clink-tones.ogg'
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Ejecuta Sonido

function playSound(color) {
    const frequencies = {
        red: 330,
        blue: 440,
        yellow: 550,
        green: 660
    };

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Efecto de vibrato
    const vibrato = audioContext.createOscillator();
    vibrato.frequency.value = 5;
    const vibratoGain = audioContext.createGain();
    vibratoGain.gain.value = 20;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(oscillator.frequency);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequencies[color], audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    vibrato.start();
    oscillator.start();
    
    oscillator.stop(audioContext.currentTime + 0.3);
    vibrato.stop(audioContext.currentTime + 0.3);
}

// Actualiza la tabla de mejores puntajes
function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('simonScores')) || [];
    scoresTable.innerHTML = '';
    
    scores.sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .forEach(entry => {
              const row = document.createElement('tr');
              row.innerHTML = `<td>${entry.name}</td><td>${entry.score}</td>`;
              scoresTable.appendChild(row);
          });
}

// Guarda los valores de mejores puntajes a LocalStorage
function saveScore() {
    const scores = JSON.parse(localStorage.getItem('simonScores')) || [];
    const existing = scores.find(entry => entry.name === currentPlayer);
    
    if (existing) {
        if (score > existing.score) {
            existing.score = score;
        }
    } else {
        scores.push({ name: currentPlayer, score });
    }
    
    localStorage.setItem('simonScores', JSON.stringify(scores));
    updateLeaderboard();
}

// Restricciones de iniciar el juego
function startGame() {
    if (!playerNameInput.value.trim()) {
        alert('Por favor ingresa tu nombre');
        return;
    }
    
    currentPlayer = playerNameInput.value.trim();
    menu.style.display = 'none';
    gameContainer.style.display = 'block';
    controls.style.display = 'block'; // Mostrar controles
    initializeGame();
}

// Empieza el juego
function initializeGame() {
    sequence = [];
    userSequence = [];
    score = 0;
    scoreDisplay.textContent = '0'; // Muestra 0 inicialmente
    gameStarted = true;
    nextRound(); // Ahora nextRound no incrementa el score
}

// Incrementa la cantidad de botones en cada cadena de la ronda
function nextRound() {
    userSequence = [];
    sequence.push(getRandomColor());
    playSequence();
}


// Elemento Pseudo-random donde elige el color
function getRandomColor() {
    const colors = ['red', 'blue', 'yellow', 'green'];
    return colors[Math.floor(Math.random() * 4)];
}

// Ejecuta la secuencia de botones
function playSequence() {
    let i = 0;
    disableUserInput();
    
    const interval = setInterval(() => {
        if (i < sequence.length) {
            activatePanel(sequence[i]);
            i++;
        } else {
            clearInterval(interval);
            if (gameStarted) { // Solo habilita si el juego sigue activo
                enableUserInput();
            }
        }
    }, 800);
}

// ejecuta la animacion del boton
function activatePanel(color) {
    const panel = document.querySelector(`.${color}`); // Selección por clase
    panel.classList.add('active');
    playSound(color);
    setTimeout(() => panel.classList.remove('active'), 400);
}

// si el boton presionado es el correcto, el jugador se mueve a la siguiente ronda, si no, se termina el juego
function handleClick(e) {
    if (!gameStarted) return;
    
    const color = e.currentTarget.classList[1];
    userSequence.push(color);
    activatePanel(color);

    if (userSequence[userSequence.length - 1] !== sequence[userSequence.length - 1]) {
        gameOver();
        return;
    }

    if (userSequence.length === sequence.length) {
        score++; // Incrementa solo cuando se completa la ronda
        scoreDisplay.textContent = score;
        disableUserInput();
        setTimeout(nextRound, 1000);
    }
}



function disableUserInput() {
    panels.forEach(panel => {
        panel.style.pointerEvents = 'none';
        panel.style.cursor = 'not-allowed';
    });
}

function enableUserInput() {
    panels.forEach(panel => {
        panel.style.pointerEvents = 'auto';
        panel.style.cursor = 'pointer';
    });
}

// termina la ronda
function gameOver() {
    gameStarted = false;
    saveScore();
    gameOverModal.style.display = 'block';
    document.getElementById('finalScore').textContent = score;
    
    disableUserInput(); // Asegura bloquear los clicks
    panels.forEach(panel => panel.style.pointerEvents = 'none');
}

// Event Listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', () => {
    gameContainer.style.display = 'none';
    controls.style.display = 'none'; // Ocultar controles
    gameOverModal.style.display = 'none';
    menu.style.display = 'block';
    
    // Reiniciar variables del juego
    sequence = [];
    userSequence = [];
    score = 0;
    gameStarted = false;
    scoreDisplay.textContent = '0';
    
    disableUserInput();
    updateLeaderboard();
});
   

panels.forEach(panel => {
    panel.addEventListener('click', handleClick);
});

// Inicialización
updateLeaderboard();
const scores = JSON.parse(localStorage.getItem('simonScores')) || [];
const best = Math.max(...scores.map(e => e.score), 0);
bestScoreDisplay.textContent = best;