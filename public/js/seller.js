let loader = document.querySelector(".loader");
let user = JSON.parse(sessionStorage.user || null);

// section sur la description du role de vendeur
const becomeSellerElement = document.querySelector(".become-seller");
// bouton pour faire apparaitre le formulaire de candidature au role de vendeur
const showApplyFormBtn = document.querySelector("#apply-btn"); // bouton pour afficher le formulaire
// formulaire de cadidature au role de vendeur
const applyForm = document.querySelector(".apply-form");
// list des produits ajoutés par le vendeur
const productListingElement = document.querySelector(".product-listing");

window.onload = () => {
  // Si un utilisateur est connecté et confirmé,
  // alors on lui donne accès à la page 'seller.html',
  // si pas d'utilisateur connecté ou mauvais Token
  // on le redirige vers la page 'login.html'.
  if (user) {
    //let user = JSON.parse(sessionStorage.user); part3 1h20mn19: déplacé en ligne 2
    if (compareToken(user.authToken, user.email)) {
      if (!user.seller) {
        becomeSellerElement.classList.remove("hide");
      } else {
        //productListingElement.classList.remove("hide"); part3 1h19mn14 : commenté + ajout de ligne en-dessous
        loader.style.display = "block";
        setupProducts(); // On va chercher les produits dans la bd firebase. Firebase contient les liens sécurisés AWS vers les images.
      }
    } else {
      location.replace("/login");
    }
  } else {
    location.replace("/login");
  }
};

// une un click du bouton pour faire apparaitre le formulaire de candidature au role de vendeur
showApplyFormBtn.addEventListener("click", () => {
  becomeSellerElement.classList.add("hide"); // On fait disparaitre le section sur la description du role de vendeur
  applyForm.classList.remove("hide"); // On affiche le formulaire de cadidature au role de vendeur
});

// On accède aux champs du formulaire de cadidature au role de vendeur
const applyFormButton = document.querySelector("#apply-form-btn");
const businessName = document.querySelector("#business-name");
const address = document.querySelector("#business-add");
const about = document.querySelector("#about");
const number = document.querySelector("#number");
const tac = document.querySelector("#terms-and-cond");
const legitInfo = document.querySelector("#legitInfo");

// Sur un click du bouton de validation du formulaire de cadidature au role de vendeur
applyFormButton.addEventListener("click", () => {
  if (!businessName.value.length || !address.value.length || !about.value.length || !number.value.length) {
    showAlert("fill all the inputs");
  } else if (!tac.checked || !legitInfo.checked) {
    showAlert("you must agree to our terms and conditions");
  } else {
    // making serveur request
    loader.style.display = "block";
    sendData("/seller", {
      name: businessName.value,
      address: address.value,
      about: about.value,
      number: number.value,
      tac: tac.checked,
      legit: legitInfo.checked,
      email: JSON.parse(sessionStorage.user).email,
    });
  }
});

const setupProducts = () => {
  // envoie une requete 'post'(parcequ'on envoie l'adresse email au server) au server.
  // le server va utiliser la route post /get-products aller chercher dans la base de données de Firebase, tous les produits relatif à l'email.
  // le server retournera soit un 'no-product' soit un tableau de produits (productArr) voir server.js ligne 285.
  fetch("/get-products", {
    method: "post",
    headers: new Headers({ "Content-type": "application/json" }),
    body: JSON.stringify({ email: user.email }),
  })
    .then((res) => res.json())
    .then((data) => {
      // part3 1h25mn
      loader.style.display = null;
      productListingElement.classList.remove("hide");

      if (data == "no product") {
        let emptySvg = document.querySelector(".no-product-image");
        emptySvg.classList.remove("hide");
      } else {
        data.forEach((product) => {
          createProduct(product); // --> part3 1h25mn : integration à seller.html
        });
      }
    });
};
