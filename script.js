const DIFFICULTIES = {
  easy: { goal: 10, time: 45 },
  normal: { goal: 20, time: 30 },
  hard: { goal: 20, time: 20 }
};

let currentCans = 0;
let goalCans = DIFFICULTIES.normal.goal;
let timeLeft = DIFFICULTIES.normal.time;
let gameActive = false;
let spawnInterval = null;
let timerInterval = null;

const grid = document.querySelector(".game-grid");
const cansDisplay = document.getElementById("current-cans");
const goalDisplay = document.getElementById("goal-display");
const timerDisplay = document.getElementById("timer");
const bestScoreDisplay = document.getElementById("best-score");
const achievements = document.getElementById("achievements");
const startButton = document.getElementById("start-game");
const difficultySelect = document.getElementById("difficulty");

// Load the best score saved in this browser.
let bestScore = Number(localStorage.getItem("waterQuestBest")) || 0;
bestScoreDisplay.textContent = bestScore;

// Create the 3-by-3 collection grid.
function createGrid() {
  grid.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    grid.appendChild(cell);
  }
}

// Update the goal and timer shown before a round starts.
function updateDifficultyDisplay() {
  const settings = DIFFICULTIES[difficultySelect.value];

  goalCans = settings.goal;
  goalDisplay.textContent = goalCans;
  timeLeft = settings.time;
  timerDisplay.textContent = timeLeft;
}

// Place one water can in a random cell.
function spawnWaterCan() {
  if (!gameActive) return;

  const cells = grid.querySelectorAll(".grid-cell");

  // Remove the previous can before spawning another one.
  cells.forEach(cell => {
    cell.innerHTML = "";
  });

  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  const can = document.createElement("div");
  can.className = "water-can-wrapper";
  can.setAttribute("role", "button");
  can.setAttribute("tabindex", "0");
  can.setAttribute("aria-label", "Collect water can");

  const canImage = document.createElement("div");
  canImage.className = "water-can";
  canImage.setAttribute("aria-hidden", "true");

  can.appendChild(canImage);
  randomCell.appendChild(can);
}

// Start a new round.
function startGame() {
  if (gameActive) return;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  const settings = DIFFICULTIES[difficultySelect.value];

  goalCans = settings.goal;
  timeLeft = settings.time;
  currentCans = 0;
  gameActive = true;

  cansDisplay.textContent = currentCans;
  goalDisplay.textContent = goalCans;
  timerDisplay.textContent = timeLeft;

  achievements.textContent =
    `Go! Collect ${goalCans} water cans before time runs out!`;

  startButton.textContent = "Game in Progress";
  startButton.disabled = true;
  difficultySelect.disabled = true;

  createGrid();
  spawnWaterCan();

  spawnInterval = setInterval(spawnWaterCan, 1000);

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

// Collect a water can and update the score.
function collectWaterCan(can) {
  if (!gameActive || !can || !grid.contains(can)) return;

  // Remove the can immediately so it cannot be collected twice.
  can.remove();

  currentCans++;
  cansDisplay.textContent = currentCans;

  // Save a new personal best.
  if (currentCans > bestScore) {
    bestScore = currentCans;
    bestScoreDisplay.textContent = bestScore;
    localStorage.setItem("waterQuestBest", bestScore);
  }

  if (currentCans >= goalCans) {
    endGame(true);
    return;
  }

  if (currentCans >= 10) {
    achievements.textContent =
      `Amazing! ${currentCans} cans collected. Keep going!`;
  } else if (currentCans >= 5) {
    achievements.textContent =
      `Great start! ${currentCans} cans collected!`;
  } else {
    achievements.textContent =
      `Nice work! ${currentCans} cans collected!`;
  }
}

// Handle mouse and touch clicks using event delegation.
grid.addEventListener("click", event => {
  const can = event.target.closest(".water-can-wrapper");

  if (can) {
    collectWaterCan(can);
  }
});

// Allow players to collect cans with Enter or Space.
grid.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;

  const can = event.target.closest(".water-can-wrapper");

  if (can) {
    event.preventDefault();
    collectWaterCan(can);
  }
});

// End a round and clean up its remaining elements.
function endGame(won) {
  if (!gameActive) return;

  gameActive = false;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  spawnInterval = null;
  timerInterval = null;

  grid.querySelectorAll(".water-can-wrapper").forEach(can => {
    can.remove();
  });

  if (won) {
    achievements.textContent =
      `You did it! All ${goalCans} water cans collected!`;
  } else {
    achievements.textContent =
      `Time is up! You collected ${currentCans} of ${goalCans} cans. Try again!`;
  }

  startButton.textContent = "Play Again";
  startButton.disabled = false;
  difficultySelect.disabled = false;
}

// Update the preview when the player changes difficulty.
difficultySelect.addEventListener("change", () => {
  if (gameActive) return;

  updateDifficultyDisplay();
  achievements.textContent =
    `Ready to play? Collect ${goalCans} cans in ${timeLeft} seconds!`;
});

// Connect the start button.
startButton.addEventListener("click", startGame);

// Set up the initial page.
createGrid();
updateDifficultyDisplay();