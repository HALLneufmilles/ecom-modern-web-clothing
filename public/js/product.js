const productImages = document.querySelectorAll(".product-images img");
const productImageSlide = document.querySelector(".image-slider");

let activeImageSlide = 0;

productImages.forEach((item, i) => {
  item.addEventListener("click", () => {
    productImages[activeImageSlide].classList.remove("active");
    item.classList.add("active");
    productImageSlide.style.backgroundImage = `url('${item.src}')`;
    activeImageSlide = i;
  });
});

// toggle size buttons

const sizeBtns = document.querySelectorAll(".size-radio-btn");
let checkedBtn = 0;

sizeBtns.forEach((item, i) => {
  item.addEventListener("click", () => {
    sizeBtns[checkedBtn].classList.remove("check");
    item.classList.add("check");
    checkedBtn = i;
  });
});

// CCCCC mettre les données de l'id dans les champs
const setData = (data) => {
  let title = document.querySelector("title"); // nom de l'onglet
  title.innerHTML += data.name;

  // mettre les images en place
  productImages.forEach((img, i) => {
    if (data.images[i]) {
      img.src = data.images[i];
    } else {
      img.style.display = "none";
    }
  });

  productImages[0].click(); // Ajoute la class='active' à la 1ère image

  // sélectionner les boutons taille
  sizeBtns.forEach((item) => {
    if (!data.sizes.includes(item.innerHTML)) {
      item.style.display = "none";
    }
  });

  // Mettre les texts
  let name = document.querySelector(".product-brand");
  let shortDes = document.querySelector(".product-short-des");
  let des = document.querySelector(".des");

  title.innerHTML += name.innerHTML = data.name; // j'attribue data.name à name.innerHTML(name.innerHTML = data.name) que je concatène avec title.innerHTML (title.innerHTML = title.innerHTML + name.innerHTML) . voir : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Addition_assignment
  shortDes.innerHTML = data.shortDes;
  des.innerHTML = data.des;

  // Mettre les prix
  let sellPrice = document.querySelector(".product-price"); // prix de départ
  let actualPrice = document.querySelector(".product-actual-price"); // prix de vente
  let discount = document.querySelector(".product-discount"); // % de rabais

  sellPrice.innerHTML = `${data.sellPrice} E`;
  actualPrice.innerHTML = `${data.actualPrice} E`;
  discount.innerHTML = `${data.discount}%`;
};

// BBBB récupération des données de l'id
const fetchProductData = () => {
  fetch("/get-products", {
    method: "post",
    headers: new Headers({ "Content-type": "application/json" }),
    body: JSON.stringify({ id: productId }),
  })
    .then((res) => res.json())
    .then((data) => {
      setData(data);
      //console.log(data);
      getProducts(data.tag[1]).then((data) => createProductSlider(data, ".container-for-card-slider", "similar products"));
    })
    .catch((err) => {
      location.replace("/404");
    });
};

// AAAA récupérer l'id si le navigateur voit un id dans l'adresse
let productId = null;

if (location.pathname != "/products") {
  productId = decodeURI(location.pathname.split("/").pop());
  console.log(productId);

  // lancer la récupération des données de l'id
  fetchProductData();
}
