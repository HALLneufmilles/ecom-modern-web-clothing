// importer les packages
const express = require("express");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const path = require("path");

//firebase admin setup
let serviceAccount = require("./ecom-website-ef3e5-firebase-adminsdk-igrd4-af55f88f5f");
const { isNumberObject } = require("util/types");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let db = admin.firestore();

// AWS config - Part 3 time:36 - J'ai ouvert un compte gratuir AWS, puis démarrer le service S3 (équivalent à 'Firebase Storage')
// puis j'ai demarré un 'Bucket'(compartiment) pour y mettre mes document(fichier, photo etc...)
const aws = require("aws-sdk"); // Un SDK fourni une bibliothèque de fonctions pour faciliter l'utilisation de aws.
const dotenv = require("dotenv"); // Est un module de npm installé en même temps que AWS mais n'a rien à voir.
// Il s'agit d'un module qui va permettre de cacher no identifiants. (je sais pas encore lesquels...)

dotenv.config(); // pour pouvoir utiliser le fichier .env

// AWS parametres
const region = "eu-west-3";
const bucketName = "ecom-modern-web-clothing";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

// On s'identifie à AWS
aws.config.update({ region, accessKeyId, secretAccessKey });

// On initie la base de donnée s3 de AWS. Comme on le fait en ligne 15 (let db = admin.firestore()).
const s3 = new aws.S3(); // s'est une des fonction fourni par le SDK de AWS.

// On génère un lien pour le télécrgement de image ?????????
// Utilisée ligne 220 dans 'app.get('/s3url', ....)'
async function generateUrl() {
  let date = new Date();
  let id = parseInt(Math.random() * 10000000000);

  const imageName = `${id}${date.getTime()}.jpg`;

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 300, //300 ms
    ContentType: "image/jpeg",
  };
  // ATTENTION il faudrait mettre un try /catch. Voir :https://stackoverflow.com/questions/69532165/how-to-upload-files-to-aws-s3-i-get-an-error-when-doing-it-using-private-buck
  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
  //  la méthode "getSignedUrlPromise" de l'objet S3 va servir à générer une URL signée
  // pour mettre un objet ("putObject") avec les paramètres spécifiés (dans la variable "params").
  // Cette adresse est comme une place dédiée par aws pour ranger le fichier, que l'on va
  // utiliser dans la requete fetch(url,...) du fichier addProduct.js

  return uploadUrl;
}

// On crée le chemin A des fichiers statics , Donc staticPath = public
let staticPath = path.join(__dirname, "public");
console.log(staticPath);
// on intègre toutes les fonctionalités d'express dans notre app
const app = express();

// On demande au serveur d'utiliser ce chemin A pour les fichiers statics
app.use(express.static(staticPath));
app.use(express.json());

// routes
// home route:
// Pour que le server puisse aller chercher la page index et l'envoyer au client.
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// signup route:
// Pour que le server puisse aller chercher la page signup et l'envoyer au client.
app.get("/signup", (req, res) => {
  res.sendFile(path.join(staticPath, "signup.html"));
});

// Pour que le server puisse poster les données reçues lors d'une inscription (signup) dans la requête
// dans la base de donnée de firebase (db : voir ligne 14 'let db = admin.firestore();')
app.post("/signup", (req, res) => {
  let { name, email, password, number, tac, notification } = req.body;
  // form validations. si il y à une erreur la fonction s'arrête grace à 'return'
  // et la data renvoyée est un objet contenant le message d'erreur.
  if (name.length < 3) {
    return res.json({ alert: "name must be 3 letters long" });
  } else if (!email.length) {
    return res.json({ alert: "enter your email" });
  } else if (password.length < 8) {
    return res.json({ alert: "password should be 8 letters long" });
  } else if (!number.length) {
    return res.json({ alert: "enter your phone number" });
  } else if (!Number(number) || number.length < 10) {
    return res.json({ alert: "invalid number, please enter valid one" });
  } else if (!tac) {
    return res.json({ alert: "you must agree to our terms and conditions" });
  }
  // Ajouter des utilisateurs à la base de donnée.
  db.collection("users")
    /*l'identifiant de chaque doc de la collection 'users' est effectué avec l'Email. 
        Si aucun doc le premier doc sera créé quand même puisqu'on 
        passe dans le 'else' de la condition 'if' */
    .doc(email)
    .get() // On accède aux docs (email) existant.
    .then((user) => {
      if (user.exists) {
        // Si l'utilisateur existe, on arrète.
        return res.json({ alert: "email already exists" });
      } else {
        // Si l'utilisateur n'existe pas, on l'ajoute à la base de donnée en cryptant le mot de passe.
        bcrypt.genSalt(10, (err, salt) => {
          /*On génère un salt (clef de chiffrement) de 10 tour, Plus le chiffre est grand, 
          plus le chiffrement est complexe, et surtout plus long. */
          bcrypt.hash(password, salt, (err, hash) => {
            /* On recupère le password et le salt pour
            exécuter le hash (cryptage) */
            req.body.password = hash; // On remplace le password par le hash dans le body.
            db.collection("users")
              .doc(email) // Ajoute un doc identifier par l'email
              .set(req.body) // set est utilisé pour ajouter ou modifier les datas de l'utilisateur.
              .then((data) => {
                /*En retour, on demande au server de nous retourner
                   les données name, email et seller. */
                res.json({
                  name: req.body.name,
                  email: req.body.email,
                  seller: req.body.seller,
                });
              });
          });
        });
      }
    });
});

