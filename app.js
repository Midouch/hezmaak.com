const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

let currentUser = null;


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await loadUser();

    createAuthModal();

    createTripModal();

    createRequestModal();

    updateHeader();

    setupActions();

    loadTrips();

    loadRequests();

  }
);


/* =====================================================
   USER
===================================================== */

async function loadUser() {

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  currentUser = user || null;
  updateAdminButton();
}


/* =====================================================
   HEADER
===================================================== */

function updateHeader() {

  const button =
    document.getElementById(
      "authButton"
    );

  if (!button) return;


  if (currentUser) {

    button.textContent =
      "👤 Il mio profilo";

    button.onclick =
      showProfile;

  } else {

    button.textContent =
      "Accedi / Registrati";

    button.onclick =
      () => openAuth("login");

  }

}


/* =====================================================
   ACTIONS
===================================================== */

function setupActions() {

  document
    .querySelectorAll(
      '[data-action="publish-trip"]'
    )
    .forEach(button => {

      button.onclick = event => {

        event.preventDefault();

        if (!currentUser) {

          openAuth("login");

          return;
        }

        openTripModal();

      };

    });


  document
    .querySelectorAll(
      '[data-action="publish-request"]'
    )
    .forEach(button => {

      button.onclick = event => {

        event.preventDefault();

        if (!currentUser) {

          openAuth("login");

          return;
        }

        openRequestModal();

      };

    });

}


/* =====================================================
   AUTH
===================================================== */

function createAuthModal() {

  if (
    document.getElementById(
      "authModal"
    )
  ) return;


  const modal =
    document.createElement(
      "div"
    );

  modal.id = "authModal";


  modal.innerHTML = `

    <div class="auth-overlay">

      <div class="auth-box">

        <button
          class="auth-close"
          onclick="closeAuth()">

          ×

        </button>


        <div id="loginView">

          <h2>
            Accedi a Waselni
          </h2>

          <p>
            Accedi al tuo account.
          </p>


          <input
            id="loginEmail"
            type="email"
            placeholder="Email"
          >


          <input
            id="loginPassword"
            type="password"
            placeholder="Password"
          >


          <button
            class="primary auth-button"
            onclick="login()">

            Accedi

          </button>


          <p class="auth-switch">

            Non hai un account?

            <button
              onclick="showRegister()">

              Registrati

            </button>

          </p>

        </div>


        <div
          id="registerView"
          style="display:none"
        >

          <h2>
            Crea account
          </h2>

          <p>
            Entra nella comunità Waselni.
          </p>


          <input
            id="registerName"
            type="text"
            placeholder="Nome e cognome"
          >


          <input
            id="registerEmail"
            type="email"
            placeholder="Email"
          >


          <input
            id="registerPassword"
            type="password"
            placeholder="Password"
          >


          <select id="registerType">

            <option value="private">
              👤 Privato
            </option>

            <option value="traveler">
              ✈️ Viaggiatore
            </option>

            <option value="company">
              🚚 Azienda / Trasportatore
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

            Registrati

          </button>


          <p class="auth-switch">

            Hai già un account?

            <button
              onclick="showLogin()">

              Accedi

            </button>

          </p>

        </div>


        <div id="authMessage"></div>

      </div>

    </div>
  `;


  document.body.appendChild(
    modal
  );

}


function openAuth(
  mode = "login"
) {

  document
    .getElementById("authModal")
    .style.display = "block";


  if (mode === "register") {

    showRegister();

  } else {

    showLogin();

  }

}


function closeAuth() {

  document
    .getElementById("authModal")
    .style.display = "none";

}


function showLogin() {

  document
    .getElementById("loginView")
    .style.display = "block";

  document
    .getElementById("registerView")
    .style.display = "none";

  clearMessage();

}


function showRegister() {

  document
    .getElementById("loginView")
    .style.display = "none";

  document
    .getElementById("registerView")
    .style.display = "block";

  clearMessage();

}


function showMessage(
  text,
  error = false
) {

  const element =
    document.getElementById(
      "authMessage"
    );

  element.textContent = text;

  element.className =
    error
      ? "auth-error"
      : "auth-success";

}


function clearMessage() {

  const element =
    document.getElementById(
      "authMessage"
    );

  element.textContent = "";

  element.className = "";

}


/* =====================================================
   REGISTER
===================================================== */

async function register() {

  const name =
    document.getElementById(
      "registerName"
    ).value.trim();

  const email =
    document.getElementById(
      "registerEmail"
    ).value.trim();

  const password =
    document.getElementById(
      "registerPassword"
    ).value;

  const type =
    document.getElementById(
      "registerType"
    ).value;

  const country =
    document.getElementById(
      "registerCountry"
    ).value;


  if (
    !name ||
    !email ||
    !password
  ) {

    showMessage(
      "Compila tutti i campi.",
      true
    );

    return;

  }


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
          user_type: type,
          country: country
        }

      }

    });


  if (error) {

    showMessage(
      error.message,
      true
    );

    return;

  }


  if (data.user) {

    await supabaseClient
      .from("profiles")
      .upsert({

        id: data.user.id,

        full_name: name,

        country: country,

        user_type: type

      });

  }


  showMessage(
    "Account creato. Controlla la tua email per confermare l'account."
  );

}


