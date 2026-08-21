/* =====================================================
   WASELNI - SISTEMA LINGUE
===================================================== */

const supportedLanguages = ["it", "en", "fr", "ar"];

let currentLanguage =
  localStorage.getItem("waselni_language") || "it";

let translations = {};


/* =====================================================
   CARICA TRADUZIONE
===================================================== */

async function loadLanguage(lang) {

  if (!supportedLanguages.includes(lang)) {
    lang = "it";
  }

  try {

    const response =
      await fetch(`data/${lang}.json`);

    if (!response.ok) {
      throw new Error(
        `Impossibile caricare data/${lang}.json`
      );
    }

    translations =
      await response.json();

    currentLanguage = lang;

    localStorage.setItem(
      "waselni_language",
      lang
    );

    applyTranslations();

    updateLanguageButton();

    updateDirection();

  } catch (error) {

    console.error(
      "Errore caricamento lingua:",
      error
    );

  }

}


/* =====================================================
   TRADUCI ELEMENTI HTML
===================================================== */

function applyTranslations() {

  document
    .querySelectorAll("[data-i18n]")
    .forEach(element => {

      const key =
        element.dataset.i18n;

      const value =
        getTranslation(key);

      if (value !== null) {
        element.textContent = value;
      }

    });


  document
    .querySelectorAll("[data-i18n-placeholder]")
    .forEach(element => {

      const key =
        element.dataset.i18nPlaceholder;

      const value =
        getTranslation(key);

      if (value !== null) {
        element.placeholder = value;
      }

    });

}


/* =====================================================
   TROVA TRADUZIONE
===================================================== */

function getTranslation(key) {

  const parts =
    key.split(".");

  let value =
    translations;

  for (const part of parts) {

    if (
      value === undefined ||
      value === null ||
      !Object.prototype.hasOwnProperty.call(
        value,
        part
      )
    ) {

      return null;

    }

    value =
      value[part];

  }

  return value;

}


/* =====================================================
   RTL ARABO
===================================================== */

function updateDirection() {

  document.documentElement.lang =
    currentLanguage;

  if (currentLanguage === "ar") {

    document.documentElement.dir =
      "rtl";

    document.body.classList.add(
      "arabic"
    );

  } else {

    document.documentElement.dir =
      "ltr";

    document.body.classList.remove(
      "arabic"
    );

  }

}


/* =====================================================
   PULSANTE LINGUA
===================================================== */

function updateLanguageButton() {

  const button =
    document.getElementById(
      "languageButton"
    );

  if (!button) return;

  const labels = {

    it: "🇮🇹 IT",

    en: "🇬🇧 EN",

    fr: "🇫🇷 FR",

    ar: "🇹🇳 AR"

  };

  button.textContent =
    labels[currentLanguage] ||
    "🌐";

}


/* =====================================================
   CAMBIO LINGUA
===================================================== */

function cycleLanguage() {

  const currentIndex =
    supportedLanguages.indexOf(
      currentLanguage
    );

  const nextIndex =
    (currentIndex + 1) %
    supportedLanguages.length;

  const nextLanguage =
    supportedLanguages[nextIndex];

  loadLanguage(
    nextLanguage
  );

}


/* =====================================================
   AVVIO
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadLanguage(
      currentLanguage
    );

  }
);
