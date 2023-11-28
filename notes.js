let canvas = document.getElementById("canvas");
let score = document.getElementById("score");
let levelText = document.getElementById("level");

let ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

let bgImg = new Image();
bgImg.src = "space-background.jpg";

let player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 75,
  height: 75,
  left: false,
  right: false,
  up: false,
  down: false,
};

let enemy = [];
let enemyBullets = [];
let bullets = [];
let points = 0;
let level = 1;

let lastTime = Date.now();
let spawnTimer = 2;
let enemyFireTimer = 2;
let bulletFired = false;

const tick = () => {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  let now = Date.now();
  let deltaTime = (now - lastTime) / 1000;
  lastTime = now;

  drawPlayer();
  spawnTimer -= deltaTime;
  enemyFireTimer -= deltaTime;
  if (enemyFireTimer <= 0) {
    enemyFireBullet(enemy);
    enemyFireTimer = 2;
  }
  if (spawnTimer <= 0) {
    if (level > 2) {
      generateEnemy();
    }
    generateEnemy();
    spawnTimer = 2;
  }
  drawEnemy();
  drawBullets();
  drawEnemyBullets();

  if (player.left && player.x >= 0) {
    player.x -= 300 * deltaTime;
  } else if (player.right && player.x + player.width < canvas.width) {
    player.x += 300 * deltaTime;
  }
  if (player.up && player.y > 0) {
    player.y -= 300 * deltaTime;
  } else if (player.down && player.y + player.height < canvas.height) {
    player.y += 300 * deltaTime;
  }

  for (let i = 0; i < enemy.length; i++) {
    if (enemy[i].direction === "left") {
      enemy[i].x += enemy[i].speed;
    } else {
      enemy[i].x -= enemy[i].speed;
    }
  }

  for (let i = 0; i < bullets.length; i++) {
    bullets[i].y -= bullets[i].bulletSpeed;
  }

  for (let i = 0; i < enemyBullets.length; i++) {
    let currentBullet = enemyBullets[i];

    currentBullet.y += currentBullet.speed;

    if (currentBullet.y >= canvas.height) {
      enemyBullets.splice(i, 1);
      i--;
    }

    if (registerCollission(currentBullet, player)) {
      points--;
      enemyBullets.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < bullets.length; i++) {
    if (bulletOutsideBoundaries(bullets[i])) {
      bullets.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < enemy.length; i++) {
    let currentEnemy = enemy[i];
    if (enemyOutsideBoundaries(currentEnemy)) {
      enemy.splice(i, 1);
      i--;
      continue;
    }
    for (let x = 0; x < bullets.length; x++) {
      let bullet = bullets[x];
      if (registerCollission(bullet, currentEnemy)) {
        points++;
        enemy.splice(i, 1);
        i--;
        continue;
      }
    }
  }

  if (points >= 10 && points < 20) {
    level = 2;
  } else if (points >= 20) {
    level = 3;
  }

  score.innerHTML = `<h1>Points: ${points}</h1>`;
  levelText.innerHTML = `<h1>Level: ${level}</h1>`;

  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);

const drawPlayer = () => {
  let playerImg = new Image();
  playerImg.src = "player.png";
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
};

const drawEnemy = () => {
  for (let i = 0; i < enemy.length; i++) {
    let currentEnemy = enemy[i];
    let enemyImg = new Image();
    enemyImg.src = "enemy.png";
    ctx.drawImage(
      enemyImg,
      currentEnemy.x,
      currentEnemy.y,
      currentEnemy.width,
      currentEnemy.height
    );
  }
};

const drawBullets = () => {
  for (let i = 0; i < bullets.length; i++) {
    ctx.fillStyle = "white";
    ctx.fillRect(
      bullets[i].x,
      bullets[i].y,
      bullets[i].width,
      bullets[i].height
    );
  }
};

const generateEnemy = () => {
  let speedNumber = Math.random() * 6;
  if (level >= 2) {
    speedNumber *= 2;
  }
  let yPos = Math.random() * canvas.height;
  yPos >= canvas.height - 100 ? (yPos -= 100) : (yPos = yPos);
  let xPos = 0;
  let rightOrLeft;
  if (Math.random() < 0.5) {
    xPos = 0;
    rightOrLeft = "left";
  } else {
    xPos = canvas.width - 30;
    rightOrLeft = "right";
  }

  let enemyObject = {
    x: xPos,
    y: yPos,
    width: 45,
    height: 45,
    speed: speedNumber,
    direction: rightOrLeft,
  };

  enemy.push(enemyObject);
};

const fireBullet = () => {
  const bullet = {
    x: player.x + player.width / 2,
    y: player.y,
    width: 5,
    height: 15,
    bulletSpeed: 7,
  };
  bullets.push(bullet);
};

const enemyFireBullet = (enemies) => {
  for (let i = 0; i < enemies.length; i++) {
    let currentEnemy = enemies[i];

    const currentEnemyBullet = {
      x: currentEnemy.x + currentEnemy.width / 2,
      y: currentEnemy.y + currentEnemy.height,
      width: 5,
      height: 5,
      speed: 2,
    };
    enemyBullets.push(currentEnemyBullet);
  }
};

const drawEnemyBullets = () => {
  for (let i = 0; i < enemyBullets.length; i++) {
    ctx.fillStyle = "white";
    ctx.fillRect(
      enemyBullets[i].x,
      enemyBullets[i].y,
      enemyBullets[i].width,
      enemyBullets[i].height
    );
  }
};

const registerCollission = (rect1, rect2) => {
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

const enemyOutsideBoundaries = (rect) => {
  if (rect.x + rect.width <= 0) {
    return true;
  } else if (rect.x >= canvas.width) {
    return true;
  } else {
    return false;
  }
};

const bulletOutsideBoundaries = (rect) => {
  if (rect.y + rect.height <= 0) {
    return true;
  } else {
    return false;
  }
};

//movement with arrow keys & shooting with space
window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    player.left = true;
  } else if (event.key === "ArrowRight") {
    player.right = true;
  }
  if (event.key === " ") {
    if (bulletFired === false) {
      fireBullet();
      bulletFired = true;
      setTimeout(() => {
        bulletFired = false;
      }, 100);
    } else {
      return;
    }
  }
});

window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") {
    player.up = true;
  } else if (event.key === "ArrowDown") {
    player.down = true;
  }
});

window.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft") {
    player.left = false;
  } else if (event.key === "ArrowRight") {
    player.right = false;
  }
});

window.addEventListener("keyup", function (event) {
  if (event.key === "ArrowUp") {
    player.up = false;
  } else if (event.key === "ArrowDown") {
    player.down = false;
  }
});
