const gameArea = document.getElementById("gameArea");
const playerCar = document.getElementById("playerCar");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreEl = document.getElementById("finalScore");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const lanes = [90, 180, 270];
let playerLane = 1;
let score = 0;
let bestScore = Number(localStorage.getItem("carDodgeBest")) || 0;
let enemies = [];
let gameLoopId = null;
let gameStarted = false;

function updatePlayerPosition() {
  playerCar.style.left = lanes[playerLane] + "px";
}

function updateScore() {
  scoreEl.textContent = score;
  bestScoreEl.textContent = bestScore;
}

function resetGame() {
  enemies.forEach(enemy => enemy.element.remove());
  enemies = [];
  score = 0;
  playerLane = 1;
  updatePlayerPosition();
  updateScore();
  gameOverScreen.classList.add("hidden");
  startScreen.classList.add("hidden");
}

function createEnemy() {
  const lane = Math.floor(Math.random() * lanes.length);
  const enemy = document.createElement("div");
  enemy.classList.add("car", "enemy");

  enemy.innerHTML = `
    <div class="top"></div>
    <div class="window"></div>
    <div class="light left"></div>
    <div class="light right"></div>
  `;

  enemy.style.left = lanes[lane] + "px";
  enemy.style.top = "-140px";
  gameArea.appendChild(enemy);

  enemies.push({
    lane,
    y: -140,
    speed: 5 + score * 0.08,
    element: enemy
  });
}

function checkCollision(player, enemy) {
  const p = {
    left: player.offsetLeft,
    right: player.offsetLeft + player.offsetWidth,
    top: player.offsetTop,
    bottom: player.offsetTop + player.offsetHeight
  };

  const e = {
    left: enemy.element.offsetLeft,
    right: enemy.element.offsetLeft + enemy.element.offsetWidth,
    top: enemy.element.offsetTop,
    bottom: enemy.element.offsetTop + enemy.element.offsetHeight
  };

  return !(
    p.right < e.left + 8 ||
    p.left + 8 > e.right ||
    p.bottom < e.top + 10 ||
    p.top + 10 > e.bottom
  );
}

function endGame() {
  gameStarted = false;
  cancelAnimationFrame(gameLoopId);

  bestScore = Math.max(bestScore, score);
  localStorage.setItem("carDodgeBest", bestScore);

  finalScoreEl.textContent = score;
  bestScoreEl.textContent = bestScore;

  gameOverScreen.classList.remove("hidden");
}

function gameLoop() {
  if (!gameStarted) return;

  // Add enemy every 1 second
  if (Math.random() < 0.03) {
    createEnemy();
  }

  score += 1;
  scoreEl.textContent = score;

  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    enemy.element.style.top = enemy.y + "px";

    if (checkCollision(playerCar, enemy)) {
      endGame();
      return;
    }

    if (enemy.y > gameArea.offsetHeight + 120) {
      enemy.element.remove();
      enemies.splice(index, 1);
    }
  });

  gameLoopId = requestAnimationFrame(gameLoop);
}

function startGame() {
  resetGame();
  gameStarted = true;
  gameLoopId = requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") {
    playerLane = Math.max(0, playerLane - 1);
  }

  if (key === "arrowright" || key === "d") {
    playerLane = Math.min(2, playerLane + 1);
  }

  updatePlayerPosition();
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

updatePlayerPosition();
updateScore();
