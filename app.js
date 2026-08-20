const darkModeButton = document.getElementById("darkMode");

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

darkModeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
});

document.querySelectorAll(".primary").forEach(button => {
  button.addEventListener("click", () => {
    console.log("Funzione da collegare al backend");
  });
});