/* =====================================================
   LOGIN
===================================================== */

async function login() {

  const email =
    document.getElementById(
      "loginEmail"
    ).value.trim();

  const password =
    document.getElementById(
      "loginPassword"
    ).value;


  const {
    error
  } =
    await supabaseClient.auth
      .signInWithPassword({

        email,
        password

      });


  if (error) {

    showMessage(
      error.message,
      true
    );

    return;

  }

await loadUser();

closeAuth();

updateHeader();

setupActions();

loadTrips();

loadRequests();
}


/* =====================================================
   PROFILE
===================================================== */


async function showProfile() {

  if (!currentUser) {
    openAuth("login");
    return;
  }

  const {
    data: profile,
    error
  } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (error) {
    console.error(error);

    alert(
      "Errore caricamento profilo: " +
      error.message
    );

    return;
  }

  const existing =
    document.getElementById("profilePage");

  if (existing) {
    existing.remove();
  }

  const name =
    profile.full_name ||
    "Utente Waselni";

  const country =
    profile.country === "tunisia"
      ? "🇹🇳 Tunisia"
      : "🇮🇹 Italia";

  const type =
    profile.user_type === "company"
      ? "🚚 Azienda / Trasportatore"
      : profile.user_type === "traveler"
      ? "✈️ Viaggiatore"
      : "👤 Privato";

  const verified =
    profile.is_verified === true;

  const rating =
    Number(profile.rating || 0).toFixed(1);

  const reviews =
    profile.reviews_count || 0;

  const page =
    document.createElement("div");

  page.id = "profilePage";

  page.innerHTML = `

    <div class="profile-page">

      <div class="container">

        <button
          class="back-button"
          onclick="closeProfilePage()">

          ← Torna a Waselni

        </button>


        <div class="profile-layout">


          <!-- SIDEBAR -->

          <aside class="profile-sidebar">

            <div class="profile-avatar">
              👤
            </div>

            <h2>
              ${escapeHtml(name)}
            </h2>

            <p class="profile-email">
              ${escapeHtml(
                currentUser.email || ""
              )}
            </p>

            <div class="profile-badge
              ${verified
                ? "verified-profile"
                : "not-verified"}">

              ${
                verified
                  ? "✓ Profilo verificato"
                  : "○ Profilo non verificato"
              }

            </div>

            <div class="profile-rating">

              <strong>
                ⭐ ${rating}
              </strong>

              <span>
                ${reviews} recensioni
              </span>

            </div>


            <button
              class="primary profile-action"
              onclick="closeProfilePage(); openTripModal();">

              ✈️ Pubblica viaggio

            </button>


            <button
              class="secondary profile-action"
              onclick="closeProfilePage(); openRequestModal();">

              📦 Pubblica richiesta

            </button>


            <button
              class="logout-button"
              onclick="logout();">

              🚪 Esci

            </button>

          </aside>


          <!-- MAIN -->

          <main class="profile-main">

            <div class="profile-header">

              <div>

                <span class="section-label">
                  IL MIO PROFILO
                </span>

                <h1>
                  Ciao, ${escapeHtml(name)} 👋
                </h1>

                <p>
                  Gestisci il tuo account Waselni.
                </p>

              </div>

            </div>


            <!-- INFO -->

            <section class="profile-card">

              <div class="profile-card-title">

                <h3>
                  Informazioni personali
                </h3>

                <button
                  class="small-button"
                  onclick="editProfile()">

                  Modifica

                </button>

              </div>


              <div class="profile-info-grid">

                <div>

                  <span>
                    Nome
                  </span>

                  <strong>
                    ${escapeHtml(name)}
                  </strong>

                </div>


                <div>

                  <span>
                    Email
                  </span>

                  <strong>
                    ${escapeHtml(
                      currentUser.email || "-"
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Paese
                  </span>

                  <strong>
                    ${country}
                  </strong>

                </div>


                <div>

                  <span>
                    Tipo account
                  </span>

                  <strong>
                    ${type}
                  </strong>

                </div>

              </div>

            </section>


            <!-- VERIFICATION -->

            <section class="profile-card verification-card">

              <div>

                <span class="section-label">
                  SICUREZZA
                </span>

                <h3>
                  🪪 Verifica la tua identità
                </h3>

                ${
                  verified

                    ? `

                      <p class="success-text">

                        ✓ La tua identità è stata verificata.

                      </p>

                    `

                    : `

                      <p>

                        Verifica la tua identità per ottenere
                        il badge ✓ e aumentare la fiducia
                        degli altri utenti.

                      </p>

                    `
                }

              </div>


              ${
                verified

                  ? `

                    <div class="verification-status">

                      ✓ VERIFICATO

                    </div>

                  `

                  : `

                    <button
                      class="primary"
                      onclick="openVerification()">

                      🪪 Verifica identità

                    </button>

                  `
              }

            </section>


            <!-- MY ACTIVITY -->

            <section class="profile-card">

              <h3>
                La mia attività
              </h3>


              <div class="profile-menu-grid">

                <button
                  onclick="showMyTrips()">

                  <span>✈️</span>

                  <strong>
                    I miei viaggi
                  </strong>

                  <small>
                    Gestisci i tuoi viaggi
                  </small>

                </button>


                <button
                  onclick="showMyRequests()">

                  <span>📦</span>

                  <strong>
                    Le mie richieste
                  </strong>

                  <small>
                    Gestisci le tue richieste
                  </small>

                </button>


                <button
                  onclick="showMyReviews()">

                  <span>⭐</span>

                  <strong>
                    Le mie recensioni
                  </strong>

                  <small>
                    Visualizza le valutazioni
                  </small>

                </button>


                <button
                  onclick="openVerification()">

                  <span>🪪</span>

                  <strong>
                    Verifica identità
                  </strong>

                  <small>
                    Stato della verifica
                  </small>

                </button>

              </div>

            </section>

          </main>

        </div>

      </div>

    </div>

  `;

  document.body.appendChild(page);

  document.body.style.overflow = "hidden";

}


