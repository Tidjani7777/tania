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

const serieSelect = document.getElementById("serie");
const blocLangues = document.getElementById("bloc-langues");
const lv1Select = document.getElementById("lv1");
const lv2Select = document.getElementById("lv2");
const SERIES_L = new Set(["L1a", "L1b", "L1", "L2", "LA"]);

function updateBlocLangues() {
  const estL = SERIES_L.has(serieSelect.value);
  blocLangues.hidden = !estL;
  if (!estL) {
    lv1Select.value = "anglais";
    document.getElementById("sp_ou_svt").value = "";
  }
  majOptionsLV2();
}

function majOptionsLV2() {
  const lv1 = lv1Select.value;
  const optionsLv2 = [
    { v: "allemand",  t: "Allemand"  },
    { v: "espagnol",  t: "Espagnol"  },
    { v: "italien",   t: "Italien"   },
    { v: "portugais", t: "Portugais" },
    { v: "russe",     t: "Russe"     },
    { v: "arabe",     t: "Arabe"     },
    { v: "economie",  t: "Économie générale" },
  ];
  const valeurActuelle = lv2Select.value;
  lv2Select.innerHTML = '<option value="">— Choisir —</option>';
  if (lv1 !== "anglais") {
    const optAnglais = document.createElement("option");
    optAnglais.value = "anglais";
    optAnglais.textContent = "Anglais (par défaut)";
    lv2Select.appendChild(optAnglais);
  }
  for (const opt of optionsLv2) {
    if (opt.v === lv1) continue;
    const o = document.createElement("option");
    o.value = opt.v;
    o.textContent = opt.t;
    lv2Select.appendChild(o);
  }
  if ([...lv2Select.options].some(o => o.value === valeurActuelle)) {
    lv2Select.value = valeurActuelle;
  } else if (lv1 !== "anglais") {
    lv2Select.value = "anglais";
  } else {
    lv2Select.value = "";
  }
}

serieSelect.addEventListener("change", updateBlocLangues);
lv1Select.addEventListener("change", majOptionsLV2);
updateBlocLangues();

const messageEl = document.getElementById("message");
function afficherMessage(texte, type = "error") {
  messageEl.textContent = texte;
  messageEl.className = `message ${type}`;
  messageEl.hidden = false;
}

const form = document.getElementById("form-inscription");
const btnSubmit = document.getElementById("btn-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageEl.hidden = true;

  const prenom = document.getElementById("prenom").value.trim();
  const nom = document.getElementById("nom").value.trim();
  const telephone = document.getElementById("telephone").value.trim();
  const serie = serieSelect.value;
  const email = document.getElementById("email").value.trim();
  const motdepasse = document.getElementById("motdepasse").value;
  const estL = SERIES_L.has(serie);

  if (!prenom || !nom) return afficherMessage("Renseigne ton prénom et ton nom.");
  if (!telephone) return afficherMessage("Renseigne ton numéro de téléphone.");
  if (!serie) return afficherMessage("Choisis ta série.");
  if (!email) return afficherMessage("Renseigne ton email.");
  if (motdepasse.length < 6) return afficherMessage("Le mot de passe doit contenir au moins 6 caractères.");

  if (estL) {
    if (!lv1Select.value) return afficherMessage("Choisis ta LV1.");
    if (!lv2Select.value) return afficherMessage("Choisis ta LV2 ou l'économie générale.");
    if (!document.getElementById("sp_ou_svt").value) return afficherMessage("Choisis SP ou SVT.");
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Création…";

  const metadata = {
    prenom, nom, telephone, serie,
    lv1: estL ? lv1Select.value : null,
    lv2: estL ? lv2Select.value : null,
    sp_ou_svt: estL ? document.getElementById("sp_ou_svt").value : null,
  };

  const { data, error } = await supabase.auth.signUp({
    email, password: motdepasse,
    options: { data: metadata },
  });

  btnSubmit.disabled = false;
  btnSubmit.textContent = "Créer mon compte";

  if (error) {
    afficherMessage("Erreur : " + error.message);
    return;
  }

  if (data.user && estL) {
    await supabase.from("profils").update({
      lv1: metadata.lv1,
      lv2: metadata.lv2,
      sp_ou_svt: metadata.sp_ou_svt,
    }).eq("id", data.user.id);
  }

  afficherMessage("Compte créé ! Redirection…", "success");
  setTimeout(() => { window.location.href = "tableau-bord.html"; }, 800);
});

onAuthChange((session) => {
  if (session) window.location.href = "tableau-bord.html";
});
