// createProduct.js crée les cartes produit sur la page '/seller'

// part3 1h43mn50: On déclare openEditor de manière globale. Cette fonction permettra de modifier un article
let openEditor;

// part3 1h25mn: ... seller.js
const createProduct = (data) => {
  // part3 1h43mn57: On définit openEditor
  openEditor = () => {
    // ATTENTION openEditor() est déclenchée par édit-btn !!! non pas open-btn
    sessionStorage.tempProduct = JSON.stringify(data);
    location.href = `/add-product/${data.id}`; //On dit au navigateur, va à la page draft du produit posedant cet id.
  }; // part3 1h45mn04: On va sur server.js créer une route get '/add-product/:id

  //console.log("createProductDAta: ", data);
  let productContainer = document.querySelector(".product-container");
  // On va chercher le Html des cartes dans seller.html
  productContainer.innerHTML += `
    <div class="product-card">
        <div class="product-image">
            ${data.draft ? `<span class="tag">Draft</span>` : ""}
<!-- part3 1h42mn50: On ajoute une image 'no image' si pas d'image en cas de draft -->
            <img src="${data.images[0] || "img/no image.png"}" class="product-thumb" alt="" />

<!-- part3 1h43mn30: On active le bouton édite avec la fonction openEditor() qu'on déclare en ligne 3 de manière à se qu'elle soit globale-->
            <button class="card-action-btn edit-btn" onclick="openEditor()"><img src="img/edit.png" alt="" /></button>

            <button class="card-action-btn open-btn" onclick="location.href = '/${data.id}'"><img src="img/open.png" alt="" /></button>
<!--  part3 1h33mn29:  On active le bouton delete avec onclick() -->
            <button class="card-action-btn delete-popup-btn" onclick="openDeletePopup('${data.id}')"><img src="img/delete.png" alt="" /></button>
        </div>
        <div class="product-info">
            <h2 class="product-brand">${data.name}</h2>
            <p class="product-short-des">${data.shortDes}</p>
        <span class="price">${data.sellPrice}</span><span class="actual-price">${data.actualPrice}</span>
        </div>
    </div> 
    `;
  console.log(data.id);
}; // part3 1h28mn29: on va sur seller.html pour commencer le 'delete alert'

// part3 1h33mn56:
const openDeletePopup = (id) => {
  let deleteAlert = document.querySelector(".delete-alert");
  deleteAlert.style.display = "flex";

  let closeBtn = document.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => (deleteAlert.style.display = null));

  let deleteBtn = document.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => deleteItem(id));
};

// part3 1h35mn48:
const deleteItem = (id) => {
  fetch("/delete-product", {
    method: "post",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({ id: id }),
  })
    .then((res) => res.json())
    .then((data) => {
      // part3 1h36mn55: avant de décrir ce qu'on va faire avec la réponse on va faire la route sur server.js

      // part3 1h38mn00:
      if (data == "success") {
        location.reload();
      } else {
        showAlert("some error occured while deleting the product. Try again");
      }
    }); // On test le bouton supprime produit. Si tout fonctionne on active le bouton draft de addproduct.html
  // part3 1h39mn21: On va sur addproduct.js pour activer le bouton draf
};