// add product
app.get("/add-product", (req, res) => {
  res.sendFile(path.join(staticPath, "addProduct.html"));
});

// part3 1h45mn04:
app.get("/add-product/:id", (req, res) => {
  // Ici pas de fetch reliée à cette route puisqu'on a rien a poster ni rien à traiter en retour, just besoin de la page. S'est le navigateur qui fait la requete tout seul.
  // Le symbole ":" dans cette route indique qu'il s'agit d'un paramètre variable dans l'URL.
  // Lorsque cette route est appelée avec une valeur spécifique pour "id", cette valeur sera
  // disponible dans l'objet "req" sous "req.params.id".
  res.sendFile(path.join(staticPath, "addProduct.html"));
}); // part3 1h45mn29 : On va sur addProduct.html.

//login route
// Pour que le server puisse aller chercher la page login et l'envoyer au client.
app.get("/login", (req, res) => {
  res.sendFile(path.join(staticPath, "login.html"));
});

// Pour que le server puisse vérifier l'email et password reçus dans la requête lors de la connexion (login)
app.post("/login", (req, res) => {
  let { email, password } = req.body;

  if (!email.length || !password.length) {
    return res.json({ alert: "fill all the inputs" });
  }

  db.collection("users")
    .doc(email)
    .get() // On demande au server d'aller chercher l'utilisateur qui correspond à l'email.
    .then((user) => {
      if (!user.exists) {
        // Si l'utilisateur n'existe pas
        return res.json({ alert: "log in email doesn't exist" });
      } else {
        // Sinon on vérifie que le password transmis au hash du password du user.data() de la db firestore.
        // Puis on dit au server quoi faire des données: retourne le name, l'email et seller.
        bcrypt.compare(password, user.data().password, (err, result) => {
          if (result) {
            let data = user.data();
            return res.json({
              name: data.name,
              email: data.email,
              seller: data.seller,
            });
          } else {
            return res.json({ alert: "password is incorrect" });
          }
        });
      }
    });
});

// seller route
app.get("/seller", (req, res) => {
  res.sendFile(path.join(staticPath, "seller.html"));
});

app.post("/seller", (req, res) => {
  let { name, about, address, number, tac, legit, email } = req.body;
  if (!name.length || !about.length || !address.length || number.length < 10 || !Number(number)) {
    return res.json({ alert: "some information(s) is/are invalid" });
  } else if (!tac || !legit) {
    return res.json({ alert: "you must agree our terms and conditions" });
  } else {
    // Update users seller status here.

    //Je crée une nouvelle collection 'sellers'
    db.collection("sellers") // ATTENTION !!! la collection 'sellers'
      // n'apparaît toujours pas dans firebase voir video part 2 1h43mn10s pour la faire afficher.
      .doc(email)
      .set(req.body)
      // Puis je modifie le status 'seller' du profile de l'utilisateur
      // dans la collection 'users'.
      .then((data) => {
        db.collection("users")
          .doc(email)
          .update({
            seller: true,
          })
          // Puis je renvoi 'true' au client de l'utilisateur.
          .then((data) => {
            res.json(true); // en boolean
          });
      });
  }
});

// sur la requete '/s3url' générer une url AWS et nous la retourner
app.get("/s3url", (req, res) => {
  generateUrl().then((url) => res.json(url));
});

