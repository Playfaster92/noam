// =========================
// TEST DE QI (random, pas utilisé pour le quiz ENIM)
// =========================
function startTest() {
  const result = document.getElementById("test-result");
  const score = Math.floor(Math.random() * 160) + 40;
  if (result) result.innerHTML = `<h3>Résultat : ${score} de QI</h3>`;
}

// =========================
// LABYRINTHE — s’active uniquement si <canvas id="mazeCanvas"> existe
// =========================
(function initMaze() {
  const canvas = document.getElementById("mazeCanvas");
  if (!canvas) return; // pas sur cette page, on sort proprement

  const ctx = canvas.getContext("2d");

  // Charger la photo de Noam
  const playerImg = new Image();
  playerImg.src = "laby.png";  // image à placer dans le même dossier

  let player = { x: 40, y: 40, size: 40, speed: 5 }; // taille agrandie

  // Mur du labyrinthe (exemple simple)
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
  document.addEventListener("keydown", e => (keys[e.key] = true));
  document.addEventListener("keyup", e => (keys[e.key] = false));

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
    const msgEl = document.getElementById("mazeMessage");
    if (
      player.x < exit.x + exit.w &&
      player.x + player.size > exit.x &&
      player.y < exit.y + exit.h &&
      player.y + player.size > exit.y
    ) {
      if (msgEl) msgEl.textContent = "🎉 Félicitations, tu as libéré Noam de l’ENIMMM !";
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

  playerImg.onload = () => gameLoop();
})();

// =========================
// QUIZ ENIM — version avec MODALE centrée
// =========================
function submitQuiz() {
  let score = 0;
  const form = document.getElementById("quiz-form");
  if (!form) return;

  // réponses correctes
  if (form.q1?.value === "4") score++;
  if (form.q2?.value === "Paris") score++;
  if (form.q3?.value === "ENIM") score++;

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
      resultText = "ENIM /10<br><strong>Bravo ! vous êtes admissibles à l'ENIMMMM.</strong>";
      break;
  }

  // Affiche dans la modale centrée si présente
  const modal = document.getElementById("resultModal");
  const resultBox = document.getElementById("resultText");
  if (modal && resultBox) {
    resultBox.innerHTML = resultText;
    modal.classList.remove("hidden");

    const closeBtn = document.querySelector(".modal-close");
    const closeModal = () => modal.classList.add("hidden");

    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    document.onkeydown = (e) => { if (e.key === "Escape") closeModal(); };
  } else {
    // fallback : ancien affichage si pas de modale
    const result = document.getElementById("test-result");
    if (result) result.innerHTML = `<h3>${resultText}</h3>`;
  }
}

// =========================
// LIGHTBOX (zoom images) — actif uniquement si #lightbox existe
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector("img");

  // Quand on clique sur une image de la galerie
  document.body.addEventListener("click", e => {
    if (e.target.tagName === "IMG" && e.target.classList.contains("media")) {
      lightbox.style.display = "flex";
      lightboxImg.src = e.target.src;
    }
  });

  // Click en dehors ou Échap pour fermer
  lightbox.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") lightbox.style.display = "none";
  });
});
