let char = `123abcde.fmnopqlABCDE@FJKLMNOPQRSTUVWXYZ456789stuvwxyz0!#$%&ijkrgh'*+-/=?^_${"`"}{|}~`;

const generateToken = (key) => {
  let token = "";
  for (let i = 0; i < key.length; i++) {
    let index = char.indexOf(key[i]) || char.length / 2;
    let randomIndex = Math.floor(Math.random() * index);
    token += char[randomIndex] + char[index - randomIndex];
  }
  //console.log(token, key);
  return token;
};

const compareToken = (token, key) => {
  let string = "";
  for (let i = 0; i < token.length; i = i + 2) {
    let index1 = char.indexOf(token[i]);
    let index2 = char.indexOf(token[i + 1]);
    string += char[index1 + index2];
  }
  if (string === key) {
    return true;
  }
  return false;
};

/* ******  time 1h06mn48s Les fonctions sendData, processData et showAlert
     sont couper/coller depuis form.js. Ca va permettre lors du codage de
     page seller.html d'importer ce dont on à besoin dans ce fichier. 
     voir l'impotation de 'token.js' dans 'seller.html'. ***** */

const sendData = (path, data) => {
  // On met les données dans le body de la requete
  // et on les envoi au server sous forme de string.
  fetch(path, {
    method: "post",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(data), // fetch envoi la requete au server en communiquant les données sous forme de texte
  })
    .then((res) => res.json()) // La réponse du server est converti en objet Javascript
    .then((response) => {
      /* On récupère les données du serveur. Données que nous avons stipuler
        au server de nous retourner en ligne 75 du fichier "server.js" avec :
        .then((data) => {
                res.json({
                  name: req.body.name,
                  email: req.body.email,
                  seller: req.body.seller,
                });
              }); 
        Puis on les traite dans processData. */
      processData(response);
    });
};

const processData = (data) => {
  // Si une erreur est détecté, la route
  // app.post("/signup", ... ) retourne un objet {alert: "msg"}.
  // donc data.alert fait référence à cette objet.
  loader.style.display = null; // supprime le gift loader
  if (data.alert) {
    // Si le server nous retourne une erreur ...

    showAlert(data.alert); // data.alert est donc le msg.
  } else if (data.name) {
    // Si le server nous retourne un name ...

    // si il y à un data.name s'est qu'il n'y avait pas d'erreur.
    //console.log(data);
    // Nous servait de console.log au début du tuto pour afficher les données afin de
    // s'assurer qu'on recevait bien les données.

    // maintenant on crée un Token pour le client afin qu'il puisse etre
    // connecté automatiquement et de n'importe quel appareil, lors de sa prochaine session. ce Token à une
    // durée de validité qu'il faudra spécifier.

    // On rajoute la cléf "authToken" à l'objet data.
    // puis on géneère le Token avec la fonction "generateToken" qu'on va créer
    // dans le fichier "token.js" (ne pas oublier de l'ajouter dans signup.html)
    data.authToken = generateToken(data.email);

    // On place les données de l'utilisateur dans sessionStorage (mémoire du navigateur)
    sessionStorage.user = JSON.stringify(data);

    //On redirige l'utilisateur vers la page d'acceuil
    location.replace("/");
  } else if (data == true) {
    // Si le server nous retourne un 'true'

    // cela veut dire que s'est la réponse à la requête POST /seller et
    // que l'utilisateur s'est increit en tant que seller.

    // Donc on met à jour le status 'seller' de l'utilisateur dans sessionStorage.
    // pour ça on commence par récupérer les données contenies dans sessionStorage.
    // Les données contenu dans sessionStorage sont stringifiées, donc on utilise 'parse' les
    // transformer en Objet Javascript.
    let user = JSON.parse(sessionStorage.user);
    user.seller = true; // user est maintenant modifié
    sessionStorage.user = JSON.stringify(user); // On renvoi les donnée user modifiées et stringifiées
    // dans sessionStorage.
    location.reload(); // on recharge la page seller.
  } else if (data.product) {
    location.href = "/seller";
  }
};

// alert function
const showAlert = (msg) => {
  let alertBox = document.querySelector(".alert-box");
  let alertMsg = document.querySelector(".alert-msg");
  alertMsg.innerHTML = msg;
  alertBox.classList.add("show");
  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 2000);
  return false;
};