function closeProfilePage() {

  const page =
    document.getElementById(
      "profilePage"
    );

  if (page) {
    page.remove();
  }

  document.body.style.overflow = "";

}
/*==========================LOG OUT ==================================
async function logout() {

  const {
    error
  } = await supabaseClient.auth.signOut();

  if (error) {

    alert(
      "Errore durante il logout: " +
      error.message
    );

    return;
  }

  currentUser = null;

  const profileModal =
    document.getElementById(
      "profileModal"
    );

  if (profileModal) {
    profileModal.remove();
  }

  updateHeader();

  setupActions();

}
/* =====================================================
   TRIP MODAL
===================================================== */

function createTripModal() {

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "tripModal";


  modal.innerHTML = `

    <div class="auth-overlay">

      <div class="auth-box">

        <button
          class="auth-close"
          onclick="closeTripModal()">

          ×

        </button>


        <h2>
          ✈️ Pubblica viaggio
        </h2>

        <p>
          Indica il tuo viaggio.
        </p>


        <label>
          Partenza
        </label>

        <select
          id="tripDepartureCountry">

          <option value="italy">
            🇮🇹 Italia
          </option>

          <option value="tunisia">
            🇹🇳 Tunisia
          </option>

        </select>


        <label>
          Arrivo
        </label>

        <select
          id="tripArrivalCountry">

          <option value="tunisia">
            🇹🇳 Tunisia
          </option>

          <option value="italy">
            🇮🇹 Italia
          </option>

        </select>


        <input
          id="tripDepartureCity"
          placeholder="Città di partenza"
        >


        <input
          id="tripArrivalCity"
          placeholder="Città di arrivo"
        >


        <input
          id="tripDate"
          type="date"
        >


        <input
          id="tripKg"
          type="number"
          min="0.1"
          step="0.1"
          placeholder="Kg disponibili"
        >


        <input
          id="tripPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="Prezzo €/kg"
        >


        <textarea
          id="tripDescription"
          rows="4"
          placeholder="Descrizione"
        ></textarea>
      <label>
  📄 Biglietto del volo
</label>

<input
  id="travelTicket"
  type="file"
  accept=".jpg,.jpeg,.png,.pdf"
  required
>

<small class="upload-help">
  Carica una foto, screenshot o PDF del biglietto.
  Il biglietto è privato e sarà visibile solo
  all'amministratore per la verifica.
  Massimo 10 MB.
</small>

        <button
          class="primary auth-button"
          onclick="publishTrip()">

          Pubblica viaggio

        </button>


        <div id="tripMessage"></div>

      </div>

    </div>
  `;


  document.body.appendChild(
    modal
  );

}


function openTripModal() {

  document
    .getElementById("tripModal")
    .style.display = "block";

}


