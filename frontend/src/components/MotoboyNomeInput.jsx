/**
 * MotoboyNomeInput
 * Input com autocomplete para nome de entregadores.
 * Salva e busca nomes no banco de dados (Supabase).
 */

import React, { useState, useEffect, useRef } from 'react';
import { listarEntregadores, salvarEntregador, removerEntregador } from '../lib/api';

export function MotoboyNomeInput({ value, onChange, placeholder }) {
  const [aberto, setAberto]         = useState(false);
  const [nomes, setNomes]           = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro]             = useState(false);
  const wrapRef       = useRef(null);
  const clicandoItem  = useRef(false); // true enquanto o mouse está pressionado em uma sugestão

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function carregarNomes() {
    setCarregando(true);
    setErro(false);
    try {
      const lista = await listarEntregadores();
      setNomes(lista ?? []);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  async function handleFocus() {
    setAberto(true);
    await carregarNomes();
  }

  async function handleBlur() {
    // Se o usuário está clicando em uma sugestão, não processa o blur agora
    if (clicandoItem.current) return;

    setAberto(false);

    const nomeLimpo = value.trim();
    if (nomeLimpo.length < 2) return;

    // Só salva se for nome novo
    const jaExiste = nomes.some(n => n.nome === nomeLimpo);
    if (!jaExiste) {
      try {
        await salvarEntregador(nomeLimpo);
        const lista = await listarEntregadores();
        setNomes(lista ?? []);
      } catch (err) {
        // silencioso — não bloqueia o uso
        console.error('Erro ao salvar entregador:', err);
      }
    }
  }

  async function handleDeletar(e, entregador) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removerEntregador(entregador.id);
      setNomes(prev => prev.filter(n => n.id !== entregador.id));
    } catch {
      // silencioso
    }
  }

  function selecionarNome(nome) {
    onChange(nome);
    setAberto(false);
    clicandoItem.current = false;
  }

  const sugestoes = nomes.filter(
    n => n.nome.toLowerCase().includes(value.toLowerCase()) && n.nome !== value.trim()
  );
  const nomeNovo = value.trim().length >= 2 && !nomes.some(n => n.nome === value.trim());

  // Dropdown abre sempre que o campo está focado (aberto=true),
  // mesmo com lista vazia — para mostrar estado de carregando/erro/nomeNovo
  const mostrarDropdown = aberto && (carregando || erro || sugestoes.length > 0 || nomeNovo);

  return (
    <div className="motoboy-nome-wrap" ref={wrapRef}>
      <input
        className="motoboy-nome"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
      />

      {mostrarDropdown && (
        <div className="motoboy-sugestoes">
          {carregando && (
            <div className="motoboy-sugestao-hint">Carregando...</div>
          )}

          {!carregando && erro && (
            <div className="motoboy-sugestao-hint">Erro ao carregar. Tente novamente.</div>
          )}

          {!carregando && !erro && sugestoes.map(entregador => (
            <div
              key={entregador.id}
              className="motoboy-sugestao-item"
              onMouseDown={() => {
                clicandoItem.current = true;
                selecionarNome(entregador.nome);
              }}
              onMouseUp={() => { clicandoItem.current = false; }}
            >
              <span className="motoboy-sugestao-nome">{entregador.nome}</span>
              <button
                className="motoboy-sugestao-del"
                title="Remover nome salvo"
                onMouseDown={e => {
                  clicandoItem.current = true;
                  handleDeletar(e, entregador);
                }}
                onMouseUp={() => { clicandoItem.current = false; }}
              >
                ✕
              </button>
            </div>
          ))}

          {!carregando && !erro && nomeNovo && (
            <div className="motoboy-sugestao-hint">
              Será salvo ao confirmar "{value.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
