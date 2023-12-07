// DOM elements
const canvas = document.getElementById("canvas");
const score = document.getElementById("score");
const highScores = document.getElementById("hi-scores");

// defines canvas
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 600;

// global variables
let playing = false;
const obstacles = [];
let points = 0;
let lastTime = Date.now();
const spawnDelay = 4;
let spawnTimer = 0;
const bgImg = new Image();
bgImg.src = "./images/background.png";
let player = {
  width: 50,
  height: 40,
  x: 100,
  y: canvas.height / 2,
  jump: false,
  movement: 0,
};

// generates high score list from local storage
const renderScoreList = () => {
  let scores = localStorage.getItem("hi-scores");
  let scoresArray = scores ? JSON.parse(scores) : [];
  scoresArray.sort((a, b) => b.score - a.score);

  let table = document.createElement("table");
  let header = document.createElement("tr");
  header.innerHTML = "<th colspan='2'>High Scores</th>";
  let header2 = document.createElement("tr");
  header2.innerHTML = "<th>Player</th><th>Score</th>";
  table.append(header, header2);
  for (let i = 0; i < scoresArray.length; i++) {
    let playerPoints = scoresArray[i];

    let row = document.createElement("tr");
    let name = document.createElement("td");
    let points = document.createElement("td");
    points.style.textAlign = "right";

    name.innerText = playerPoints.name;
    points.innerText = playerPoints.score;

    row.append(name, points);
    table.append(row);
  }
  highScores.append(table);
};

// loads high scores when page is loaded
highScores.addEventListener("load", renderScoreList());

// tick function
const tick = () => {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  let now = Date.now();
  let deltaTime = (now - lastTime) / 1000;
  lastTime = now;

  drawPlayer(player);
  drawObstacles(obstacles);
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].x -= 1;
  }

  score.innerText = "Current player score: " + points;

  if (spawnTimer <= 0) {
    generateObstacles();
    spawnTimer = spawnDelay;
  } else {
    spawnTimer -= deltaTime;
  }

  // moves player
  if (player.jump) {
    player.movement = 0;
    player.movement -= 2;
  } else {
    player.movement += 0.1;
  }
  player.y += player.movement;

  // checks for defeat
  if (
    player.y - player.height > canvas.height ||
    player.y + player.height < 0
  ) {
    endGame();
  }
  for (let obstacle of obstacles) {
    if (registerCollision(player, obstacle)) {
      endGame();
    }
  }

  // if no defeat, calls tick function again
  if (playing) {
    requestAnimationFrame(tick);
  }
};

startGame();

// ends game, clears screen, updates high scores
const endGame = () => {
  playing = false;
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  ctx.font = "30px Arial";
  ctx.fillText(
    "Press space to play again",
    canvas.width / 2 - 160,
    canvas.height / 2 - 10
  );
  let playerName = prompt("Whats your name?");
  saveScore(playerName, points);
  highScores.innerHTML = "";
  renderScoreList();
  // score.innerText = "";
};

// Saves the latest score to local storage.
function saveScore(name, score) {
  let scoresArray = localStorage.getItem("hi-scores");
  scoresArray = scoresArray ? JSON.parse(scoresArray) : [];
  scoresArray.push({
    name,
    score,
  });
  localStorage.setItem("hi-scores", JSON.stringify(scoresArray));
}

// starts or restarts the game
function startGame() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  obstacles.length = 0;
  points = 0;
  player = {
    width: 40,
    height: 30,
    x: 100,
    y: canvas.height / 2,
    jump: false,
    movement: 0,
  };
  playing = true;
  requestAnimationFrame(tick);
}

// draws the flappy bird
const drawPlayer = (playerObj) => {
  let playerImg = new Image();
  playerImg.src = "./images/bird.png";
  ctx.drawImage(
    playerImg,
    playerObj.x,
    playerObj.y,
    playerObj.width,
    playerObj.height
  );
};

// draws the walls
const drawObstacles = (obstacles) => {
  for (let i = 0; i < obstacles.length; i++) {
    let currentObstacle = obstacles[i];
    ctx.fillRect(
      currentObstacle.x,
      currentObstacle.y,
      currentObstacle.width,
      currentObstacle.height
    );
    if (currentObstacle.x <= 0 - currentObstacle.width) {
      obstacles.splice(i, 2);
      i - 2;
      points++;
    }
  }
};

// generate walls with randomly-placed gaps in an array
const generateObstacles = () => {
  let yPos = Math.floor(Math.random() * canvas.height);
  let xPos = canvas.width;
  yPos < 200 ? (yPos = 200) : (yPos = yPos);
  yPos > canvas.height - 125 ? (yPos = canvas.height - 125) : (yPos = yPos);
  obstacles.push(
    { x: xPos, y: 0, width: 70, height: yPos - 120 },
    { x: xPos, y: yPos, width: 70, height: canvas.height - yPos }
  );
};

// checks for collisions
const registerCollision = (rect1, rect2) => {
  if (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  ) {
    return true;
  } else {
    return false;
  }
};

// enables player to control movement
window.addEventListener("keydown", function (event) {
  if (event.key === " ") {
    if (playing) {
      player.jump = true;
    } else {
      startGame();
    }
  }
});

// causes bird to fall if not rising
window.addEventListener("keyup", function (event) {
  if (event.key === " ") {
    player.jump = false;
  }
});
