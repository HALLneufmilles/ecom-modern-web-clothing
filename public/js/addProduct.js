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
//console.log(uploadImages);
let imagePaths = []; // il va stocker toutes les images téléchargées

// sur la requete '/s3url', on console.log la réponse du server à app.get('/s3url')
uploadImages.forEach((fileupload, index) => {
  fileupload.addEventListener("change", () => {
    //console.log(fileupload.files); // La propriété 'files' d'un INPUT de type 'file',
    // renvoie un objet 'filelist' qui liste les fichiers sélectionnés.
    // Cette liste n'a qu'un seul élément, sauf si 'multiple' est indiqué dans dans l'élément INPUT.
    const file = fileupload.files[0]; // 'file[0]' fait donc référence au 1er élément de 'filelist'
    //console.log("file: ", file);
    let imageUrl;

    if (file.type.includes("image")) {
      // means user uploaded an image
      fetch("/s3url") // enclenche la requete get('/s3url') qui génère puis retourne une url pour aws.
        .then((res) => res.json())
        .then((url) => {
          // On récupère l'adresse
          //console.log("url : ", url);
          fetch(url, {
            // On fait une nouvelle requete, mais cette fois à l'API AWS, avec l'url signée
            // par AWS que nous à retournée le server
            method: "PUT",
            headers: new Headers({ "Content-Type": "multipart/form-data" }),
            body: file,
          }).then((res) => {
            // On récupère ce qui nous interresse dans l'adresse retounée par AWS dans la réponse.
            imageUrl = url.split("?")[0]; // On récupère la partie de l'adresse de l'mage sans les paramètres '?'.
            imagePaths[index] = imageUrl; // On la range dans le tableau 'imagePaths' à l'index corespondant à
            // l'image cliquée qui à déclenchée le addEventListener.
            //console.log("imageUrl :", imageUrl);

            // On veut récupérer le label de l'input...
            // ... Si on regarde le html de addProduct:

            // <input type="file" class="fileupload" id="first-file-upload-btn" hidden />
            // <label for="first-file-upload-btn" class="upload-image"></label>;

            // On voit que l'attribut 'for' du label correspond à l'id de l'INPUT.
            // Comme l'INPUT est fileupload.

            // Donc le label de l'INPUT est:
            let label = document.querySelector(`label[for=${fileupload.id}]`); // On sélectionne l'input
            label.style.backgroundImage = `url(${imageUrl})`; // On lui passe l'image en background

            // et on affiche l'image en grand dans la div de classe 'product-image'.
            let productImage = document.querySelector(".product-image");
            productImage.style.backgroundImage = `url(${imageUrl})`;
          });
        });
    } else {
      showAlert("upload image only"); // showAlerte est chargé avec le l'utilisation du fichier 'token.js' dans 'addProduct.html'
    }
  });
});

// form submission
const productName = document.querySelector("#product-name");
const shortLine = document.querySelector("#short-des");
const des = document.querySelector("#des");
// Un tableau pour enregistrer les tailles
let sizes = [];

const stock = document.querySelector("#stock");
const tags = document.querySelector("#tags");
const tac = document.querySelector("#tac");

// buttons
const addProductBtn = document.querySelector("#add-btn");
const saveDraft = document.querySelector("#save-btn");

// Une fonction pour enregistrer les tailles
const storeSizes = () => {
  sizes = [];
  const sizeCheckBox = document.querySelectorAll(".size-checkbox");
  sizeCheckBox.forEach((item) => {
    if (item.checked) {
      sizes.push(item.value);
    }
  });
};

const validateForm = () => {
  if (!productName.value.length) {
    return showAlert("enter product name");
  } else if (shortLine.value.length > 100 || shortLine.value.length < 10) {
    return showAlert("short description must be between 10 to 100 letters long");
  } else if (!des.value.length) {
    return showAlert("enter detail description about the product");
  } else if (!imagePaths.length) {
    // image link array
    return showAlert("upload atleast one product image");
  } else if (!sizes.length) {
    // size array
    return showAlert("select at least one size");
  } else if (!actualPrice.value.length || !discount.value.length || !sellingPrice.value.length) {
    return showAlert("you must add pricings");
  } else if (stock.value < 20) {
    return showAlert("you should have at least 20 items in stock");
  } else if (!tags.value.length) {
    return showAlert("enter few tags to help ranking your product in search");
  } else if (!tac.checked) {
    return showAlert("you must agree to our terms and conditions");
  }
  return true;
};

const productData = () => {
  // On rassembles les données
  return (data = {
    name: productName.value,
    shortDes: shortLine.value,
    des: des.value,
    images: imagePaths,
    sizes: sizes,
    actualPrice: actualPrice.value,
    discount: discountPercentage.value,
    sellPrice: sellingPrice.value,
    stock: stock.value,
    tags: tags.value,
    tac: tac.checked,
    email: user.email,
  });
};

addProductBtn.addEventListener("click", () => {
  storeSizes();
  //console.log(sizes);
  // Validation form
  if (validateForm()) {
    loader.style.display = "block"; // validForm return true or false while doing validation.
    let data = productData(); // créé juste au-dessus
    sendData("/add-product", data); // sendData est dans token.js
  } // maintenant il faut aller dans server.js pour créer la route
  // POST '/add-product pour dire au server quoi faire des données.
});
