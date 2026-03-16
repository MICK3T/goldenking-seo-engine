const SHOPIFY_DOMAIN = "TON-SHOP.myshopify.com";
const STOREFRONT_TOKEN = "TON_STOREFRONT_TOKEN";

const STOREFRONT_API_URL = `https://${SHOPIFY_DOMAIN}/api/2026-01/graphql.json`;

const loadProductsBtn = document.getElementById("load-products-btn");
const productsGrid = document.getElementById("products-grid");
const productsStatus = document.getElementById("products-status");

function stripHtml(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

function truncate(text = "", max = 180) {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "...";
}

function escapeHtml(text = "") {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function computeSeoScore(product) {
  let score = 0;

  const title = product.title || "";
  const description = stripHtml(product.description || "");
  const altText = product.featuredImage?.altText || "";

  if (title.length >= 20 && title.length <= 70) score += 30;
  if (description.length >= 80) score += 40;
  if (altText.trim().length > 0) score += 30;

  return score;
}

async function fetchProducts() {
  const query = `
    query GetProducts($first: Int!) {
      products(first: $first) {
        nodes {
          id
          title
          handle
          description
          featuredImage {
            url
            altText
          }
        }
      }
    }
  `;

  const response = await fetch(STOREFRONT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query,
      variables: { first: 50 }
    })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(JSON.stringify(result.errors, null, 2));
  }

  return result.data.products.nodes;
}

function renderProducts(products) {
  if (!products || products.length === 0) {
    productsStatus.textContent = "Aucun produit trouvé.";
    productsGrid.innerHTML = "";
    return;
  }

  productsStatus.textContent = `${products.length} produit(s) chargé(s).`;

  productsGrid.innerHTML = products.map((product) => {
    const cleanDescription = stripHtml(product.description || "");
    const shortDescription = truncate(cleanDescription, 220);
    const seoScore = computeSeoScore(product);

    return `
      <article class="product-card">
        ${
          product.featuredImage?.url
            ? `<img class="product-image" src="${product.featuredImage.url}" alt="${escapeHtml(product.featuredImage.altText || product.title)}">`
            : ""
        }

        <div class="product-content">
          <h2>${escapeHtml(product.title)}</h2>
          <p class="product-handle">/${escapeHtml(product.handle)}</p>

          <div class="seo-badge">SEO ${seoScore}/100</div>

          <p class="product-description">${escapeHtml(shortDescription || "Aucune description.")}</p>

          <ul class="product-meta">
            <li><strong>Description :</strong> ${cleanDescription.length} caractères</li>
            <li><strong>Image ALT :</strong> ${product.featuredImage?.altText ? "Oui" : "Non"}</li>
          </ul>

          <a class="product-link" href="https://${SHOPIFY_DOMAIN}/products/${encodeURIComponent(product.handle)}" target="_blank" rel="noopener noreferrer">
            Voir le produit
          </a>
        </div>
      </article>
    `;
  }).join("");
}

async function loadProducts() {
  if (!productsGrid || !productsStatus) return;

  productsStatus.textContent = "Chargement des produits...";
  productsGrid.innerHTML = "";

  try {
    const products = await fetchProducts();
    renderProducts(products);
  } catch (error) {
    console.error(error);
    productsStatus.textContent = "Erreur pendant le chargement des produits.";
    productsGrid.innerHTML = `
      <div class="error-box">
        Vérifie ton domaine myshopify.com, ton Storefront token et les permissions de l'app.
      </div>
    `;
  }
}

if (loadProductsBtn) {
  loadProductsBtn.addEventListener("click", loadProducts);
}
