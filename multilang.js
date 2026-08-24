function detectLanguage() {
  const browserLang = navigator.language.slice(0, 2);
  return translations[browserLang] ? browserLang : "it";
}

function applyRTL(lang) {
  if (lang === "ar" || lang === "tn") {
    document.body.setAttribute("dir", "rtl");
  } else {
    document.body.setAttribute("dir", "ltr");
  }
}

function applyLanguage(lang) {
  const t = translations[lang];

  for (const key in t) {
    const el = document.getElementById(key);
    if (el) el.innerText = t[key];
  }

  applyRTL(lang);
  localStorage.setItem("hezmaak_lang", lang);
}

const langOrder = ["it", "tn", "ar", "fr", "en"];

function cycleLanguage() {
  const current = localStorage.getItem("hezmaak_lang") || detectLanguage();
  const next = langOrder[(langOrder.indexOf(current) + 1) % langOrder.length];
  applyLanguage(next);

  document.getElementById("languageButton").innerText =
    next === "it" ? "🇮🇹" :
    next === "tn" ? "🇹🇳" :
    next === "ar" ? "🇸🇦" :
    next === "fr" ? "🇫🇷" :
    "🇬🇧";
}

window.onload = () => {
  const saved = localStorage.getItem("hezmaak_lang");
  const lang = saved || detectLanguage();
  applyLanguage(lang);
};