// Ajouter les produits du vendeur
app.post("/add-product", (req, res) => {
  let { name, shortDes, des, images, sizes, actualPrice, discount, sellPrice, stock, tags, tac, email, draft, id } = req.body;
  // validation

  if (!draft) {
    // part3 1h41mn35: Ajout de la condition 'if(!draft)'. S'il sagit d'un draft on passe direct en ligne 268 (let docName) Ensuite on retourne sur createProduct.js pour gérer l'image du produit
    // dans le cas où un draft n'aurait pas d'image. Sinon c'est moche.
    //part3 1h42mn50 ...
    if (!name.length) {
      return res.json({ alert: "enter product name" });
    } else if (shortDes.length > 100 || shortDes.length < 10) {
      return res.json({ alert: "short description must be between 10 to 100 letters long" });
    } else if (!des.length) {
      return res.json({ alert: "enter detail description about the product" });
    } else if (!images.length) {
      // image link array
      return res.json({ alert: "upload atleast one product image" });
    } else if (!sizes.length) {
      // size array
      return res.json({ alert: "select at least one size" });
    } else if (!actualPrice.length || !discount.length || !sellPrice.length) {
      return res.json({ alert: "you must add pricings" });
    } else if (stock < 20) {
      return res.json({ alert: "you should have at least 20 items in stock" });
    } else if (!tags.length) {
      return res.json({ alert: "enter few tags to help ranking your product in search" });
    } else if (!tac) {
      return res.json({ alert: "you must agree to our terms and conditions" });
    }
  }

  // Ajout des produits du vendeur dans la base de données
  let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() * 5000)}` : id;
  db.collection("products") // On accède à la collection 'products' de Firebase.'
    .doc(docName) // On accède à le sous ensemble doc dans laquelle on met 'docName'
    .set(req.body) // On met dans le sous ensemble Data, les données transmises par 'req-body'.
    .then((data) => {
      res.json({ product: name }); // On demande au server de nous retourner cette objet en réponse.
    })
    .catch((err) => {
      // si ça n'a pas pu se faire, on retourne une erreur.
      return res.json({ alert: "some error occured. Try again." });
    });
  // ensuite on va dans Firebase / firestore Database. On crée la collection 'products',
  // ... voir Part3 1h10mn
});

// aller chercher les produit du seller pour les afficher dans la page seller.
// part3 1h50mn40: On récupère Id envoyée par "fetchProductData()" de addProduct.js
app.post("/get-products", (req, res) => {
  // part4 : 25mn On ajout tag. Tag est un tableau de mot clef, qu'on va créer dans addProduct.js dans la la fonction productData(). Comme on a 3 cas à gérer(email, id, tag) on ne peut plus gérer avec une ternaire comme ci-dessous, alors on décompose en 3 conditions (if (id) else if(tag) else...)
  let { email, id, tag } = req.body;
  // let docRef = id ? db.collection("products").doc(id) : db.collection("products").where("email", "==", email);// on rassemble les produits de la base de données
  // ayant dans leurs datas cette adresse email.
  if (id) {
    docRef = db.collection("products").doc(id);
  } else if (tag) {
    docRef = db.collection("products").where("tags", "array-contains", tag); // voir : https://firebase.google.com/docs/firestore/query-data/queries?hl=fr#query_operators
  } else {
    docRef = db.collection("products").where("email", "==", email);
  }
  docRef
    .get() // On demande à les récupérer.
    .then((products) => {
      if (products.empty) {
        // si pas de produit
        return res.json("no product");
      }
      let productArr = [];
      if (id) {
        //console.log("products.data()", products.data());
        return res.json(products.data()); // data() est une métode de firebase qui permet de récupérer les données d'un document.
      } else {
        products.forEach((item) => {
          let data = item.data(); // On met chaque produit avec leurs data, dans une variable data.
          data.id = item.id; // Pour firebase l'id du produit(item) est le nom du document. Nous lui avons transmit le nom du document à en ligne 254 (let docName = `${n....  )
          // Comme cet id n'est pas compris dans les datas, on le rajoute.
          productArr.push(data); // On envoi les datas de chaque item dans le tableau des produits.
        });
        res.json(productArr); // Enfin on demande au server de nous retourner 'productArr' comme data.
      }
    });
});

// part3 1h36mn55: On crée la route pour supprimer le produit
app.post("/delete-product", (req, res) => {
  let { id } = req.body;

  db.collection("products")
    .doc(id)
    .delete()
    .then((data) => res.json("success"))
    .catch((err) => res.json("err"));
}); // part3 1h38mn00: On retourne terminer la requete dans createProduct.js

// Gat product's page
app.get("/products/:id", (req, res) => {
  res.sendFile(path.join(staticPath, "product.html"));
});

// 404 route:
// pour toutes les root commençant par "/404" Exemple: "/404/azeaze/aze" ....
app.get("/404", (req, res) => {
  res.sendFile(path.join(staticPath, "404.html"));
});

// .... rediriger vers "/404"
app.use((req, res) => {
  res.redirect("/404");
});

app.listen(3000, () => {
  console.log("listening on port 3000..........");
});
// On commence par déclarer la première route. Lorsqu’un client enverra
// une requête HTTP “GET” à l’url `localhost:8080/`, notre serveur node lui répondra “Hello World”.
