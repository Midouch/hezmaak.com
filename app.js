const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let currentUser = null;

/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  await loadUser();

  createAuthModal();
  createTripModal();

  updateHeader();
  updateButtons();

  loadTrips();

  setupDarkMode();

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;

    updateHeader();
    updateButtons();
  });
});


/* =====================================================
   USER
===================================================== */

async function loadUser() {

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  currentUser = user || null;

  return currentUser;
}


/* =====================================================
   AUTH MODAL
===================================================== */

function createAuthModal() {

  if (document.getElementById("authModal")) return;

  const modal = document.createElement("div");

  modal.id = "authModal";

  modal.innerHTML = `
    <div class="auth-overlay">

      <div class="auth-box">

        <button class="auth-close"
          onclick="closeAuth()">×</button>

        <div id="loginView">

          <h2>Accedi a Waselni</h2>

          <p>
            Accedi per pubblicare viaggi e richieste.
          </p>

          <input
            id="loginEmail"
            type="email"
            placeholder="Email">

          <input
            id="loginPassword"
            type="password"
            placeholder="Password">

          <button
            class="primary auth-button"
            onclick="login()">

            Accedi

          </button>

          <p class="auth-switch">
            Non hai un account?

            <button onclick="showRegister()">
              Registrati
            </button>
          </p>

        </div>


        <div id="registerView"
             style="display:none">

          <h2>Crea il tuo account</h2>

          <p>
            Unisciti alla comunità Waselni.
          </p>

          <input
            id="registerName"
            type="text"
            placeholder="Nome e cognome">

          <input
            id="registerEmail"
            type="email"
            placeholder="Email">

          <input
            id="registerPassword"
            type="password"
            placeholder="Password">

          <select id="registerType">

            <option value="private">
              Privato
            </option>

            <option value="traveler">
              Viaggiatore
            </option>

            <option value="company">
              Azienda / Trasportatore
            </option>

          </select>

          <select id="registerCountry">

            <option value="italy">
              🇮🇹 Italia
            </option>

            <option value="tunisia">
              🇹🇳 Tunisia
            </option>

          </select>

          <button
            class="primary auth-button"
            onclick="register()">

            Crea account

          </button>

          <p class="auth-switch">

            Hai già un account?

            <button onclick="showLogin()">
              Accedi
            </button>

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

  const modal =
    document.getElementById("authModal");

  if (modal) {
    modal.style.display = "none";
  }
}


function showLogin() {

  document.getElementById("loginView")
    .style.display = "block";

  document.getElementById("registerView")
    .style.display = "none";

  clearAuthMessage();
}


function showRegister() {

  document.getElementById("loginView")
    .style.display = "none";

  document.getElementById("registerView")
    .style.display = "block";

  clearAuthMessage();
}


function showAuthMessage(message, error = false) {

  const element =
    document.getElementById("authMessage");

  if (!element) return;

  element.textContent = message;

  element.className =
    error ? "auth-error" : "auth-success";
}


function clearAuthMessage() {

  const element =
    document.getElementById("authMessage");

  if (element) {
    element.textContent = "";
    element.className = "";
  }
}


/* =====================================================
   REGISTER
===================================================== */

async function register() {

  const name =
    document.getElementById("registerName")
      .value.trim();

  const email =
    document.getElementById("registerEmail")
      .value.trim();

  const password =
    document.getElementById("registerPassword")
      .value;

  const userType =
    document.getElementById("registerType")
      .value;

  const country =
    document.getElementById("registerCountry")
      .value;


  if (!name || !email || !password) {

    showAuthMessage(
      "Compila tutti i campi.",
      true
    );

    return;
  }


  showAuthMessage(
    "Creazione account..."
  );


  const {
    data,
    error
  } =
    await supabaseClient.auth.signUp({

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

    showAuthMessage(
      error.message,
      true
    );

    return;
  }


  /*
    Creiamo il profilo solo se
    abbiamo effettivamente un utente.
  */

  if (data.user) {

    const {
      error: profileError
    } =
      await supabaseClient
        .from("profiles")
        .upsert({

          id: data.user.id,

          full_name: name,

          country: country,

          user_type: userType

        });


    if (profileError) {

      console.error(
        "Profile error:",
        profileError
      );

    }

  }


  showAuthMessage(
    "Account creato. Controlla la tua email per confermare l'account."
  );
}


/* =====================================================
   LOGIN
===================================================== */

async function login() {

  const email =
    document.getElementById("loginEmail")
      .value.trim();

  const password =
    document.getElementById("loginPassword")
      .value;


  if (!email || !password) {

    showAuthMessage(
      "Inserisci email e password.",
      true
    );

    return;
  }


  showAuthMessage(
    "Accesso in corso..."
  );


  const {
    error
  } =
    await supabaseClient.auth
      .signInWithPassword({

        email,
        password

      });


  if (error) {

    showAuthMessage(
      error.message,
      true
    );

    return;
  }


  await loadUser();

  closeAuth();

  updateHeader();

  updateButtons();

  loadTrips();
}


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

  await supabaseClient.auth.signOut();

  currentUser = null;

  updateHeader();

  updateButtons();

  loadTrips();
}


/* =====================================================
   HEADER
===================================================== */

function updateHeader() {

  const nav =
    document.querySelector("nav");

  if (!nav) return;


  const existing =
    document.getElementById("authButton");

  if (existing) {
    existing.remove();
  }


  const button =
    document.createElement("button");

  button.id = "authButton";

  button.className = "primary";


  if (currentUser) {

    button.textContent =
      "👤 Il mio account";

    button.onclick =
      showProfile;

  } else {

    button.textContent =
      "Accedi / Registrati";

    button.onclick =
      () => openAuth("login");

  }


  nav.appendChild(button);
}


/* =====================================================
   BUTTONS
===================================================== */

function updateButtons() {

  const buttons =
    document.querySelectorAll(
      ".hero-buttons button"
    );


  if (buttons.length >= 2) {

    buttons[0].onclick =
      () => openTripModal();

    buttons[1].onclick =
      () => openTripModal();

  }


  document
    .querySelectorAll(
      ".full-button"
    )
    .forEach(button => {

      button.onclick =
        () => openTripModal();

    });
}


/* =====================================================
   TRIP MODAL
===================================================== */

function createTripModal() {

  if (document.getElementById("tripModal"))
    return;


  const modal =
    document.createElement("div");

  modal.id = "tripModal";


  modal.innerHTML = `

    <div class="auth-overlay">

      <div class="auth-box">

        <button
          class="auth-close"
          onclick="closeTripModal()">

          ×

        </button>


        <h2>✈️ Pubblica un viaggio</h2>

        <p>
          Indica lo spazio disponibile
          nel tuo viaggio.
        </p>


        <label>Paese di partenza</label>

        <select id="tripDepartureCountry">

          <option value="italy">
            🇮🇹 Italia
          </option>

          <option value="tunisia">
            🇹🇳 Tunisia
          </option>

        </select>


        <label>Paese di arrivo</label>

        <select id="tripArrivalCountry">

          <option value="tunisia">
            🇹🇳 Tunisia
          </option>

          <option value="italy">
            🇮🇹 Italia
          </option>

        </select>


        <input
          id="tripDepartureCity"
          type="text"
          placeholder="Città di partenza">


        <input
          id="tripArrivalCity"
          type="text"
          placeholder="Città di arrivo">


        <label>Data del viaggio</label>

        <input
          id="tripDate"
          type="date">


        <input
          id="tripKg"
          type="number"
          min="0.1"
          step="0.1"
          placeholder="Kg disponibili">


        <input
          id="tripPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="Prezzo € / kg">


        <textarea
          id="tripDescription"
          rows="4"
          placeholder="Descrizione del viaggio">
        </textarea>


        <button
          class="primary auth-button"
          onclick="publishTrip()">

          Pubblica viaggio

        </button>


        <div id="tripMessage"></div>

      </div>

    </div>
  `;


  document.body.appendChild(modal);
}


function openTripModal() {

  if (!currentUser) {

    openAuth("login");

    return;
  }


  document
    .getElementById("tripModal")
    .style.display = "block";
}


function closeTripModal() {

  const modal =
    document.getElementById("tripModal");

  if (modal) {
    modal.style.display = "none";
  }
}


/* =====================================================
   PUBLISH TRIP
===================================================== */

async function publishTrip() {

  if (!currentUser) {

    openAuth("login");

    return;
  }


  const departureCountry =
    document.getElementById(
      "tripDepartureCountry"
    ).value;


  const arrivalCountry =
    document.getElementById(
      "tripArrivalCountry"
    ).value;


  const departureCity =
    document.getElementById(
      "tripDepartureCity"
    ).value.trim();


  const arrivalCity =
    document.getElementById(
      "tripArrivalCity"
    ).value.trim();


  const travelDate =
    document.getElementById(
      "tripDate"
    ).value;


  const kg =
    parseFloat(
      document.getElementById(
        "tripKg"
      ).value
    );


  const price =
    parseFloat(
      document.getElementById(
        "tripPrice"
      ).value
    );


  const description =
    document.getElementById(
      "tripDescription"
    ).value.trim();


  const message =
    document.getElementById(
      "tripMessage"
    );


  if (
    !departureCity ||
    !arrivalCity ||
    !travelDate ||
    !kg
  ) {

    message.textContent =
      "Compila tutti i campi obbligatori.";

    message.className =
      "auth-error";

    return;
  }


  if (
    departureCountry ===
    arrivalCountry
  ) {

    message.textContent =
      "Partenza e arrivo devono essere in paesi diversi.";

    message.className =
      "auth-error";

    return;
  }


  message.textContent =
    "Pubblicazione in corso...";


  const {
    error
  } =
    await supabaseClient
      .from("trips")
      .insert({

        user_id:
          currentUser.id,

        departure_country:
          departureCountry,

        arrival_country:
          arrivalCountry,

        departure_city:
          departureCity,

        arrival_city:
          arrivalCity,

        travel_date:
          travelDate,

        available_kg:
          kg,

        price_per_kg:
          price || null,

        description:
          description,

        status:
          "active"

      });


  if (error) {

    console.error(error);

    message.textContent =
      error.message;

    message.className =
      "auth-error";

    return;
  }


  message.textContent =
    "✓ Viaggio pubblicato!";


  message.className =
    "auth-success";


  setTimeout(() => {

    closeTripModal();

    loadTrips();

  }, 1000);
}


/* =====================================================
   LOAD TRIPS
===================================================== */

async function loadTrips() {

  const container =
    document.querySelector(".cards");

  if (!container) return;


  container.innerHTML = `
    <div class="loading">
      Caricamento viaggi...
    </div>
  `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("trips")
      .select(`
        *,
        profiles (
          full_name,
          is_verified,
          rating,
          reviews_count,
          user_type
        )
      `)
      .eq("status", "active")
      .order(
        "travel_date",
        { ascending: true }
      );


  if (error) {

    console.error(error);

    container.innerHTML = `
      <div class="loading">
        Impossibile caricare i viaggi.
      </div>
    `;

    return;
  }


  if (!data || data.length === 0) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          ✈️
        </div>

        <h3>
          Nessun viaggio disponibile
        </h3>

        <p>
          Sii il primo a pubblicare
          un viaggio.
        </p>

        <button
          class="primary"
          onclick="openTripModal()">

          Pubblica un viaggio

        </button>

      </div>
    `;

    return;
  }


  container.innerHTML =
    data.map(
      createTripCard
    ).join("");


  document
    .querySelectorAll(
      ".trip-contact"
    )
    .forEach(button => {

      button.onclick = () => {

        const userId =
          button.dataset.user;

        contactTraveler(userId);

      };

    });
}


