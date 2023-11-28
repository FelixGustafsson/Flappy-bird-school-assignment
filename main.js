const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 700;

let bgImg = new Image();
bgImg.src = "./images/background.png";
ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

let player = {
  width: 50,
  height: 40,
  x: 100,
  y: canvas.height / 2,
  jump: false,
  movement: 0,
};

let obstacles = [{ y: 350, x: canvas.width }];

let lastTime = Date.now();

let spawnTimer = 200;

const tick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let now = Date.now();
  let deltaTime = (now - lastTime) / 1000;
  lastTime = now;

  drawPlayer(player);
  drawObstacles(obstacles);
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].x -= 1;
  }

  if (spawnTimer <= 0) {
    generateObstacles();
    spawnTimer = 200;
  } else {
    spawnTimer--;
  }

  if (player.jump) {
    player.movement = 0;
    player.movement -= 2;
  } else {
    player.movement += 0.1;
  }
  player.y += player.movement;

  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);

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
    ctx.fillRect(currentObstacle.x, 0, 70, currentObstacle.y - 50);
    ctx.fillRect(currentObstacle.x, currentObstacle.y + 50, 70, canvas.height);
  }
};

const generateObstacles = () => {
  let yPos = Math.random() * canvas.height;
  let xPos = canvas.width;
  yPos < 200 ? (yPos = 200) : (yPos = yPos);
  yPos > canvas.height - 200 ? (yPos = canvas.height - 200) : (yPos = yPos);
  obstacles.push({ y: yPos, x: xPos });
};

window.addEventListener("keydown", function (event) {
  if (event.key === " ") {
    player.jump = true;
  }
});

window.addEventListener("keyup", function (event) {
  if (event.key === " ") {
    player.jump = false;
  }
});
