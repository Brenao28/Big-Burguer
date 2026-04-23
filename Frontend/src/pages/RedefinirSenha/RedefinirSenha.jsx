// src/pages/RedefinirSenha/RedefinirSenha.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import '../Login/Login.css'; // reutiliza o mesmo estilo

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [senha, setSenha]     = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState('');
  const [pronto, setPronto]   = useState(false); // token chegou e é válido

  // Quando o Supabase redireciona para cá, ele emite o evento PASSWORD_RECOVERY
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPronto(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setErro('');
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setErro('Erro ao redefinir a senha. Tente solicitar um novo link.');
    } else {
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    }
    setLoading(false);
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-icon">🍔</span>
          <span className="login-logo-text">Big Burguer</span>
        </div>
        <div className="login-header">
          <h1>Definir senha</h1>
          <p>Escolha uma senha para acessar o sistema</p>
        </div>

        {erro && <div className="login-msg login-msg--erro">{erro}</div>}

        {!pronto ? (
          <p style={{ textAlign: 'center', color: 'var(--muted)' }}>
            Aguardando verificação do link…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>Nova senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}