let loader = document.querySelector(".loader");
let user = JSON.parse(sessionStorage.user || null);

// section become seller
const becomeSellerElement = document.querySelector(".become-seller");
const showApplyFormBtn = document.querySelector("#apply-btn"); // bouton pour afficher le formulaire
// section apply form
const applyForm = document.querySelector(".apply-form");
// product listing
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

showApplyFormBtn.addEventListener("click", () => {
  becomeSellerElement.classList.add("hide");
  applyForm.classList.remove("hide");
});

// form submission
const applyFormButton = document.querySelector("#apply-form-btn");
const businessName = document.querySelector("#business-name");
const address = document.querySelector("#business-add");
const about = document.querySelector("#about");
const number = document.querySelector("#number");
const tac = document.querySelector("#terms-and-cond");
const legitInfo = document.querySelector("#legitInfo");

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
  // le server va utiliser la route post /get-products pour savoir quoi faire.
  fetch("/get-products", {
    method: "post",
    headers: new Headers({ "Content-type": "application/json" }),
    body: JSON.stringify({ email: user.email }),
  })
    .then((res) => res.json())
    .then((data) => console.log(data));
};
