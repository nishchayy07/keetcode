import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function RootLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--keet-bg)] theme-transition">
      <Navbar />
      {/* min-h-0 is critical: without it flex children can't shrink below their content size */}
      <main className="flex-1 min-h-0 w-full">
        <Outlet />
      </main>
    </div>
  );
}