function closeTripModal() {

  document
    .getElementById("tripModal")
    .style.display = "none";

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

  const date =
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
    ) || null;

  const description =
    document.getElementById(
      "tripDescription"
    ).value.trim();

  const ticketInput =
    document.getElementById(
      "travelTicket"
    );

  const message =
    document.getElementById(
      "tripMessage"
    );

  if (
    !departureCity ||
    !arrivalCity ||
    !date ||
    !kg
  ) {

    message.textContent =
      "Compila tutti i campi obbligatori.";

    message.className =
      "auth-error";

    return;
  }

  if (
    departureCountry === arrivalCountry
  ) {

    message.textContent =
      "Partenza e arrivo devono essere in paesi diversi.";

    message.className =
      "auth-error";

    return;
  }

  if (
    !ticketInput ||
    !ticketInput.files ||
    !ticketInput.files.length
  ) {

    message.textContent =
      "Devi caricare il biglietto del volo.";

    message.className =
      "auth-error";

    return;
  }

  const ticketFile =
    ticketInput.files[0];

  const maxSize =
    10 * 1024 * 1024;

  if (ticketFile.size > maxSize) {

    message.textContent =
      "Il biglietto supera il limite di 10 MB.";

    message.className =
      "auth-error";

    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf"
  ];

  if (
    !allowedTypes.includes(
      ticketFile.type
    )
  ) {

    message.textContent =
      "Formato non supportato. Usa JPG, PNG o PDF.";

    message.className =
      "auth-error";

    return;
  }

  message.textContent =
    "Caricamento biglietto...";

  message.className =
    "auth-success";

  const extension =
    ticketFile.name
      .split(".")
      .pop()
      .toLowerCase();

  const ticketPath =
    `${currentUser.id}/ticket-${Date.now()}.${extension}`;

  const {
    error: uploadError
  } = await supabaseClient
    .storage
    .from("travel-tickets")
    .upload(
      ticketPath,
      ticketFile,
      {
        upsert: false
      }
    );

  if (uploadError) {

    console.error(uploadError);

    message.textContent =
      "Errore caricamento biglietto: " +
      uploadError.message;

    message.className =
      "auth-error";

    return;
  }

  message.textContent =
    "Pubblicazione viaggio...";

  const {
    error: tripError
  } = await supabaseClient
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
        date,

      available_kg:
        kg,

      price_per_kg:
        price,

      description:
        description,

      ticket_path:
        ticketPath,

      verification_status:
        "pending",

      status:
        "active"

    });

  if (tripError) {

    console.error(tripError);

    await supabaseClient
      .storage
      .from("travel-tickets")
      .remove([
        ticketPath
      ]);

    message.textContent =
      "Errore pubblicazione viaggio: " +
      tripError.message;

    message.className =
      "auth-error";

    return;
  }

  message.textContent =
    "✓ Viaggio pubblicato e biglietto inviato per verifica.";

  message.className =
    "auth-success";

  setTimeout(
    () => {

      closeTripModal();
      loadTrips();

    },
    1000
  );
}


/* =====================================================
   LOAD TRIPS
===================================================== */

async function loadTrips() {

  const container =
    document.getElementById(
      "tripsContainer"
    );

  if (!container) return;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("trips")
      .select(`
        *,
        profiles(
          full_name,
          is_verified,
          rating,
          user_type
        )
      `)
      .eq(
        "status",
        "active"
      )
      .order(
        "travel_date",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(error);

    container.innerHTML =
      `<div class="loading">
        Errore nel caricamento.
      </div>`;

    return;

  }


  if (!data.length) {

    container.innerHTML =
      `<div class="empty-state">

        <h3>
          ✈️ Nessun viaggio disponibile
        </h3>

        <p>
          Pubblica il primo viaggio.
        </p>

      </div>`;

    return;

  }


  container.innerHTML =
    data
      .map(
        tripCard
      )
      .join("");

}


