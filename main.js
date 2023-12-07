const canvas = document.getElementById("canvas");
const score = document.getElementById("score");
const highScores = document.getElementById("hi-scores");

const renderScoreList = () => {
  let scoresArray = [];
  for (var i = 0; i < localStorage.length; i++) {
    const value = localStorage.getItem(localStorage.key(i));
    const key = localStorage.key(i);
    if (isNaN(value)) {
      continue;
    } else {
      scoresArray.push({ key: key, value: value });
    }
  }
  scoresArray.sort((a, b) => b.value - a.value);

  for (let i = 0; i < scoresArray.length; i++) {
    let currentScore = document.createElement("h1");
    currentScore.innerText = scoresArray[i].key + ": " + scoresArray[i].value;
    highScores.appendChild(currentScore);
  }
};

highScores.addEventListener("load", renderScoreList());

const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 700;

let bgImg = new Image();
bgImg.src = "./images/background.png";

let player = {
  width: 50,
  height: 40,
  x: 100,
  y: canvas.height / 2,
  jump: false,
  movement: 0,
};

let playing = false;
let obstacles = [];
let points = 0;
let lastTime = Date.now();

let spawnTimer = 200;

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

  score.innerText = points;

  if (spawnTimer <= 0) {
    generateObstacles();
    spawnTimer = 200;
  } else {
    spawnTimer--; //use deltatime here
  }

  if (player.jump) {
    player.movement = 0;
    player.movement -= 2;
  } else {
    player.movement += 0.1;
  }
  player.y += player.movement;

  for (let obstacle of obstacles) {
    if (
      registerCollision(player, obstacle) ||
      player.y - player.height > canvas.height ||
      player.y + player.height < 0
    ) {
      endGame();
    }
  }

  if (playing) {
    requestAnimationFrame(tick);
  }
};

restartGame();

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
  localStorage.setItem(playerName, points);
  highScores.innerHTML = "";
  renderScoreList();
};

function restartGame() {
  const allScores = { ...localStorage };
  console.log(allScores);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  obstacles = [];
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

const generateObstacles = () => {
  let yPos = Math.floor(Math.random() * canvas.height);
  let xPos = canvas.width;
  yPos < 275 ? (yPos = 275) : (yPos = yPos);
  yPos > canvas.height - 200 ? (yPos = canvas.height - 200) : (yPos = yPos);
  obstacles.push(
    { x: xPos, y: 0, width: 70, height: yPos - 120 },
    { x: xPos, y: yPos, width: 70, height: canvas.height - yPos }
  );
};

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

window.addEventListener("keydown", function (event) {
  if (event.key === " ") {
    if (playing) {
      player.jump = true;
    } else {
      restartGame();
    }
  }
});

window.addEventListener("keyup", function (event) {
  if (event.key === " ") {
    player.jump = false;
  }
});
