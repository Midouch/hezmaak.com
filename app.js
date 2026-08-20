const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let currentUser = null;

/* =========================
   ELEMENTI UI
========================= */

function createAuthModal() {
  if (document.getElementById("authModal")) return;

  const modal = document.createElement("div");
  modal.id = "authModal";

  modal.innerHTML = `
    <div class="auth-overlay">
      <div class="auth-box">
        <button class="auth-close" onclick="closeAuth()">×</button>

        <div id="loginView">
          <h2>Accedi a Waselni</h2>
          <p>Accedi per pubblicare viaggi e richieste.</p>

          <input id="loginEmail" type="email" placeholder="Email">
          <input id="loginPassword" type="password" placeholder="Password">

          <button class="primary auth-button" onclick="login()">
            Accedi
          </button>

          <p class="auth-switch">
            Non hai un account?
            <button onclick="showRegister()">Registrati</button>
          </p>
        </div>

        <div id="registerView" style="display:none">
          <h2>Crea il tuo account</h2>
          <p>Unisciti alla comunità Waselni.</p>

          <input id="registerName" type="text" placeholder="Nome e cognome">

          <input id="registerEmail" type="email" placeholder="Email">

          <input id="registerPassword" type="password"
                 placeholder="Password (minimo 6 caratteri)">

          <select id="registerType">
            <option value="private">Privato</option>
            <option value="traveler">Viaggiatore</option>
            <option value="company">Azienda / Trasportatore</option>
          </select>

          <select id="registerCountry">
            <option value="italy">🇮🇹 Italia</option>
            <option value="tunisia">🇹🇳 Tunisia</option>
          </select>

          <button class="primary auth-button" onclick="register()">
            Crea account
          </button>

          <p class="auth-switch">
            Hai già un account?
            <button onclick="showLogin()">Accedi</button>
          </p>
        </div>

        <div id="authMessage"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function openAuth(mode = "login") {
  createAuthModal();

  document.getElementById("authModal").style.display = "block";

  if (mode === "register") {
    showRegister();
  } else {
    showLogin();
  }
}

function closeAuth() {
  const modal = document.getElementById("authModal");

  if (modal) {
    modal.style.display = "none";
  }
}

function showLogin() {
  document.getElementById("loginView").style.display = "block";
  document.getElementById("registerView").style.display = "none";
  clearMessage();
}

function showRegister() {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("registerView").style.display = "block";
  clearMessage();
}

function showMessage(message, error = false) {
  const element = document.getElementById("authMessage");

  if (!element) return;

  element.textContent = message;
  element.className = error ? "auth-error" : "auth-success";
}

function clearMessage() {
  const element = document.getElementById("authMessage");

  if (element) {
    element.textContent = "";
    element.className = "";
  }
}

/* =========================
   REGISTRAZIONE
========================= */

async function register() {
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const userType = document.getElementById("registerType").value;
  const country = document.getElementById("registerCountry").value;

  if (!name || !email || !password) {
    showMessage("Compila tutti i campi.", true);
    return;
  }

  if (password.length < 6) {
    showMessage("La password deve avere almeno 6 caratteri.", true);
    return;
  }

  showMessage("Creazione account...");

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        user_type: userType,
        country: country
      }
    }
  });

  if (error) {
    showMessage(error.message, true);
    return;
  }

  if (data.user) {
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .insert({
        id: data.user.id,
        full_name: name,
        country: country,
        user_type: userType
      });

    if (profileError) {
      console.error(profileError);
    }
  }

  showMessage(
    "Account creato! Controlla la tua email per confermare l'indirizzo."
  );
}

/* =========================
   LOGIN
========================= */

async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showMessage("Inserisci email e password.", true);
    return;
  }

  showMessage("Accesso in corso...");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showMessage(error.message, true);
    return;
  }

  closeAuth();

  await loadUser();

  updateHeader();
}

/* =========================
   LOGOUT
========================= */

async function logout() {
  await supabaseClient.auth.signOut();

  currentUser = null;

  updateHeader();

  alert("Sei uscito dal tuo account.");
}

/* =========================
   UTENTE
========================= */

async function loadUser() {
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  currentUser = user || null;

  return currentUser;
}

/* =========================
   HEADER
========================= */

function updateHeader() {
  const nav = document.querySelector("nav");

  if (!nav) return;

  const oldAuth = document.getElementById("authButton");

  if (oldAuth) {
    oldAuth.remove();
  }

  const button = document.createElement("button");

  button.id = "authButton";
  button.className = "primary";

  if (currentUser) {
    button.textContent = "👤 Il mio profilo";
    button.onclick = showProfile;
  } else {
    button.textContent = "Accedi / Registrati";
    button.onclick = () => openAuth("login");
  }

  nav.appendChild(button);
}

/* =========================
   PROFILO
========================= */

async function showProfile() {
  if (!currentUser) {
    openAuth();
    return;
  }

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (error) {
    alert("Impossibile caricare il profilo.");
    return;
  }

  const verified = profile.is_verified
    ? "✓ Verificato"
    : "○ Non verificato";

  alert(
    `👤 ${profile.full_name}\n\n` +
    `Tipo: ${profile.user_type}\n` +
    `Paese: ${profile.country}\n` +
    `Stato: ${verified}\n` +
    `⭐ ${profile.rating || 0} (${profile.reviews_count || 0} recensioni)`
  );

  if (confirm("Vuoi uscire dal tuo account?")) {
    logout();
  }
}

/* =========================
   EVENTI
========================= */

document.addEventListener("DOMContentLoaded", async () => {

  createAuthModal();

  await loadUser();

  updateHeader();

  const darkModeButton = document.getElementById("darkMode");

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  if (darkModeButton) {
    darkModeButton.addEventListener("click", () => {
      document.body.classList.toggle("dark");

      localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
      );
    });
  }

  document.querySelectorAll(".primary").forEach(button => {

    if (
      button.id === "authButton" ||
      button.classList.contains("auth-button")
    ) {
      return;
    }

    button.addEventListener("click", () => {

      if (!currentUser) {
        openAuth("login");
        return;
      }

      alert(
        "Questa funzione sarà collegata al marketplace nel prossimo aggiornamento."
      );

    });

  });

});

/* =========================
   SESSIONE
========================= */

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    currentUser = session?.user || null;

    updateHeader();

  }
);
