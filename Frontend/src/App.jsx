// src/App.jsx
import React, { lazy, Suspense, memo, useState, useEffect, useRef, useCallback } from 'react';
import {
  HashRouter, Routes, Route, Navigate,
  useNavigate, useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { logout } from './lib/api';

// ── Lazy loading ──────────────────────────────────────────────
const Login      = lazy(() => import('./pages/Login/Login'));
const Fechamento = lazy(() => import('./pages/Fechamento/Fechamento'));
const Historico  = lazy(() => import('./pages/Historico/Historico'));
const Plano      = lazy(() => import('./pages/Plano/Plano'));
const Equipe     = lazy(() => import('./pages/Equipe/Equipe'));
const RedefinirSenha = lazy(() => import('./pages/RedefinirSenha/RedefinirSenha'));

// ── Toast global ──────────────────────────────────────────────
export const ToastContext = React.createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, tipo = 'ok') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, tipo }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-wrap">
        {toasts.map(({ id, msg, tipo }) => (
          <div key={id} className={`toast toast--${tipo}`}>
            <span>{tipo === 'ok' ? '✓' : '✕'}</span> {msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Tela de carregamento (skeleton) ───────────────────────────
function Carregando() {
  return (
    <div className="tela-carregando">
      <div className="sk-logo" />
      <div className="sk-linha" style={{ width: 180 }} />
      <div className="sk-linha" style={{ width: 120 }} />
    </div>
  );
}

// ── Guarda de rota ────────────────────────────────────────────
function RotaProtegida({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Carregando />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function GuardaPlano({ children }) {
  const { user, perfil, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Carregando />;
  if (!user)   return <Navigate to="/login" replace />;
  if (perfil && !perfil.plano_ativo && location.pathname !== '/plano') {
    return <Navigate to="/plano" replace />;
  }
  return children;
}

// Apenas gerente acessa esta rota
function GuardaGerente({ children }) {
  const { user, perfil, loading } = useAuth();
  if (loading) return <Carregando />;
  if (!user)   return <Navigate to="/login" replace />;
  if (perfil && perfil.perfil !== 'gerente' && perfil.perfil !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

// ── Avatar dropdown ───────────────────────────────────────────
function AvatarMenu({ user }) {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const inicial = (user?.email?.[0] ?? '?').toUpperCase();

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="avatar-wrap" ref={ref}>
      <button className="avatar-btn" onClick={() => setAberto(v => !v)} title={user?.email}>
        {inicial}
      </button>
      {aberto && (
        <div className="avatar-menu">
          <div className="avatar-menu-email">{user?.email}</div>
          <hr className="avatar-menu-hr" />
          <button className="avatar-menu-item avatar-menu-item--danger" onClick={async () => {
            setAberto(false);
            await logout();
            navigate('/login');
          }}>
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────
const Navbar = memo(function Navbar() {
  const { user, perfil, planoAtivo, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const indicadorRef = useRef(null);
  const btnRefs = useRef([]);

  const isGerente = perfil?.perfil === 'gerente' || perfil?.perfil === 'admin';

  // Links base — equipe só aparece para gerente/admin
  const links = [
    { path: '/',          label: 'Caixa'    },
    { path: '/historico', label: 'Histórico' },
    ...(isGerente ? [{ path: '/equipe', label: '👥 Equipe' }] : []),
    { path: '/plano',     label: planoAtivo ? '⭐ Pro' : 'Plano' },
  ];

  // Move o indicador animado para o botão ativo
  useEffect(() => {
    const idx = links.findIndex(l => l.path === location.pathname);
    const btn = btnRefs.current[idx];
    const ind = indicadorRef.current;
    if (btn && ind) {
      ind.style.left  = `${btn.offsetLeft}px`;
      ind.style.width = `${btn.offsetWidth}px`;
      ind.style.opacity = '1';
    } else if (ind) {
      ind.style.opacity = '0';
    }
  }, [location.pathname, planoAtivo, isGerente]);

  if (loading || !user || location.pathname === '/login') return null;

  return (
    <nav className="navbar">
      <span className="navbar-logo" onClick={() => navigate('/')}>
        🍔 Big Burguer
      </span>

      <div className="navbar-links">
        <div ref={indicadorRef} className="navbar-indicator" />
        {links.map(({ path, label }, i) => (
          <button
            key={path}
            ref={el => (btnRefs.current[i] = el)}
            onClick={() => navigate(path)}
            className={`navbar-btn${location.pathname === path ? ' navbar-btn--ativo' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <AvatarMenu user={user} />
    </nav>
  );
});

// ── Transição de página ───────────────────────────────────────
function PaginaAnimada({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="pagina-fade">
      {children}
    </div>
  );
}

// ── App inner ─────────────────────────────────────────────────
function AppInner() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Carregando />}>
        <PaginaAnimada>
          <Routes>
            <Route path="/login"   element={<Login />} />
            <Route path="/"        element={<GuardaPlano><Fechamento /></GuardaPlano>} />
            <Route path="/historico" element={<GuardaPlano><Historico /></GuardaPlano>} />
            <Route path="/plano"   element={<RotaProtegida><Plano /></RotaProtegida>} />
            <Route path="/equipe"  element={<GuardaGerente><Equipe /></GuardaGerente>} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="*"        element={<Navigate to="/" replace />} />
          </Routes>
        </PaginaAnimada>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <AppInner />
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}
