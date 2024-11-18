import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (authData) => {
    const { tokens, userDetails } = authData;

    localStorage.setItem('user', JSON.stringify({ tokens, userDetails }));
    setUser({ tokens, userDetails });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    isLoggedIn: !!user,
    user: user ? user.userDetails : null,
    tokens: user ? user.tokens : null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);