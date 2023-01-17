const createNav = () => {
  let nav = document.querySelector(".navbar");

  nav.innerHTML = `
        <div class="nav">
            <img src="img/dark-logo.png" class="brand-logo" alt="">
            <div class="nav-items">
                <div class="search">
                    <input type="text" class="search-box" placeholder="search brand, product">
                    <button class="search-btn">search</button>
                </div>
                <a> <!-- ***position relative*** -->
                <img src="img/user.png" id="user-img" alt="">
                <div class="login-logout-popup hide"> <!-- ***position absolute*** -->
                    <p class="account-info">Loged in as, name</p>
                    <button class="btn" id="user-btn">Log out</button>
                </div>
                </a>
                <a href="#"><img src="img/cart.png" alt=""></a>
            </div>
        </div>
        <ul class="links-container">
            <li class="link-item"><a href="#" class="link">home</a></li>
            <li class="link-item"><a href="#" class="link">women</a></li>
            <li class="link-item"><a href="#" class="link">men</a></li>
            <li class="link-item"><a href="#" class="link">kids</a></li>
            <li class="link-item"><a href="#" class="link">accessories</a></li>
        </ul>
    `;
};

createNav();

// nav popup
const userImageButton = document.querySelector("#user-img");
const userPopup = document.querySelector(".login-logout-popup");
const popuptext = document.querySelector(".account-info");
const actionBtn = document.querySelector("#user-btn");

userImageButton.addEventListener("click", () => {
  userPopup.classList.toggle("hide");
});

let user = JSON.parse(sessionStorage.user || null);
if (user != null) {
  // Un utilisateur est connecté, on affiche son nom
  popuptext.innerHTML = `log in as, ${user.name}`;
  actionBtn.innerHTML = "log out";
  actionBtn.addEventListener("click", () => {
    sessionStorage.clear();
    location.reload();
  });
} else {
  // Pas d'utilisateur connecté
  popuptext.innerHTML = "log in to place order";
  actionBtn.innerHTML = "log in";
  actionBtn.addEventListener("click", () => {
    location.href = "/login";
  });
}