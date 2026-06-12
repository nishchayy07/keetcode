import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="text-sm">&copy; 2024 KeetCode. All rights reserved.</div>
      <nav className="hidden md:flex items-center gap-6">
        <Link to="#" className="hover:underline">
          About
        </Link>
        <Link to="#" className="hover:underline">
          Contact
        </Link>
        <Link to="#" className="hover:underline">
          Privacy Policy
        </Link>
        <Link to="#" className="hover:underline">
          Terms of Service
        </Link>
      </nav>
    </footer>
  );
}
