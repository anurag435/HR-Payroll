import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { login } from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}