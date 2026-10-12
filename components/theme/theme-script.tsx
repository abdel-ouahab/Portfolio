/**
 * Runs before paint so the stored or system theme is applied without a flash.
 * Rendered from the root layout (a Server Component).
 */
const script = `(() => {
  try {
    const stored = localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch {}
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
