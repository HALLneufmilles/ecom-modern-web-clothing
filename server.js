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
aws.config.update({
  region,
  accessKeyId,
  secretAccessKey
});

// On initie la base de donnée s3 de AWS. Comme on le fait en ligne 15 (let db = admin.firestore()).
const s3 = new aws.S3(); // s'est une des fonction fourni par le SDK de AWS.

// On génère un lien pour le télécrgement de image ?????????
// Utilisée ligne 220 dans 'app.get('/s3url', ....)'
async function generateUrl() {
  let date = new Date();
  let id = parseInt(Math.random() * 10000000000);

  const imageName = `${id}${date.getTime()}.jpg`;

  const params = ({
    Bucket: bucketName,
    Key: imageName,
    Expires: 300, //300 ms
    ContentType: "image/jpeg",
  });
  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
  return uploadUrl;
}

// On crée le chemin A des fichiers statics , Donc staticPath = public
let staticPath = path.join(__dirname, "public");

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

// sur la requete '/s3url' générer une url et nous la retourner
app.get("/s3url", (req, res) => {
  generateUrl().then((url) => res.json(url));
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