import { useState, useEffect } from "react";
import { getMe } from "../api.js";

// Returns:
//   undefined  — still loading
//   null       — not logged in
//   { id, email, firstName, lastName, roles } — logged-in user
export default function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return user;
}
