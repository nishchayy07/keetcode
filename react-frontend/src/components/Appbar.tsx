import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { CodeIcon } from "./Icon";

export function Appbar() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const handleSignIn = () => {
    const email = prompt("Enter email (for mock sign-in):", "test@example.com");
    if (email) {
      // Simulate JWT: payload is { id: "test-user-id" }
      // The backend expects a valid verified JWT token signed with process.env.JWT_SECRET (or "secret" by default).
      // Since jsonwebtoken requires the secret to sign, we can sign a token from backend OR we can sign a token with "secret" if we wanted.
      // Wait, can we sign a simple token using a library?
      // Since it's client-side, we can't easily sign a real JWT without jsonwebtoken in the browser (which is bulky).
      // But wait! We can just use a pre-signed JWT token signed with the default secret "secret" for payload { id: "cl9xxxx" }!
      // Wait, what is a valid JWT signed with "secret" having payload { id: "test-user-id" }?
      // Actually, since we control the backend, we can also bypass verification or support a "mock-jwt-token" in local development.
      // Wait, in `express-backend/src/middleware/auth.ts`, we did:
      // const decoded = jwt.verify(token, secret) as { id: string };
      // If we use secret "secret" and sign it, the signature has to match.
      // Let's generate a valid token using a node script, or we can just use a standard pre-generated HS256 JWT token!
      // Wait, let's pre-generate one or use a simple base64 signature if we don't verify signature, but wait! The backend DOES verify signature.
      // If the backend verifies the signature using process.env.JWT_SECRET || "secret", we can sign it using a simple JWT creator, or we can use a pre-calculated token:
      // Payload: { "id": "user-id-123" }
      // Secret: "secret"
      // Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItaWQtMTIzIn0.jFh9h82Q_Zt3t-N-B-s5N3HqSXZ-QxS_sW-0-4-0-4
      // Let's verify if that token is correct. Actually, let's use a standard well-formed HS256 token signed with "secret" for id: "user-id-123":
      // Let's see: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItaWQtMTIzIn0.3Xn3i-7m5vS4t4U_y589255678453472
      // Wait, we can just run a quick node execution in the backend to print a signed token!
      // Let's run a quick one-liner command on node to generate a valid token signed with "secret" for { id: "user-id-123" } and copy-paste it!
      // That is extremely clever.
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsdzF6cjEyMzAwMDB1cjB5Nnk3dDh5MjAifQ.signature-mock";
      // Wait, let's just generate a real one to be 100% safe. Let's write the Appbar first.
      localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItaWQtMTIzIiwiaWF0IjoxNzgwODQyNDg4fQ.featRJsHOFruf67GBeIUtb9mknwtmyAlFNXR5boTN4E");
      localStorage.setItem("user", JSON.stringify({ name: email, email }));
      setToken("token");
      window.location.reload();
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    window.location.reload();
  };

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;

  return (
    <header className="bg-gray-900 text-white px-4 md:px-6 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <CodeIcon className="h-6 w-6" />
        <span className="text-lg font-bold">KeetCode</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6">
        <Link to="/problems" className="hover:underline">
          Problems
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        {token ? (
          <>
            <span className="text-sm text-gray-300">{user?.email || "Logged in"}</span>
            <Button onClick={handleSignOut}>Logout</Button>
          </>
        ) : (
          <Button onClick={handleSignIn}>Sign in</Button>
        )}
      </div>
    </header>
  );
}
