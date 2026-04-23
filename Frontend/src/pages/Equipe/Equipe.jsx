// src/pages/Equipe/Equipe.jsx
import React, { useState, useEffect, useContext } from 'react';
import { convidarFuncionario, listarFuncionarios, removerFuncionario } from '../../lib/api';
import { ToastContext } from '../../App';
import './Equipe.css';

// ── Skeleton ──────────────────────────────────────────────────
function SkeletonLista() {
  return (
    <div className="equipe-lista">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="sk-card" style={{ animationDelay: `${i * 0.1}s`, height: 64 }} />
      ))}
    </div>
  );
}

// ── Modal de confirmação ──────────────────────────────────────
function ModalConfirmar({ nome, email, onConfirmar, onCancelar, carregando }) {
  return (
    <div className="equipe-overlay" onClick={onCancelar}>
      <div className="equipe-modal-confirm" onClick={e => e.stopPropagation()}>
        <p className="equipe-modal-confirm-titulo">Remover funcionário?</p>
        <p className="equipe-modal-confirm-sub">
          <strong>{nome || email}</strong> perderá acesso ao sistema imediatamente.
        </p>
        <div className="equipe-modal-confirm-btns">
          <button className="equipe-btn-cancelar" onClick={onCancelar} disabled={carregando}>
            Cancelar
          </button>
          <button className="equipe-btn-remover" onClick={onConfirmar} disabled={carregando}>
            {carregando ? 'Removendo…' : 'Remover'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card de funcionário ───────────────────────────────────────
function CardFuncionario({ f, onRemover }) {
  const inicial = (f.nome || f.email || '?')[0].toUpperCase();
  const formatarData = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR');
  };

  return (
    <div className="equipe-card">
      <div className="equipe-avatar">{inicial}</div>
      <div className="equipe-card-info">
        <span className="equipe-card-nome">{f.nome || '—'}</span>
        <span className="equipe-card-email">{f.email}</span>
        <span className="equipe-card-data">desde {formatarData(f.criado_em)}</span>
      </div>
      <button
        className="equipe-btn-lixo"
        onClick={() => onRemover(f)}
        title="Remover funcionário"
      >
        🗑
      </button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function Equipe() {
  const addToast = useContext(ToastContext);

  const [funcionarios,   setFuncionarios]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [erro,           setErro]           = useState('');
  const [emailConvite,   setEmailConvite]   = useState('');
  const [enviando,       setEnviando]       = useState(false);
  const [removendo,      setRemovendo]      = useState(false);
  const [alvoRemover,    setAlvoRemover]    = useState(null); // { id, nome, email }

  async function carregar() {
    setLoading(true); setErro('');
    try {
      const { funcionarios: dados } = await listarFuncionarios();
      setFuncionarios(dados ?? []);
    } catch {
      setErro('Erro ao carregar funcionários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function handleConvidar(e) {
    e.preventDefault();
    if (!emailConvite.trim()) return;
    setEnviando(true);
    try {
      await convidarFuncionario(emailConvite.trim());
      addToast(`Convite enviado para ${emailConvite}!`, 'ok');
      setEmailConvite('');
      // Recarrega a lista após breve delay (usuário pode aparecer)
      setTimeout(carregar, 1500);
    } catch (err) {
      addToast(err.message || 'Erro ao enviar convite.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  async function handleConfirmarRemover() {
    if (!alvoRemover) return;
    setRemovendo(true);
    try {
      await removerFuncionario(alvoRemover.id);
      addToast(`${alvoRemover.nome || alvoRemover.email} foi removido.`, 'ok');
      setAlvoRemover(null);
      carregar();
    } catch (err) {
      addToast(err.message || 'Erro ao remover funcionário.', 'erro');
    } finally {
      setRemovendo(false);
    }
  }

  return (
    <div className="equipe-root">
      <div className="equipe-cabecalho">
        <h1>Minha Equipe</h1>
        <span className="equipe-badge">{funcionarios.length} funcionário{funcionarios.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Formulário de convite */}
      <div className="equipe-convite-card">
        <p className="equipe-convite-titulo">Convidar funcionário</p>
        <p className="equipe-convite-sub">
          O funcionário receberá um email para criar a senha e já terá acesso ao sistema.
        </p>
        <form className="equipe-convite-form" onSubmit={handleConvidar}>
          <input
            type="email"
            className="equipe-input"
            placeholder="email@funcionario.com"
            value={emailConvite}
            onChange={e => setEmailConvite(e.target.value)}
            disabled={enviando}
            required
          />
          <button
            type="submit"
            className="equipe-btn-convidar"
            disabled={enviando || !emailConvite.trim()}
          >
            {enviando ? 'Enviando…' : 'Enviar convite'}
          </button>
        </form>
      </div>

      {/* Lista de funcionários */}
      <div className="equipe-secao">
        <p className="equipe-secao-titulo">Funcionários ativos</p>

        {erro && <div className="equipe-erro">{erro}</div>}
        {loading && <SkeletonLista />}

        {!loading && funcionarios.length === 0 && !erro && (
          <div className="equipe-vazio">
            <p>Nenhum funcionário cadastrado ainda.</p>
            <p className="equipe-vazio-sub">Convide alguém usando o formulário acima.</p>
          </div>
        )}

        {!loading && funcionarios.length > 0 && (
          <div className="equipe-lista">
            {funcionarios.map(f => (
              <CardFuncionario
                key={f.id}
                f={f}
                onRemover={setAlvoRemover}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmação de remoção */}
      {alvoRemover && (
        <ModalConfirmar
          nome={alvoRemover.nome}
          email={alvoRemover.email}
          onConfirmar={handleConfirmarRemover}
          onCancelar={() => setAlvoRemover(null)}
          carregando={removendo}
        />
      )}
    </div>
  );
}
