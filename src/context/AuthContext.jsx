import { createContext, useContext } from "react";

import { authenticate, registerAccount } from "../library/accounts";
import { useLocalValue } from "./useLocalValue";

const restoreEmail = (saved) => typeof saved === "string" ? saved : "";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [email, setEmail, loaded, error] = useLocalValue("sessionEmail", "", restoreEmail);
  const login = async (email, password) => setEmail(await authenticate(email, password));
  const register = async (email, password) => setEmail(await registerAccount(email, password));
  const logout = () => setEmail("");
  const isLoggedIn = Boolean(email);

  return (
    <AuthContext.Provider value={{ isLoggedIn, email, login, register, logout, loaded, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
