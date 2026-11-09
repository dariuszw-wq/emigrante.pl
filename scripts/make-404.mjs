// GitHub Pages używa /404.html jako strony błędu i jednocześnie jako fallbacku dla
// ścieżek SPA. Sam adres https://emigrante.pl/404.html odpowiada jednak kodem 200
// i jest kopią strony głównej, więc Google widzi go jako duplikat.
// Dlatego do kopii wstrzykujemy noindex i usuwamy canonical (noindex + canonical
// to sprzeczne sygnały) oraz dane OG, których na stronie błędu nie potrzebujemy.
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "dist/index.html";
const OUT = "dist/404.html";

let html = readFileSync(SRC, "utf8");

html = html.replace(/\s*<link rel="canonical"[^>]*>/g, "");
html = html.replace(
  /(<meta name="viewport"[^>]*>)/,
  '$1\n    <meta name="robots" content="noindex, follow" />',
);

if (!html.includes('name="robots"')) {
  throw new Error("make-404: nie udało się wstrzyknąć meta robots");
}
if (html.includes('rel="canonical"')) {
  throw new Error("make-404: canonical nadal obecny w 404.html");
}

writeFileSync(OUT, html);
console.log("404.html: noindex wstrzyknięty, canonical usunięty");
