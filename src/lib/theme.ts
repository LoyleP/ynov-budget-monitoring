export type Theme = "dark" | "light";

export const THEME_KEY = "theme";

export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")!=="light"){document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}`;

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
}
