import { Route, Routes, useNavigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { api, setToken } from './api';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';

export type User = {
  username: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await api.post('/api/auth/login', { username, password });
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      setToken(token);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleRegister = async (username: string, password: string) => {
    try {
      await api.post('/api/auth/register', { username, password });
      alert('Registered successfully');
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    navigate('/login')
  }

  return (
    <Routes>
      <Route path="/" element={token ? <Dashboard
          onLogout={handleLogout}
        /> : <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => { console.log("logined") }}
        />} />
      <Route path="/login" element={<Login
          onLogin={handleLogin}
          onSwitchToRegister={() => { navigate('/register'); }}
        />} />
      <Route path="/register" element={<Register
          onRegister={handleRegister}
          onSwitchToLogin={() => { navigate('/login'); }}
        />} />
      <Route path="/dashboard" element={<Dashboard
          onLogout={handleLogout}
        />} />
    </Routes>
  );
}

export default App;
