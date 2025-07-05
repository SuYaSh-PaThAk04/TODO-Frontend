import { createContext, useState } from 'react';
import axiosInstance from '../api/axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post('/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axiosInstance.post('/users/register', { username, email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
