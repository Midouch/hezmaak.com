// ==============================
// MENU MOBILE
// ==============================

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("open");

  if (nav.classList.contains("open")) {
    menuToggle.textContent = "✕";
  } else {
    menuToggle.textContent = "☰";
  }
});


// Chiude il menu dopo il click

document.querySelectorAll(".nav a").forEach(link => {

  link.addEventListener("click", () => {

    nav.classList.remove("open");

    menuToggle.textContent = "☰";

  });

});


// ==============================
// LANGUAGE MODAL
// ==============================

const languageButton =
  document.getElementById("languageButton");

const languageModal =
  document.getElementById("languageModal");

const closeLanguage =
  document.getElementById("closeLanguage");


// Apertura

languageButton.addEventListener("click", () => {
  languageModal.classList.add("show");
});


// Chiusura

closeLanguage.addEventListener("click", () => {
  languageModal.classList.remove("show");
});


// Chiudi cliccando fuori

languageModal.addEventListener("click", (event) => {

  if (event.target === languageModal) {
    languageModal.classList.remove("show");
  }

});


// ==============================
// CAMBIO LINGUA - BASE
// ==============================

const languageOptions =
  document.querySelectorAll(".lang-option");


languageOptions.forEach(button => {

  button.addEventListener("click", () => {

    const language =
      button.dataset.lang;


    // ARABO

    if (language === "ar") {

      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";

      languageButton.innerHTML =
        "🌐 العربية";

    }


    // ITALIANO

    if (language === "it") {

      document.documentElement.lang = "it";
      document.documentElement.dir = "ltr";

      languageButton.innerHTML =
        "🌐 Italiano";

      alert(
        "La versione italiana verrà collegata al file data/it.json."
      );

    }


    // FRANCESE

    if (language === "fr") {

      document.documentElement.lang = "fr";
      document.documentElement.dir = "ltr";

      languageButton.innerHTML =
        "🌐 Français";

      alert(
        "La version française sera reliée au fichier data/fr.json."
      );

    }


    languageModal.classList.remove("show");

  });

});