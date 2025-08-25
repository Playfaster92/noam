/* =========================
   PANIER (mini-panier + localStorage)
========================= */
const CART_KEY = "noam_cart_v1";

function cartGet() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function cartSave(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  cartUpdateBadge();
}
function cartAdd({id, name, price, image}) {
  const cart = cartGet();
  const idx = cart.findIndex(p => p.id === id);
  const p = Number(String(price).replace(",", "."));
  if (idx >= 0) cart[idx].qty += 1;
  else cart.push({ id, name, price: p, image: image || "", qty: 1 });
  cartSave(cart);
}
function cartUpdateQty(id, qty) {
  const cart = cartGet();
  const i = cart.findIndex(p => p.id === id);
  if (i === -1) return;
  cart[i].qty = Math.max(1, Number(qty) || 1);
  cartSave(cart);
}
function cartRemove(id) { cartSave(cartGet().filter(p => p.id !== id)); }
function cartClear()    { cartSave([]); }
function eur(n) { return (Number(n)||0).toLocaleString("fr-FR",{style:"currency",currency:"EUR"}); }

function cartUpdateBadge() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const total = cartGet().reduce((s,p)=>s+p.qty,0);
  el.textContent = total;
}

/* ——— Listeners globaux ——— */
document.addEventListener("DOMContentLoaded", () => {
  cartUpdateBadge();

  // Event delegation pour tous les boutons Ajouter
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;

    const id    = btn.dataset.id;
    const name  = btn.dataset.name;
    const price = btn.dataset.price;   // peut être "19,99" -> on gère
    const image = btn.dataset.image || "";

    if (!id || !name || !price) return;
    cartAdd({ id, name, price, image });

    // petit feedback
    const txt = btn.textContent;
    btn.textContent = "Ajouté ✓";
    setTimeout(()=> btn.textContent = txt, 900);
  });

  // Mini-panier (si présent sur la page)
  const panel   = document.getElementById("cart-panel");
  const toggle  = document.getElementById("cart-toggle");
  const closeBt = document.getElementById("cart-close");
  const itemsEl = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const clearBt = document.getElementById("cart-clear");

  if (toggle && panel) toggle.addEventListener("click", () => {
    panel.classList.add("show");
    renderMiniCart();
  });
  if (closeBt && panel) closeBt.addEventListener("click", () => panel.classList.remove("show"));
  if (clearBt) clearBt.addEventListener("click", () => { cartClear(); renderMiniCart(); });

  function renderMiniCart() {
    if (!itemsEl || !totalEl) return;
    const cart = cartGet();
    itemsEl.innerHTML = "";
    if (cart.length === 0) {
      itemsEl.innerHTML = "<p>Ton panier est vide 🛒</p>";
      totalEl.textContent = eur(0);
      cartUpdateBadge();
      return;
    }
    let total = 0;
    cart.forEach(p => {
      const row = document.createElement("div");
      row.className = "cart-item";
      const sub = p.price * p.qty;
      total += sub;
      row.innerHTML = `
        <span>${p.name}</span>
        <input type="number" min="1" value="${p.qty}" data-id="${p.id}">
        <span>${eur(sub)}</span>
        <button class="rm" data-id="${p.id}">✖</button>
      `;
      itemsEl.appendChild(row);
    });
    totalEl.textContent = eur(total);
    cartUpdateBadge();

    itemsEl.querySelectorAll('input[type="number"]').forEach(inp=>{
      inp.onchange = () => { cartUpdateQty(inp.dataset.id, inp.value); renderMiniCart(); };
    });
    itemsEl.querySelectorAll('button.rm').forEach(b=>{
      b.onclick = () => { cartRemove(b.dataset.id); renderMiniCart(); };
    });
  }
});


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
