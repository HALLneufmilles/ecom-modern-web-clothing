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

// part4 50mn00 : let size; puis on va ligne 87, whishlistBtn.
let size;

sizeBtns.forEach((item, i) => {
  item.addEventListener("click", () => {
    sizeBtns[checkedBtn].classList.remove("check");
    item.classList.add("check");
    checkedBtn = i;
    size = item.innerHTML; // part4 50mn05 :
  });
});

// CCCCC mettre les données de l'id dans les champs
// part4 15mn12 :
const setData = (data) => {
  let title = document.querySelector("title"); // nom de l'onglet
  title.innerHTML += data.name; // cela représente une concaténation du contenu de la balise <title> + data.name que
  // l'on réinjecte dans titie.innerHTML. voir https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Addition_assignment

  // mettre les images en place
  productImages.forEach((img, i) => {
    // productImages représente les 4 elements 'img' de product.html avec src="" . Donc vides d'image.
    // 'images' est le tableau de data, contenant les 4 urls d'image placées lors de la création du produit.
    // Pour chaque élément <img> vide et d'index 'i' de 'productImages, on regarde si pour le même index
    // le tableau 'images' contient une image (une url).
    if (data.images[i]) {
      // si oui, on place l'url de l'image dans l'attribut 'src' de l'élément <img>.
      img.src = data.images[i];
    } else {
      // sinon on met un display 'none', ça fait plus propre.
      img.style.display = "none";
    }
  });

  productImages[0].click(); // Ajoute la class='active' à la 1ère image. Ajoute une opacité de 0.5 avec le selecteur css '.product-images img.active'

  // sizeBtns représente chaque élément <label> des boutons radio.
  // sizes est le tableau de data, contenant les tailles sélectionnées lors de la création du produit.
  // Pour chaque label, si le text du label ('item.innerHTML') n'est pas présent dans le tableau sizes de data,
  // Alors on lui applique un display 'none'.
  sizeBtns.forEach((item) => {
    if (!data.sizes.includes(item.innerHTML)) {
      // Par défaut tous les boutons radio son affichés. Il faut donc cibler ceux qui ne correspondent pas afin de les retirer, donc on fonctionne par la négative.
      item.style.display = "none";
    }
  });

  // Mettre les texts
  let name = document.querySelector(".product-brand");
  let shortDes = document.querySelector(".product-short-des");
  let des = document.querySelector(".des");

  title.innerHTML += name.innerHTML = data.name; // j'attribue data.name à name.innerHTML(name.innerHTML = data.name) qui correspond à l'élément <h2> de classe 'product-brand', que je concatène avec le text de title.innerHTML (title.innerHTML = title.innerHTML + name.innerHTML) . voir : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Addition_assignment
  // je me demande pourquoi renomer un seconde fois le titre ??? délà fait en ligne 31. 'name.innerHTML = data.name;' devrait suffir. ???????????????????????????????????????????
  shortDes.innerHTML = data.shortDes;
  des.innerHTML = data.des;

  // Mettre les prix
  let sellPrice = document.querySelector(".product-price"); // prix de départ
  let actualPrice = document.querySelector(".product-actual-price"); // prix de vente
  let discount = document.querySelector(".product-discount"); // % de rabais

  sellPrice.innerHTML = `${data.sellPrice} E`;
  actualPrice.innerHTML = `${data.actualPrice} E`;
  discount.innerHTML = `${data.discount}%`;

  // part4 51mn24 : wishlist and cart btn
  const wishlistBtn = document.querySelector(".wishlist-btn");
  wishlistBtn.addEventListener("click", () => {
    wishlistBtn.innerHTML = add_product_to_cart_or_wishlist("wishlist", data);
  });

  const cartBtn = document.querySelector(".cart-btn");
  cartBtn.addEventListener("click", () => {
    cartBtn.innerHTML = add_product_to_cart_or_wishlist("cart", data);
  });
};

// BBBB Attention cette fetchProductData n'est pas la même que celle du fichier addProduct.js.
// cette fonction n'envoie pas l'email puisqu'il s'agit seulement d'affichier un produit, pas de le modifier.
// les données retournées par le server son envoyées à setData pour les reverser dans les champs.
// SeteData est similaire à setFormsData de addProduct.js qui reverssait les données dans le formulaire d'ajout d'un produit.
// part4 12mn50 :
const fetchProductData = () => {
  fetch("/get-products", {
    method: "post",
    headers: new Headers({ "Content-type": "application/json" }),
    body: JSON.stringify({ id: productId }),
  })
    .then((res) => res.json())
    .then((data) => {
      setData(data);
      //console.log(data.tags);
      //console.log(data.tags[1]);
      // part4 35mn25 : On sélectionne le tag d'index 1 (pourquoi 1 ??????) du tableau data.tags, que l'on transmet à getProducts() située dans home.js et qui va transmette le tag a la route POST "/get-products"
      // qui va rassembler tous les produits possédant ce tag et nous les retourner.
      // Ils seront ensuite passés à createProductSlider() pour construire les cartes.
      // ici '.container-for-card-slider' représente la classe de la div 'parent' devant accueillir le slider et "similar products" le titre du slider.
      getProducts(data.tags[1]).then((data) => createProductSlider(data, ".container-for-card-slider", "similar products"));
    })
    .catch((err) => {
      location.replace("/404");
    });
};

// AAAA récupérer l'id si le navigateur voit un id dans l'adresse.
// part4 11mn32 :
let productId = null;
// Si l'adresse dans navigateur est différent de '/products' alors cela veut dire
// quelle à été déclenchée par le bouton open-btn et que l'adresse contient un id.
// donc on récupère l'id.
if (location.pathname != "/products") {
  productId = decodeURI(location.pathname.split("/").pop());
  //console.log(productId);

  // lancer la récupération des données de l'id
  fetchProductData();
}
