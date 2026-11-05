import { onAuthChange } from "./supabase.js";

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

onAuthChange((session) => {
  if (session) console.log("Session active :", session.user.email);
});
