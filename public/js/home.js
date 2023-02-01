// home.js gère les sliders categorie

// part4 31mn 01 : setupSlidingEffect, on met tout le code de la gestion du slide dedans.
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
const createProductSlider = (data, parent, title) => {
  let slideContainer = document.querySelector(`${parent}`);
  slideContainer.innerHTML += `
    <section class="product">
      <h2 class="product-category">${title}</h2>
      <button class="pre-btn"><img src="../img/arrow.png" alt="" /></button>
      <button class="nxt-btn"><img src="../img/arrow.png" alt="" /></button>
      -- here goes the card --
    <!-- paert4 31mn30 : -->
      ${createProductCards(data)}
    </section>
    `;

  setupSlidingEffect();
};
const createProductCards = (data, parent) => {
  // here parent is for search product
  let start = '<div class="product-container">';
  let middle = ""; // this will contain card HTML
  let end = "</div>";

  for (let i = 0; i < data.length; i++) {
    middle += `
    <div class="product-card">
        <div class="product-image">
          <span class="discount-tag">${data[i].discount}% off</span>
          <img src="${data[i].images[0]}" class="product-thumb" alt="" />
        </div>
        <div class="product-info">
          <h2 class="product-brand">${data[i].name}</h2>
          <p class="product-short-des">${data[i].shortDes}</p>
          <span class="price">$${data[i].sellPrice}</span> <span class="actual-price">$${data[i].actualPrice}</span>
        </div>
    </div>
    `;
  }

  return start + middle + end;
};
