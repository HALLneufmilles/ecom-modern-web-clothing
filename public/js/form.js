// Form.js fonctionne à la fois pour signup et login

// redirect to home page if user logged in
// window.onload attend que la page et toutes ses ressources soient chargés.
window.onload = () => {
  // lorsque l'utilisateur charge / recharge la page signup ...
  if (sessionStorage.user) {
    // Si sessionStorage a un user ...
    user = JSON.parse(sessionStorage.user); /* je récupère ses données et les 
     converti en un objet Javascript pour pouvoir l'utiliser. */
    if (compareToken(user.authToken, user.email)) {
      // Si le token correspond à l'Email ...
      location.replace("/"); // Je redirige l'utilisateur vers l'accueil.
    }
  }
};

const loader = document.querySelector(".loader");

// select inputs

// Les " || null " !!! sont ajoutés au temps: 1h00mn46s pour la page login (de connexion).
// la page login n'a pas les champs name, number, terms-and-cond et notification.
// Donc pour pouvoir utiliser le même fichier "form.js" pour cette page,
// il faut prendre en compte que ces champs puissent avoir la valeur 'null'.
const submitBtn = document.querySelector(".submit-btn");
const name = document.querySelector("#name") || null;
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const number = document.querySelector("#number") || null;
const tac = document.querySelector("#terms-and-cond") || null;
const notification = document.querySelector("#notification") || null;

submitBtn.addEventListener("click", () => {
  // les if else ci-dessous on été mise ici au début du tuto pour préparer l'affichage des erreur, puis transférées au server.

  if (name != null) {
    // condition ajoutée à --1h01mn05s-- en rapport à la page Login.
    // Si name est différent de null au moment du 'click', alors on est forcément
    // sur la page signup car la page login ne possède pas de champs name.
    // Donc dans ce cas, on effectue les controles ci-dessous.
    if (name.value.length < 3) {
      showAlert("name must be 3 letters long");
    } else if (!email.value.length) {
      showAlert("enter your email");
    } else if (password.value.length < 8) {
      showAlert("password should be 8 letters long");
    } else if (!number.value.length) {
      showAlert("enter your phone number");
    } else if (!Number(number.value) || number.value.length < 10) {
      showAlert("invalid number, please enter valid one");
    } else if (!tac.checked) {
      showAlert("you must agree to our terms and conditions");
    } else {
      // submit form
      loader.style.display = "block"; // On affiche le gift loader
      sendData("/signup", {
        // les données du formulaire sont passées a la fonction sendData
        name: name.value,
        email: email.value,
        password: password.value,
        number: number.value,
        tac: tac.checked,
        notification: notification.checked,
        seller: false,
      });
    }
  } else {
    // ajoutée à --1h02mn02s--
    // On est sur la page log in

    // Si les champs ne sont pas remplis ...
    if (!email.value.length || !password.value.length) {
      showAlert("fill all the inputs");
    } else {
      // Sinon on soumet les infos avec la requete fetch de sendData en mode POST.
      loader.style.display = "block"; // On affiche le gift loader
      sendData("/login", {
        // les données du formulaire sont passées a la fonction sendData
        email: email.value,
        password: password.value,
      });
    }
  }
});

/* ******  time 1h06mn48s Les fonction sendData, processData et showAlert
     sont déplacées dans le fichier "token.js"  ******** */
