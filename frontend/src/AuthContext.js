import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState(localStorage.getItem("email"));

  const login = (newToken, userEmail) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", userEmail);
    setToken(newToken);
    setEmail(userEmail);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}