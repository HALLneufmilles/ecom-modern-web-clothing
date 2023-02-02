// home.js gère les sliders categorie

// part4 31mn 01 : On crée setupSlidingEffect() , on met tout le code qui servait à la gestion du slide dedans.
const setupSlidingEffect = () => {
  const productContainers = [...document.querySelectorAll(".product-container")];
  const nxtBtn = [...document.querySelectorAll(".nxt-btn")];
  const preBtn = [...document.querySelectorAll(".pre-btn")];

  productContainers.forEach((item, i) => {
    let containerDimenstions = item.getBoundingClientRect();
    let containerWidth = containerDimenstions.width;

    nxtBtn[i].addEventListener("click", () => {
      item.scrollLeft += containerWidth;
    });

    preBtn[i].addEventListener("click", () => {
      item.scrollLeft -= containerWidth;
    });
  });
};

// part4 23mn15 :
// fetch product cards
//productId = null;
const getProducts = (tag) => {
  return fetch("/get-products", {
    method: "post",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ tag: tag }),
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
};

// part4 28mn40 : create product slider
// Utilisée par fetchProductData() de product.js
// 'parent' désignera par sa classe, la div parent de product.html qui englobera le slider. 'title' sera le titre qu'on donnera au slider.
// Le html provient du slider de la page 'product.html' ligne 63, que nous avons commenté pour le créer dynamiquement ici. Le html correspond au titre du slider et les bouton de défilement.
const createProductSlider = (data, parent, title) => {
  let slideContainer = document.querySelector(`${parent}`);
  slideContainer.innerHTML += `
    <section class="product">
      <h2 class="product-category">${title}</h2>
      <button class="pre-btn"><img src="../img/arrow.png" alt="" /></button>
      <button class="nxt-btn"><img src="../img/arrow.png" alt="" /></button>
    <!-- paert4 31mn30 : Création des cartes dans le slider -->
      ${createProductCards(data)} 
    </section>
    `;

  setupSlidingEffect(); // contient la logique de défilement du slider.
};

// part4 31mn52 : création des catres dans le slider. le html provient de product.html .
const createProductCards = (data, parent) => {
  // here parent is for search product
  let start = '<div class="product-container">'; // ligne 68 de product.html
  let middle = ""; // this will contain card HTML
  let end = "</div>";

  for (let i = 0; i < data.length; i++) {
    // part4 37mn18: Condition ajouté pour exclure le produit affiché du slider de recommendation.
    // part4 38mn06 : On ajoute un onclick à la partie 'product-info' qui redirige vers vers le produit.
    if (data[i].id != decodeURI(location.pathname.split("/").pop())) {
      middle += `
    <div class="product-card">
        <div class="product-image">
          <span class="discount-tag">${data[i].discount}% off</span>
          <img src="${data[i].images[0]}" class="product-thumb" alt="" />
          <!-- On à supprimer le bouton 'add to wish list présent sur les sliders de la page index.html -->
        </div>
        <div class="product-info" onclick="location.href = '/products/${data[i].id}'">
          <h2 class="product-brand">${data[i].name}</h2>
          <p class="product-short-des">${data[i].shortDes}</p>
          <span class="price">$${data[i].sellPrice}</span> <span class="actual-price">$${data[i].actualPrice}</span>
        </div>
    </div>
    `;
    }
  }

  return start + middle + end;
};
