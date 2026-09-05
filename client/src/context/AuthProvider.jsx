import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const value = {};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}