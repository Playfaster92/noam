// TEST DE QI
function startTest() {
  const result = document.getElementById("test-result");
  const score = Math.floor(Math.random() * 160) + 40;
  result.innerHTML = `<h3>Résultat : ${score} de QI</h3>`;
}

/* === LABYRINTHE === */
const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

// Charger la photo de Noam
const playerImg = new Image();
playerImg.src = "laby.png";  // image à placer dans le même dossier

let player = { x: 40, y: 40, size: 40, speed: 5 }; // taille agrandie

// Mur du labyrinthe (exemple simple, tu peux le complexifier)
const walls = [
  {x: 100, y: 0, w: 20, h: 300},
  {x: 200, y: 100, w: 20, h: 300},
  {x: 300, y: 0, w: 20, h: 300},
  {x: 400, y: 100, w: 20, h: 300}
];

// Zone de sortie
const exit = { x: 550, y: 350, w: 40, h: 40 };

// Déplacements
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function movePlayer() {
  let newX = player.x;
  let newY = player.y;

  if (keys["ArrowUp"]) newY -= player.speed;
  if (keys["ArrowDown"]) newY += player.speed;
  if (keys["ArrowLeft"]) newX -= player.speed;
  if (keys["ArrowRight"]) newX += player.speed;

  // Vérifier collisions avec les murs
  let collision = walls.some(w => 
    newX < w.x + w.w &&
    newX + player.size > w.x &&
    newY < w.y + w.h &&
    newY + player.size > w.y
  );

  if (!collision) {
    player.x = newX;
    player.y = newY;
  }

  // Vérifier si le joueur est dans la sortie
  if (
    player.x < exit.x + exit.w &&
    player.x + player.size > exit.x &&
    player.y < exit.y + exit.h &&
    player.y + player.size > exit.y
  ) {
    document.getElementById("mazeMessage").textContent = "🎉 Félicitations, tu as libéré Noam de l’ENIMMM !";
  }
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner les murs
  ctx.fillStyle = "#444";
  walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));

  // Dessiner la sortie
  ctx.fillStyle = "gold";
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);

  // Dessiner le joueur (Noam)
  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
}

function gameLoop() {
  movePlayer();
  drawMaze();
  requestAnimationFrame(gameLoop);
}

playerImg.onload = () => {
  gameLoop();
};


// === QUIZ ENIM ===
function submitQuiz() {
  let score = 0;
  const form = document.getElementById("quiz-form");

  // réponses correctes
  if (form.q1.value === "4") score++;
  if (form.q2.value === "Paris") score++;
  if (form.q3.value === "ENIM") score++;

  let resultText = "";
  switch (score) {
    case 0:
      resultText = "Noam /10";
      break;
    case 1:
      resultText = "Soldat /10";
      break;
    case 2:
      resultText = "Première classe /10";
      break;
    case 3:
      resultText = "ENIM /10<br><strong>Bravo! vous êtes admissibles à l'ENIMMMM.</strong>";
      break;
  }

  document.getElementById("test-result").innerHTML = `<h3>${resultText}</h3>`;
}
