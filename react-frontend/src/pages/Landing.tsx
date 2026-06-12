import { Hero } from "../components/Hero";
import { Problems } from "../components/Problems";
import { useTheme } from "../context/ThemeContext";

export function Landing() {
  const { theme } = useTheme();
  return (
    <div className={`h-full overflow-y-auto theme-transition ${theme === "dark" ? "bg-zinc-950" : "bg-slate-50"}`}>
      <Hero />
      <Problems />
    </div>
  );
}
