let user = JSON.parse(sessionStorage.user || null);
let loader = document.querySelector(".loader");

// Vérifier si user est connecté ou nom
window.onload = () => {
  if (user) {
    if (!compareToken(user.authToken, user.email)) {
      location.replace("/login");
    }
  } else {
    location.replace("/login");
  }
};

// prix de départ
const actualPrice = document.querySelector("#actual-price");
// % de réduction
const discountPercentage = document.querySelector("#discount");
// prix final
const sellingPrice = document.querySelector("#sell-price");

// l'utilisateur doit pouvoir calculer le prix de vente en fonction du % de rabais,
// ou le rabais en fonction du prix final:
// On calcule le prix final en fonction du % de réduction.
// Event 'input', voir: https://fr.javascript.info/events-change-input
discountPercentage.addEventListener("input", () => {
  if (discountPercentage.value > 100) {
    discountPercentage.value = 90;
  } else {
    let discount = (actualPrice.value * discountPercentage.value) / 100;
    sellingPrice.value = actualPrice.value - discount;
  }
});

// on calcul le % de réduction en fonction du prix final.
sellingPrice.addEventListener("input", () => {
  let discount = (sellingPrice.value / actualPrice.value) * 100;
  discountPercentage.value = 100 - discount;
});

// charger une image dans le catalogue
let uploadImages = document.querySelectorAll(".fileupload");
let imagePaths = []; // il va stocker toutes les images téléchargées

// sur la requete '/s3url', on console.log la réponse du server à app.get('/s3url')
fetch("/s3url")
  .then((res) => res.json())
  .then((url) => console.log(url));
