// src/contexts/AuthContext.jsx
// Atualizado: expõe isGerente além de isAdmin

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,          setUser]          = useState(null);
  const [perfil,        setPerfil]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [perfilLoading, setPerfilLoading] = useState(false);

  async function carregarPerfil(sessionUser, forcarRecarga = false) {
    if (!sessionUser) {
      setPerfil(null);
      sessionStorage.removeItem('bb_perfil');
      return;
    }

    // Usa cache do sessionStorage se disponível e não forçar recarga
    if (!forcarRecarga) {
      const cached = sessionStorage.getItem('bb_perfil');
      if (cached) {
        try {
          setPerfil(JSON.parse(cached));
          return;
        } catch {
          sessionStorage.removeItem('bb_perfil');
        }
      }
    }

    setPerfilLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('perfil', {
        body: { action: 'get' },
      });
      if (!error && data) {
        setPerfil(data);
        sessionStorage.setItem('bb_perfil', JSON.stringify(data));
      } else {
        setPerfil(null);
      }
    } catch {
      setPerfil(null);
    } finally {
      setPerfilLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      carregarPerfil(session?.user).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      carregarPerfil(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // planoAtivo = true se:
  //   1. plano_ativo é true E
  //   2. plano_expira_em não existe (acesso vitalício legado) OU ainda não expirou
  const planoAtivo = (() => {
    if (!perfil) return false;
    if (!perfil.plano_ativo) return false;
    if (!perfil.plano_expira_em) return true; // legado sem data
    return new Date(perfil.plano_expira_em) > new Date();
  })();

  const value = {
    user,
    perfil,
    loading: loading || perfilLoading,
    isAdmin:   perfil?.perfil === 'admin',
    isGerente: perfil?.perfil === 'gerente',
    isFuncionario: perfil?.perfil === 'funcionario',
    planoAtivo,
    recarregarPerfil: () => carregarPerfil(user, true),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve estar dentro de <AuthProvider>');
  return ctx;
}
