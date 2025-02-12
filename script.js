/**ORGANIZAR EL RESTO **/

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

const soundFiles = {
    red: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    blue: 'https://actions.google.com/sounds/v1/alarms/medium_bell_ring_near.ogg',
    yellow: 'https://actions.google.com/sounds/v1/alarms/dosimeter_alarm.ogg',
    green: 'https://actions.google.com/sounds/v1/alarms/glass_clink-tones.ogg'
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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

function startGame() {
    if (!playerNameInput.value.trim()) {
        alert('Por favor ingresa tu nombre');
        return;
    }
    
    currentPlayer = playerNameInput.value.trim();
    menu.style.display = 'none';
    gameContainer.style.display = 'block';
    resetBtn.style.display = 'block';
    initializeGame();
}

function initializeGame() {
    sequence = [];
    userSequence = [];
    score = 0;
    scoreDisplay.textContent = '0';
    gameStarted = true;
    nextRound();
}

function nextRound() {
    userSequence = [];
    sequence.push(getRandomColor());
    score++;
    scoreDisplay.textContent = score;
    playSequence();
}

function getRandomColor() {
    const colors = ['red', 'blue', 'yellow', 'green'];
    return colors[Math.floor(Math.random() * 4)];
}

function playSequence() {
    let i = 0;
    panels.forEach(panel => panel.style.pointerEvents = 'none');
    
    const interval = setInterval(() => {
        if (i < sequence.length) {
            activatePanel(sequence[i]);
            i++;
        } else {
            clearInterval(interval);
            panels.forEach(panel => panel.style.pointerEvents = 'auto');
        }
    }, 800);
}

function activatePanel(color) {
    const panel = document.querySelector(`.${color}`); // Selección por clase
    panel.classList.add('active');
    playSound(color);
    setTimeout(() => panel.classList.remove('active'), 400);
}

function handleClick(e) {
    const color = e.currentTarget.classList[1]; // Obtiene 'red', 'blue', etc.
    userSequence.push(color);
    activatePanel(color);

    if (userSequence[userSequence.length - 1] !== sequence[userSequence.length - 1]) {
        gameOver();
        return;
    }

    if (userSequence.length === sequence.length) {
        setTimeout(nextRound, 1000);
    }
}

function gameOver() {
    gameStarted = false;
    saveScore();
    gameOverModal.style.display = 'block';
    document.getElementById('finalScore').textContent = score;
}

// Event Listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', () => {
    // Ocultar elementos del juego
    gameContainer.style.display = 'none';
    gameOverModal.style.display = 'none';
    
    // Mostrar menú principal
    menu.style.display = 'block';
    
    // Reiniciar variables del juego
    sequence = [];
    userSequence = [];
    score = 0;
    gameStarted = false;
    
    // Actualizar leaderboard
    updateLeaderboard();
    
    // Restablecer la mejor puntuación
    const scores = JSON.parse(localStorage.getItem('simonScores')) || [];
    const best = Math.max(...scores.map(e => e.score), 0);
    bestScoreDisplay.textContent = best;
    
    // Detener cualquier secuencia en curso
    panels.forEach(panel => panel.style.pointerEvents = 'none');
});

panels.forEach(panel => {
    panel.addEventListener('click', handleClick);
});

// Inicialización
updateLeaderboard();
const bestScore = Math.max(...JSON.parse(localStorage.getItem('simonScores') || '[]').map(e => e.score) || [0]);
bestScoreDisplay.textContent = bestScore;