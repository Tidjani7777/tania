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

document.getElementById("btn-deconnexion").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "index.html";
});

const app = document.getElementById("app");

function libelleLangue(cle) {
  const noms = {
    anglais: "Anglais", allemand: "Allemand", espagnol: "Espagnol",
    italien: "Italien", portugais: "Portugais", russe: "Russe",
    arabe: "Arabe", economie: "Économie générale",
  };
  return noms[cle] ?? "—";
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

async function chargerTableauBord() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "connexion.html";
    return;
  }

  const { data: profil, error } = await supabase
    .from("profils")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !profil) {
    app.innerHTML = `<p class="message error">Impossible de charger ton profil. Déconnecte-toi et reconnecte-toi.</p>`;
    return;
  }

  const estL = ["L1a","L1b","L1","L2","LA"].includes(profil.serie);
  const detailLangues = estL
    ? `
      <p><span class="db-badge">LV1</span> ${libelleLangue(profil.lv1)}</p>
      <p><span class="db-badge">LV2</span> ${libelleLangue(profil.lv2)}</p>
      <p><span class="db-badge">SP/SVT</span> ${escapeHtml(profil.sp_ou_svt ?? "—")}</p>
    `
    : "";

  app.innerHTML = `
    <h1>Bonjour ${escapeHtml(profil.prenom)} 👋</h1>
    <p class="auth-sub">Content de te voir sur MonBac.</p>

    <div class="db-card">
      <h2>Mon profil</h2>
      <p>${escapeHtml(profil.prenom)} ${escapeHtml(profil.nom)}</p>
      <p>Téléphone : ${escapeHtml(profil.telephone)}</p>
      <p><span class="db-badge">Série</span> ${escapeHtml(profil.serie)}</p>
      ${detailLangues}
    </div>

    <div class="db-card">
      <h2>Mon espace de révision</h2>
      <p>Les cours arrivent bientôt. Ton tableau de bord complet sera disponible dans la prochaine étape.</p>
    </div>
  `;
}

chargerTableauBord();

onAuthChange((session) => {
  if (!session) window.location.href = "connexion.html";
});
