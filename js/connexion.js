import { supabase, onAuthChange } from "./supabase.js";

const html = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");
const stored = localStorage.getItem("monbac_theme");

function applyTheme(theme) {
  if (theme === "light" || theme === "dark") html.setAttribute("data-theme", theme);
  else html.removeAttribute("data-theme");
  const effective = theme === "dark" || (!theme && matchMedia("(prefers-color-scheme: dark)").matches);
  themeBtn.textContent = effective ? "☀️" : "🌙";
}
applyTheme(stored);
themeBtn.addEventListener("click", () => {
  const current = html.getAttribute("data-theme")
    || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("monbac_theme", next);
  applyTheme(next);
});

const form = document.getElementById("form-connexion");
const messageEl = document.getElementById("message");
const btnSubmit = document.getElementById("btn-submit");

function afficherMessage(texte, type = "error") {
  messageEl.textContent = texte;
  messageEl.className = `message ${type}`;
  messageEl.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageEl.hidden = true;

  const email = document.getElementById("email").value.trim();
  const motdepasse = document.getElementById("motdepasse").value;

  if (!email || !motdepasse) {
    afficherMessage("Renseigne ton email et ton mot de passe.");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Connexion…";

  const { error } = await supabase.auth.signInWithPassword({ email, password: motdepasse });

  btnSubmit.disabled = false;
  btnSubmit.textContent = "Se connecter";

  if (error) {
    afficherMessage("Email ou mot de passe incorrect.");
    return;
  }

  window.location.href = "tableau-bord.html";
});

onAuthChange((session) => {
  if (session) window.location.href = "tableau-bord.html";
});