function tripCard(trip) {

  const profile =
    trip.profiles || {};


  const date =
    new Date(
      trip.travel_date +
      "T12:00:00"
    )
    .toLocaleDateString(
      "it-IT"
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
          profile.is_verified
            ? `<span class="verified">
                ✓ Verificato
               </span>`
            : ""
        }

      </h3>


      <p>

        ${flag(
          trip.departure_country
        )}

        ${escapeHtml(
          trip.departure_city
        )}

        →

        ${flag(
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
        📦 ${trip.available_kg} kg
      </p>


      ${
        trip.price_per_kg
          ? `<strong>
              €${trip.price_per_kg}/kg
             </strong>`
          : ""
      }


      ${
        trip.description
          ? `<p>
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
            class="primary"
            onclick="contactUser('${trip.user_id}')">

            Contatta

           </button>`

        : ""

      }

    </article>

  `;

}


/* =====================================================
   REQUEST MODAL
===================================================== */

function createRequestModal() {

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "requestModal";


  modal.innerHTML = `

    <div class="auth-overlay">

      <div class="auth-box">

        <button
          class="auth-close"
          onclick="closeRequestModal()">

          ×

        </button>


        <h2>
          📦 Pubblica richiesta
        </h2>


        <select
          id="requestDeparture">

          <option value="tunisia">
            🇹🇳 Tunisia
          </option>

          <option value="italy">
            🇮🇹 Italia
          </option>

        </select>


        <select
          id="requestArrival">

          <option value="italy">
            🇮🇹 Italia
          </option>

          <option value="tunisia">
            🇹🇳 Tunisia
          </option>

        </select>


        <input
          id="requestDepartureCity"
          placeholder="Città di partenza"
        >


        <input
          id="requestArrivalCity"
          placeholder="Città di arrivo"
        >


        <input
          id="requestDate"
          type="date"
        >


        <textarea
          id="requestDescription"
          rows="4"
          placeholder="Cosa vuoi trasportare?"
        ></textarea>


        <input
          id="requestWeight"
          type="number"
          placeholder="Peso kg"
        >


        <input
          id="requestBudget"
          type="number"
          placeholder="Budget €"
        >


        <button
          class="primary auth-button"
          onclick="publishRequest()">

          Pubblica richiesta

        </button>


        <div id="requestMessage"></div>

      </div>

    </div>
  `;


  document.body.appendChild(
    modal
  );

}


function openRequestModal() {

  document
    .getElementById(
      "requestModal"
    )
    .style.display =
    "block";

}


function closeRequestModal() {

  document
    .getElementById(
      "requestModal"
    )
    .style.display =
    "none";

}


/* =====================================================
   PUBLISH REQUEST
===================================================== */

async function publishRequest() {

  const departure =
    document.getElementById(
      "requestDeparture"
    ).value;

  const arrival =
    document.getElementById(
      "requestArrival"
    ).value;

  const departureCity =
    document.getElementById(
      "requestDepartureCity"
    ).value.trim();

  const arrivalCity =
    document.getElementById(
      "requestArrivalCity"
    ).value.trim();

  const date =
    document.getElementById(
      "requestDate"
    ).value || null;

  const description =
    document.getElementById(
      "requestDescription"
    ).value.trim();

  const weight =
    parseFloat(
      document.getElementById(
        "requestWeight"
      ).value
    ) || null;

  const budget =
    parseFloat(
      document.getElementById(
        "requestBudget"
      ).value
    ) || null;


  const message =
    document.getElementById(
      "requestMessage"
    );


  if (
    !departureCity ||
    !arrivalCity ||
    !description
  ) {

    message.textContent =
      "Compila i campi obbligatori.";

    message.className =
      "auth-error";

    return;

  }


  if (
    departure === arrival
  ) {

    message.textContent =
      "I paesi devono essere diversi.";

    message.className =
      "auth-error";

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from("requests")
      .insert({

        user_id:
          currentUser.id,

        departure_country:
          departure,

        arrival_country:
          arrival,

        departure_city:
          departureCity,

        arrival_city:
          arrivalCity,

        needed_date:
          date,

        item_description:
          description,

        weight_kg:
          weight,

        budget:
          budget,

        status:
          "open"

      });


  if (error) {

    message.textContent =
      error.message;

    message.className =
      "auth-error";

    return;

  }


  message.textContent =
    "✓ Richiesta pubblicata!";

  message.className =
    "auth-success";


  setTimeout(
    () => {

      closeRequestModal();

      loadRequests();

    },
    800
  );

}


/* =====================================================
   LOAD REQUESTS
===================================================== */

async function loadRequests() {

  const container =
    document.getElementById(
      "requestsContainer"
    );

  if (!container) return;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("requests")
      .select(`
        *,
        profiles(
          full_name,
          is_verified
        )
      `)
      .eq(
        "status",
        "open"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    container.innerHTML =
      `<div class="loading">
        Errore nel caricamento.
      </div>`;

    return;

  }


  if (!data.length) {

    container.innerHTML =
      `<div class="empty-state">

        <h3>
          📦 Nessuna richiesta
        </h3>

        <p>
          Pubblica una richiesta.
        </p>

      </div>`;

    return;

  }


  container.innerHTML =
    data
      .map(
        requestCard
      )
      .join("");

}


function requestCard(request) {

  return `

    <article class="card">

      <div class="avatar">
        📦
      </div>

      <h3>

        ${escapeHtml(
          request.profiles?.full_name ||
          "Utente Waselni"
        )}

      </h3>

      <p>

        ${flag(
          request.departure_country
        )}

        ${escapeHtml(
          request.departure_city
        )}

        →

        ${flag(
          request.arrival_country
        )}

        ${escapeHtml(
          request.arrival_city
        )}

      </p>

      <p>
        ${escapeHtml(
          request.item_description
        )}
      </p>

      ${
        request.weight_kg
          ? `<p>
              📦 ${request.weight_kg} kg
             </p>`
          : ""
      }

      ${
        request.budget
          ? `<strong>
              Budget €${request.budget}
             </strong>`
          : ""
      }

    </article>

  `;

}


/* =====================================================
   CONTACT
===================================================== */

function contactUser(userId) {

  if (!currentUser) {

    openAuth();

    return;

  }


  alert(
    "La messaggistica sarà collegata alla tabella messages nel prossimo modulo."
  );

}


/* =====================================================
   LANGUAGE
===================================================== */

const languages = [
  {
    code: "it",
    label: "🇮🇹 IT"
  },
  {
    code: "fr",
    label: "🇫🇷 FR"
  },
  {
    code: "tn",
    label: "🇹🇳 TN"
  }
];

let currentLanguage = 0;


function cycleLanguage() {

  currentLanguage++;

  if (
    currentLanguage >=
    languages.length
  ) {
    currentLanguage = 0;
  }


  document.getElementById(
    "languageButton"
  ).textContent =
    languages[
      currentLanguage
    ].label;


  const lang =
    languages[
      currentLanguage
    ].code;


  translatePage(lang);

}


function translatePage(lang) {

  const translations = {

    it: {
      heroTitle:
        "Porta ciò che serve. Connettiti. Guadagna.",

      heroText:
        "Waselni mette in contatto persone che devono ricevere oggetti tra Italia e Tunisia con viaggiatori e trasportatori che hanno spazio disponibile."
    },

    fr: {
      heroTitle:
        "Transportez ce dont les autres ont besoin. Connectez-vous. Gagnez.",

      heroText:
        "Waselni met en relation les personnes qui souhaitent envoyer des objets entre l'Italie et la Tunisie avec des voyageurs et transporteurs."
    },

    tn: {
      heroTitle:
        "وصّل الحاجة. تواصل. واربح.",

      heroText:
        "Waselni تربط بين الناس في إيطاليا وتونس لإرسال و نقل الأغراض مع المسافرين والناقلين."
    }

  };


  const t =
    translations[lang];


  document.getElementById(
    "heroTitle"
  ).textContent =
    t.heroTitle;


  document.getElementById(
    "heroText"
  ).textContent =
    t.heroText;

}


/* =====================================================
   DARK MODE
===================================================== */

function toggleDarkMode() {

  document.body
    .classList
    .toggle("dark");

}


/* =====================================================
   MOBILE MENU
===================================================== */

function toggleMenu() {

  document
    .getElementById(
      "mainNav"
    )
    .classList
    .toggle("open");

}


/* =====================================================
   HOME
===================================================== */

function goHome() {

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =====================================================
   HELPERS
===================================================== */

function flag(country) {

  return country === "italy"
    ? "🇮🇹"
    : "🇹🇳";

}


function escapeHtml(value) {

  if (!value)
    return "";

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}
/* =====================================================
   PROFILE PLACEHOLDERS
===================================================== */

function editProfile() {

  alert(
    "La modifica del profilo sarà disponibile nel prossimo modulo."
  );

}


async function showMyTrips() {

  const {
    data,
    error
  } = await supabaseClient
    .from("trips")
    .select("*")
    .eq(
      "user_id",
      currentUser.id
    )
    .order(
      "travel_date",
      {
        ascending: false
      }
    );

  if (error) {

    alert(
      "Errore: " +
      error.message
    );

    return;
  }

  if (!data.length) {

    alert(
      "Non hai ancora pubblicato nessun viaggio."
    );

    return;
  }

  alert(
    `Hai pubblicato ${data.length} viaggio/i.`
  );

}


async function showMyRequests() {

  const {
    data,
    error
  } = await supabaseClient
    .from("requests")
    .select("*")
    .eq(
      "user_id",
      currentUser.id
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    alert(
      "Errore: " +
      error.message
    );

    return;
  }

  if (!data.length) {

    alert(
      "Non hai ancora pubblicato nessuna richiesta."
    );

    return;
  }

  alert(
    `Hai pubblicato ${data.length} richiesta/e.`
  );

}


function showMyReviews() {

  alert(
    "Il sistema di recensioni verrà collegato al database nel prossimo modulo."
  );

}


async function openVerification() {

  if (!currentUser) {
    openAuth("login");
    return;
  }

  const {
    data: existing,
    error
  } = await supabaseClient
    .from("verification_requests")
    .select("*")
    .eq(
      "user_id",
      currentUser.id
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    )
    .limit(1)
    .maybeSingle();

  if (error) {

    alert(
      "Errore: " +
      error.message
    );

    return;
  }


  const modal =
    document.createElement("div");

  modal.id =
    "verificationModal";


  let statusHtml = "";


  if (existing) {

    if (existing.status === "pending") {

      statusHtml = `

        <div class="verification-pending">

          ⏳

          <strong>
            Verifica in revisione
          </strong>

          <p>
            Abbiamo ricevuto il tuo documento.
            Un amministratore lo controllerà.
          </p>

        </div>

      `;

    }


    if (existing.status === "approved") {

      statusHtml = `

        <div class="verification-approved">

          ✓

          <strong>
            Identità verificata
          </strong>

          <p>
            Il tuo profilo possiede il badge verificato.
          </p>

        </div>

      `;

    }


    if (existing.status === "rejected") {

      statusHtml = `

        <div class="verification-rejected">

          ⚠️

          <strong>
            Verifica rifiutata
          </strong>

          <p>
            ${
              escapeHtml(
                existing.rejection_reason ||
                "Il documento non è stato approvato."
              )
            }
          </p>

        </div>

      `;

    }

  }


  modal.innerHTML = `

    <div class="auth-overlay">

      <div class="auth-box verification-modal">

        <button
          class="auth-close"
          onclick="closeVerification()">

          ×

        </button>


        <div class="verification-icon">
          🪪
        </div>


        <h2>
          Verifica la tua identità
        </h2>


        <p>
          Per garantire maggiore sicurezza alla
          comunità Waselni, chiediamo a tutti gli
          utenti di verificare la propria identità.
        </p>


        ${statusHtml}


        ${
          !existing ||
          existing.status === "rejected"

          ? `

            <div class="verification-form">

              <label>
                Tipo di documento
              </label>


              <select
                id="documentType">

                <option value="passport">
                  🛂 Passaporto
                </option>

                <option value="identity_card">
                  🪪 Carta d'identità
                </option>

              </select>


              <label>
                Documento
              </label>


              <input
                id="documentFile"
                type="file"
                accept="
                  image/jpeg,
                  image/png,
                  application/pdf
                "
              >


              <small class="upload-help">

                Formati accettati:
                JPG, PNG, PDF.
                Dimensione massima: 10 MB.

              </small>


              <div
                id="verificationMessage">
              </div>


              <button
                class="primary auth-button"
                onclick="uploadVerificationDocument()">

                🔐 Invia documento

              </button>

            </div>

          `

          : ""

        }

      </div>

    </div>

  `;


  document.body.appendChild(
    modal
  );

}


function closeVerification() {

  const modal =
    document.getElementById(
      "verificationModal"
    );

  if (modal) {
    modal.remove();
  }

}
async function uploadVerificationDocument() {

  if (!currentUser) {
    return;
  }


  const type =
    document.getElementById(
      "documentType"
    ).value;


  const input =
    document.getElementById(
      "documentFile"
    );


  const message =
    document.getElementById(
      "verificationMessage"
    );


  if (
    !input.files ||
    !input.files.length
  ) {

    message.innerHTML = `
      <div class="auth-error">
        Seleziona un documento.
      </div>
    `;

    return;
  }


  const file =
    input.files[0];


  const maxSize =
    10 * 1024 * 1024;


  if (file.size > maxSize) {

    message.innerHTML = `
      <div class="auth-error">
        Il documento supera i 10 MB.
      </div>
    `;

    return;
  }


  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf"
  ];


  if (
    !allowedTypes.includes(
      file.type
    )
  ) {

    message.innerHTML = `
      <div class="auth-error">
        Formato non supportato.
      </div>
    `;

    return;
  }


  message.innerHTML = `
    <div class="auth-success">
      Upload in corso...
    </div>
  `;


  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  const fileName =
    `${type}-${Date.now()}.${extension}`;


  const filePath =
    `${currentUser.id}/${fileName}`;


  const {
    error: uploadError
  } =
    await supabaseClient
      .storage
      .from(
        "verification-documents"
      )
      .upload(
        filePath,
        file,
        {
          upsert: false
        }
      );


  if (uploadError) {

    console.error(
      uploadError
    );

    message.innerHTML = `
      <div class="auth-error">
        Errore upload:
        ${escapeHtml(
          uploadError.message
        )}
      </div>
    `;

    return;
  }


  const {
    error: requestError
  } =
    await supabaseClient
      .from(
        "verification_requests"
      )
      .insert({

        user_id:
          currentUser.id,

        document_type:
          type,

        document_path:
          filePath,

        status:
          "pending"

      });


  if (requestError) {

    console.error(
      requestError
    );

    await supabaseClient
      .storage
      .from(
        "verification-documents"
      )
      .remove([
        filePath
      ]);


    message.innerHTML = `
      <div class="auth-error">
        Errore creazione richiesta:
        ${escapeHtml(
          requestError.message
        )}
      </div>
    `;

    return;
  }


  message.innerHTML = `
    <div class="auth-success">

      ✓ Documento inviato correttamente.

      <br>

      La verifica è ora in revisione.

    </div>
  `;


  setTimeout(
    () => {

      closeVerification();

      showProfile();

    },
    1200
  );

}
async function openAdminPanel() {

    if (!currentUser) {
        openAuth("login");
        return;
    }

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "is_admin"
    );

    if (error) {

        console.error(error);

        alert(
            "Errore controllo amministratore."
        );

        return;
    }

    if (!data) {

        alert(
            "Accesso non autorizzato."
        );

        return;
    }

    loadAdminPanel();
}
async function loadAdminPanel() {

    const {
        data,
        error
    } = await supabaseClient
        .from("verification_requests")
        .select(`
            id,
            user_id,
            document_type,
            document_path,
            status,
            rejection_reason,
            created_at
        `)
        .eq("status", "pending")
        .order("created_at", {
            ascending: true
        });

    if (error) {
        console.error(error);

        alert(
            "Errore caricamento richieste: " +
            error.message
        );

        return;
    }

    const old =
        document.getElementById("adminPage");

    if (old) {
        old.remove();
    }

    const page =
        document.createElement("div");

    page.id = "adminPage";

    page.innerHTML = `

        <div class="profile-page">

            <div class="container">

                <button
                    class="back-button"
                    onclick="closeAdminPanel()">

                    ← Torna al sito

                </button>

                <div class="profile-header">

                    <span class="section-label">
                        AMMINISTRAZIONE
                    </span>

                    <h1>
                        Pannello Waselni 🔐
                    </h1>

                    <p>
                        Gestione delle verifiche identità.
                    </p>

                </div>

                <div class="profile-card">

                    <div class="profile-card-title">

                        <h3>
                            Richieste in attesa
                        </h3>

                        <strong>
                            ${data.length}
                        </strong>

                    </div>

                </div>

                <div id="adminRequests">

                    ${
                        data.length
                        ? data.map(
                            request =>
                                adminRequestHTML(request)
                          ).join("")
                        : `
                            <div class="profile-card">

                                <h3>
                                    ✓ Tutto in ordine
                                </h3>

                                <p>
                                    Non ci sono verifiche
                                    in attesa.
                                </p>

                            </div>
                        `
                    }

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(page);

    document.body.style.overflow = "hidden";
}
function adminRequestHTML(request) {

    const type =
        request.document_type === "passport"
            ? "🛂 Passaporto"
            : "🪪 Carta d'identità";

    const date =
        new Date(
            request.created_at
        ).toLocaleString("it-IT");

    return `

        <div
            class="profile-card admin-request"
            id="request-${request.id}">

            <div>

                <span class="section-label">
                    RICHIESTA VERIFICA
                </span>

                <h3>
                    ${type}
                </h3>

                <p>
                    Utente:
                    <br>

                    <code>
                        ${escapeHtml(request.user_id)}
                    </code>
                </p>

                <p>
                    Inviata: ${date}
                </p>

            </div>

            <div class="admin-actions">

                <button
                    class="secondary"
                    onclick="viewVerificationDocument('${request.document_path}')">

                    👁 Visualizza documento

                </button>

                <button
                    class="primary"
                    onclick="approveVerification('${request.id}', '${request.user_id}')">

                    ✓ Approva

                </button>

                <button
                    class="danger-button"
                    onclick="rejectVerification('${request.id}')">

                    ✕ Rifiuta

                </button>

            </div>

        </div>
    `;
}
async function viewVerificationDocument(
    path
) {

    const {
        data,
        error
    } = await supabaseClient
        .storage
        .from(
            "verification-documents"
        )
        .createSignedUrl(
            path,
            300
        );

    if (error) {

        alert(
            "Impossibile aprire il documento: " +
            error.message
        );

        return;
    }

    window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
    );
}
async function approveVerification(
    requestId,
    userId
) {

    if (
        !confirm(
            "Confermi di aver verificato il documento?"
        )
    ) {
        return;
    }


    const {
        error: requestError
    } = await supabaseClient
        .from(
            "verification_requests"
        )
        .update({

            status:
                "approved",

            reviewed_at:
                new Date().toISOString(),

            reviewed_by:
                currentUser.id

        })
        .eq(
            "id",
            requestId
        );


    if (requestError) {

        alert(
            "Errore: " +
            requestError.message
        );

        return;
    }


    const {
        error: profileError
    } = await supabaseClient
        .from("profiles")
        .update({

            is_verified:
                true

        })
        .eq(
            "id",
            userId
        );


    if (profileError) {

        alert(
            "Richiesta approvata, ma errore aggiornamento profilo: " +
            profileError.message
        );

        return;
    }


    alert(
        "✓ Utente verificato."
    );


    loadAdminPanel();
}
async function rejectVerification(
    requestId
) {

    const reason =
        prompt(
            "Perché stai rifiutando il documento?"
        );


    if (!reason) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from(
            "verification_requests"
        )
        .update({

            status:
                "rejected",

            rejection_reason:
                reason,

            reviewed_at:
                new Date().toISOString(),

            reviewed_by:
                currentUser.id

        })
        .eq(
            "id",
            requestId
        );


    if (error) {

        alert(
            "Errore: " +
            error.message
        );

        return;
    }


    alert(
        "Richiesta rifiutata."
    );


    loadAdminPanel();
}
function closeAdminPanel() {

    const page =
        document.getElementById(
            "adminPage"
        );

    if (page) {
        page.remove();
    }

    document.body.style.overflow =
        "";
}
async function updateAdminButton() {

    if (!currentUser) {
        removeAdminButton();
        return;
    }

    try {

        const { data, error } =
            await supabaseClient.rpc("is_admin");

        if (error) {
            console.error(
                "Errore controllo admin:",
                error
            );

            removeAdminButton();
            return;
        }

        if (data === true) {
            showAdminButton();
        } else {
            removeAdminButton();
        }

    } catch (error) {

        console.error(error);
        removeAdminButton();

    }
}


function showAdminButton() {

    let button =
        document.getElementById(
            "adminHeaderButton"
        );

    if (button) {
        return;
    }

    button =
        document.createElement("button");

    button.id =
        "adminHeaderButton";

    button.type =
        "button";

    button.className =
        "admin-header-button";

    button.innerHTML =
        "🔐 Admin";

    button.onclick =
        openAdminPanel;

    /*
      Prova a inserirlo vicino
      al pulsante del profilo.
    */

    const profileButton =
        document.querySelector(
            '[onclick*="showProfile"]'
        );

    if (profileButton &&
        profileButton.parentElement) {

        profileButton.parentElement
            .appendChild(button);

    } else {

        /*
          Fallback:
          lo mette nell'header.
        */

        const header =
            document.querySelector(
                "header"
            );

        if (header) {
            header.appendChild(button);
        }

    }
}


function removeAdminButton() {

    const button =
        document.getElementById(
            "adminHeaderButton"
        );

    if (button) {
        button.remove();
    }
}