/* =====================================================
   TRIP CARD
===================================================== */

function createTripCard(trip) {

  const profile =
    trip.profiles || {};


  const verified =
    profile.is_verified
      ? "✓"
      : "";


  const type =
    profile.user_type ===
    "company"
      ? "🚚 Azienda"
      : profile.user_type ===
        "traveler"
        ? "✈️ Viaggiatore"
        : "👤 Privato";


  const date =
    new Date(
      trip.travel_date +
      "T12:00:00"
    ).toLocaleDateString(
      "it-IT",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );


  return `

    <article class="card trip-card">

      <div class="avatar">
        ✈️
      </div>


      <h3>
        ${escapeHtml(
          profile.full_name ||
          "Utente Waselni"
        )}

        ${
          verified
            ? `<span class="verified">
                ${verified}
               </span>`
            : ""
        }

      </h3>


      <small>
        ${type}
      </small>


      <p>
        🇮🇹
        ${countryFlag(
          trip.departure_country
        )}
        ${escapeHtml(
          trip.departure_city
        )}

        →

        ${countryFlag(
          trip.arrival_country
        )}
        ${escapeHtml(
          trip.arrival_city
        )}
      </p>


      <p>
        📅 ${date}
      </p>


      <p>
        📦 ${trip.available_kg} kg disponibili
      </p>


      ${
        trip.price_per_kg
          ? `<strong>
              €${trip.price_per_kg} / kg
             </strong>`
          : `<strong>
              Prezzo da concordare
             </strong>`
      }


      ${
        trip.description
          ? `<p class="trip-description">
              ${escapeHtml(
                trip.description
              )}
             </p>`
          : ""
      }


      ${
        currentUser &&
        currentUser.id !== trip.user_id

          ? `<button
              class="primary trip-contact"
              data-user="${trip.user_id}">

              Contatta

             </button>`

          : currentUser &&
            currentUser.id === trip.user_id

            ? `<button
                class="secondary"
                disabled>

                Il tuo viaggio

               </button>`

            : `<button
                class="primary"
                onclick="openAuth()">

                Accedi per contattare

               </button>`
      }

    </article>

  `;
}


/* =====================================================
   CONTACT
===================================================== */

function contactTraveler(userId) {

  if (!currentUser) {

    openAuth();

    return;
  }


  alert(
    "La chat sarà attivata nel prossimo modulo. " +
    "Abbiamo già identificato il viaggiatore: " +
    userId
  );
}


/* =====================================================
   HELPERS
===================================================== */

function countryFlag(country) {

  if (country === "italy")
    return "🇮🇹";

  if (country === "tunisia")
    return "🇹🇳";

  return "🌍";
}


function escapeHtml(value) {

  if (!value) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =====================================================
   DARK MODE
===================================================== */

function setupDarkMode() {

  const button =
    document.getElementById(
      "darkMode"
    );

  if (!button) return;


  if (
    localStorage.getItem(
      "darkMode"
    ) === "true"
  ) {

    document.body
      .classList
      .add("dark");

  }


  button.onclick = () => {

    document.body
      .classList
      .toggle("dark");


    localStorage.setItem(
      "darkMode",
      document.body.classList
        .contains("dark")
    );

  };
}
