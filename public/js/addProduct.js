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
// ***************  CREER UN PRODUIT  ****************************************

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
console.log("uploadImages : ", uploadImages);
let imagePaths = []; // il va stocker toutes les images téléchargées

// sur la requete '/s3url', on console.log la réponse du server à app.get('/s3url')
uploadImages.forEach((fileupload, index) => {
  fileupload.addEventListener("change", () => {
    //console.log(fileupload.files); // La propriété 'files' d'un INPUT de type 'file',
    // renvoie un objet 'filelist' qui liste les fichiers sélectionnés.
    // Cette liste n'a qu'un seul élément, sauf si 'multiple' est indiqué dans dans l'élément INPUT.
    const file = fileupload.files[0]; // 'file[0]' fait donc référence au 1er élément de 'filelist'
    //console.log("file: ", file);
    //console.log(uploadImages);
    //console.log(file);

    let imageUrl;

    if (file.type.includes("image")) {
      // means user uploaded an image
      fetch("/s3url") // enclenche la requete get('/s3url') qui génère puis retourne une url aws.
        .then((res) => res.json())
        .then((url) => {
          // On récupère l'adresse
          //console.log("url : ", url);
          fetch(url, {
            // On fait une nouvelle requete, mais cette fois à l'API AWS, avec l'url signée
            // par AWS que nous à retournée le server ce qui poste le fichier sur le sever AWS.
            method: "PUT",
            headers: new Headers({ "Content-Type": "multipart/form-data" }),
            body: file,
          }).then((res) => {
            //console.log(res);
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

// valider le formulaire
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
  // part4 26mn49 : On ajoute un tagArr qui va contenir les tags pour le produit
  let tagArr = tags.value.split(",");
  tagArr.forEach((item, i) => (tagArr[i] = tagArr[i].trim())); // ça enlève les blanc en début et fin de chaque tag
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
    tags: tagArr, // part4 27mn35 :On remplace 'tag.value' par le tableau.
    tac: tac.checked,
    email: user.email,
  });
};

// ********** ENVOYER LES DONNEES DU NOUVEAU PRODUIT  ********************

// Add product btn
addProductBtn.addEventListener("click", () => {
  storeSizes();
  //console.log(sizes);
  // Validation form
  if (validateForm()) {
    loader.style.display = "block"; // validForm return true or false while doing validation.
    let data = productData(); // créé juste au-dessus

    // Part3 2h00mn40 : On modifie addProductBtn ligne 174.
    if (productId) {
      // Si il y à un id dans productId ligne 290 et qu'on active le addProductBtn,alors on est en train de modifier un produit
      data.id = productId; // Alors on ajoute l'id dans data et on fait une requete post "/add-product" et on va gérer la présence de l'id dans la route du fichier server.js
    } // part3 2h01mn 30 : On va sur server.js pour gérer l'id ligne 268.

    sendData("/add-product", data); // sendData est dans token.js
  } // maintenant il faut aller dans server.js pour créer la route
  // POST '/add-product pour dire au server quoi faire des données.
});

// ********  SAUVEGARDE D'UN DRAFT AVEC BTN SAVE  ***********************

// part3 1h39mn21:
// save draft btn
saveDraft.addEventListener("click", () => {
  // store sizes
  storeSizes();
  // check for product name
  if (!productName.value.length) {
    showAlert("enter product name");
  } else {
    // don't validate the datas
    let data = productData(); // on crée l'objet de data
    data.draft = true; // On ajoute une clef / valeur draft : true

    // Part3 2h00mn40 : On modifie addProductBtn ligne 174.
    if (productId) {
      // Si il y à un id dans productId ligne 290 et qu'on active le savDraft, alors on est en train de modifier un draft
      data.id = productId; // Alors on ajoute l'id dans data et on fait une requete post "/add-product" et on va gérer la présence de l'id dans la route du fichier server.js
    } // part3 2h01mn 30 : On va sur server.js pour gérer l'id ligne 268.

    sendData("/add-product", data); // On envoie les datas au server, donc sans passer par la validation du formulaire
  } // part3 1h41mn35: On doit contourner la validation du formulaire côté sever. On se rend sur server.js pour ajouter
  // une condition avec la variable 'draft'.
});

// ********************** EDITER le DRAFT (id) AVEC LE BTN EDITE DE LA PAGE SELLER  ******************
//  Commence en ligne 294 !

// CCCCCC rechargement les données dans les champs du formulaire correspondant à l'id.
const setFormsData = (data) => {
  productName.value = data.name;
  shortLine.value = data.shortDes;
  des.value = data.des;
  actualPrice.value = data.actualPrice;
  discountPercentage.value = data.discount;
  sellingPrice.value = data.sellPrice;
  stock.value = data.stock;
  tags.value = data.tags;

  // rechargement des images
  imagePaths = data.images;
  // console.log("imagePath : ", imagePaths);
  // imagePaths est un tableau qui regroupe les liens AWS des images contenu des les inputs d'image (et dans le même ordre)
  imagePaths.forEach((url, i) => {
    // uploadImages est défini en ligne 42, c'est un tableau regroupant les inputs d'image. les inputs serve uniquement au chargement des images. Au final les image sont affichées dans les labels.
    // uploadImage[i] est donc l'input d'image ayant le même index que l'image dans 'imagePath (l'index 0,1,2 ou 3 (4 inputs)).
    // ... Si on regarde le html de addProduct:

    // <input type="file" class="fileupload" id="first-file-upload-btn" hidden />
    // <label for="first-file-upload-btn" class="upload-image"></label>;

    // On ne met pas l'image dans l'input mais dans le label de l'input. Donc on cible les labels.
    // Les labels sont identifiers par l'attribut 'for' identique à l'id de l'input.
    // donc on cible
    let label = document.querySelector(`label[for=${uploadImages[i].id}]`);
    // On affiche l'image dans le label en lui passant l'url AWS
    label.style.backgroundImage = `url(${url})`;
    // On fait la même chose pour l'image grand format à gauche
    let productImage = document.querySelector(".product-image");
    productImage.style.backgroundImage = `url(${url})`;
    // A la fin du chargement s'est la dernière image chargée qui apparit dans productImage.
  });

  // rechargement des tailles
  sizes = data.sizes;
  //console.log("sizes rechargées :", sizes); // retourne par exemple ['s','m','l']
  let sizeCheckbox = document.querySelectorAll(".size-checkbox");
  sizeCheckbox.forEach((item) => {
    // On passe en revue chaque checkbox
    if (sizes.includes(item.value)) {
      // Si la valeur de la checkbox en cours est contenue dans le tableau sizes
      item.setAttribute("checked", ""); // On ajoute la propriété "checked" avec la valeur "", puisque elle n'a jamais de valeur.
      // la checkbox apparait grisée.
      // info sur setAttribute : https://developer.mozilla.org/fr/docs/Web/API/Element/setAttribute
    }
  }); // Part3 2h00mn40 : On modifie addProductBtn (ligne 183) pour les produits que l'on souhaite modifier et saveDraft pour les draft que l'on souhaite terminer.
};

// BBBBBBB On fait une requete au server pour récupérer les données du produit / draft en transmettant son id. Puis on envoie les données retournées par le server a setFormeData qui va recharger les données/images dans les champs.
const fetchProductData = () => {
  fetch("/get-products", {
    method: "post",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email: user.email, id: productId }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("fetchProductData data:", data); // part3 1h50mn40: On va sur seller.js a route post '/get-products'

      setFormsData(data); // Cette fonction a pour fonction de reverser les données dans les champs du formulaire
    })
    .catch((err) => {
      //location.replace("/seller");
      console.log(err);
    });
};

// AAAAAA  La page addProduct.html s'affiche lorsqu'on veut ajouter un nouveau produit OU lorsqu'on veut modififer un produit ou un draft
let productId = null;
//console.log(location.pathname); // affiche l'url en cours: "http://localhost:3000/add-product/id"
if (location.pathname != "/add-product") {
  // pourquoi par la négation ????????????????
  // Alors l'url affichée par le navigateur fait suite à l'activation d'un edit-btn (d'un produit ou draft) défini dans createProduct.js, donc l'url ressemblera à "/add-product/:id" avec un id.
  // Donc on récupère l'id
  productId = decodeURI(location.pathname.split("/").pop()); // La méthode pop() supprime le dernier élément d'un tableau et retourne cet élément. Cette méthode modifie la longueur du tableau. decodeURI décode les symboles parfois présent dans les urls.
  //console.log(productId); // affiche l'Id

  fetchProductData();
}
