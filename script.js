const scanBtn = document.getElementById("scan-btn");
const improveBtn = document.getElementById("improve-btn");
const scoreEl = document.getElementById("seo-score");
const statusEl = document.getElementById("seo-status");
const listEl = document.getElementById("seo-list");
const productEl = document.getElementById("product-name");

scanBtn.addEventListener("click", () => {
  productEl.textContent = "Lemon Haze";
  scoreEl.textContent = "64";
  statusEl.textContent = "SEO moyen";
  listEl.innerHTML = `
    <li>Meta title trop courte</li>
    <li>Description produit correcte</li>
    <li>3 images sans texte ALT</li>
  `;
});

improveBtn.addEventListener("click", () => {
  scoreEl.textContent = "89";
  statusEl.textContent = "SEO optimisé";
  listEl.innerHTML = `
    <li>Meta title optimisée</li>
    <li>Meta description améliorée</li>
    <li>Toutes les images ont un texte ALT</li>
  `;
});
