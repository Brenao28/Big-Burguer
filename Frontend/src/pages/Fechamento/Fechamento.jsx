// src/pages/Fechamento/Fechamento.jsx
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { criarFechamento } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import './Fechamento.css';

// ── Ícones ────────────────────────────────────────────────────
const IconStore = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconBike = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6a1 1 0 0 0-1 1v5.5l-5-3.5"/><path d="M9 6h5l3 5.5"/>
  </svg>
);
const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconAlert = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-3.65"/>
  </svg>
);
const IconCamera = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

// ── Helpers de moeda ──────────────────────────────────────────
const fmt = (v) => (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const parse = (s) => parseFloat(String(s || '').replace(/\./g, '').replace(',', '.')) || 0;

// ── Data de referência ────────────────────────────────────────
function dataReferencia() {
  const agora = new Date();
  const base  = agora.getHours() < 17 ? new Date(agora.setDate(agora.getDate() - 1)) : agora;
  return base.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Estado inicial ────────────────────────────────────────────
const SALAO_VAZIO    = { vendaSist: 0, inicial: 0, maq: 0, din: 0, excedente: 0, vendaRetirada: 0, pixRetirada: 0, maqRetirada: 0 };
const DELIVERY_VAZIO = { vendaWeb: 0, pixWeb: 0, vendaBundiA: 0, pixBundiA: 0, vendaBundiB: 0, pixBundiB: 0 };
const MOTOBOY_NOVO   = (n) => ({ nome: `Entregador ${n}`, qtd: 0, maq: 0, din: 0, gas: 0 });

// ── Persistência de sessão ────────────────────────────────────
const STORAGE_KEY = 'fechamento_rascunho';
function salvarRascunho(data) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function carregarRascunho() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Campo monetário ───────────────────────────────────────────
function Campo({ label, hint, value, onChange, erro }) {
  const [focused, setFocused] = useState(false);
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (!focused) setDisplay(value ? fmt(value) : '');
  }, [value, focused]);

  return (
    <div className="campo">
      <label className="campo-label">
        {label}
        {hint && <span className="campo-hint">{hint}</span>}
      </label>
      <div className={`campo-input ${erro ? 'campo-input--erro' : ''}`}>
        <span className="campo-prefix">R$</span>
        <input
          type="text"
          inputMode="decimal"
          value={display}
          placeholder="0,00"
          onFocus={() => { setFocused(true); setDisplay(value ? String(value).replace('.', ',') : ''); }}
          onChange={e => { setDisplay(e.target.value); onChange(parse(e.target.value)); }}
          onBlur={() => { setFocused(false); setDisplay(value ? fmt(value) : ''); }}
        />
      </div>
      {erro && <span className="campo-erro">{erro}</span>}
    </div>
  );
}

// ── Linha de resumo ───────────────────────────────────────────
function LinhaResumo({ label, value, destaque, sub }) {
  return (
    <div className={`linha-resumo ${destaque ? 'linha-resumo--destaque' : ''} ${sub ? 'linha-resumo--sub' : ''}`}>
      <span>{label}</span>
      <span>R$ {fmt(value)}</span>
    </div>
  );
}

// ── Toggle Salão / Delivery ───────────────────────────────────
const ABAS = [
  { id: 'salao',    label: 'Salão',    Icon: IconStore },
  { id: 'delivery', label: 'Delivery', Icon: IconBike  },
];

function ToggleAbas({ aba, onChange, subtotais }) {
  const refs  = useRef([]);
  const pill  = useRef(null);

  useLayoutEffect(() => {
    const idx = ABAS.findIndex(a => a.id === aba);
    const btn = refs.current[idx];
    if (btn && pill.current) {
      pill.current.style.left  = `${btn.offsetLeft}px`;
      pill.current.style.width = `${btn.offsetWidth}px`;
    }
  }, [aba]);

  return (
    <div className="toggle-wrap">
      <div className="toggle">
        <div ref={pill} className={`toggle-pill toggle-pill--${aba}`} />
        {ABAS.map(({ id, label, Icon }, i) => (
          <button
            key={id}
            ref={el => (refs.current[i] = el)}
            className={`toggle-btn ${aba === id ? 'toggle-btn--ativo' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon /> {label}
            {subtotais[id] > 0 && <span className="toggle-sub">R$ {fmt(subtotais[id])}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Modal de confirmação ──────────────────────────────────────
function Modal({ titulo, mensagem, onConfirmar, onCancelar }) {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <p className="modal-titulo">{titulo}</p>
        <p className="modal-sub">{mensagem}</p>
        <div className="modal-acoes">
          <button className="btn btn--ghost" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn--confirmar" onClick={onConfirmar}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function Fechamento() {
  const { user } = useAuth();

  // Carrega rascunho salvo (evita reset ao Alt+Tab)
  const rascunho = carregarRascunho();

  const [etapa,        setEtapa]        = useState('formulario');
  const [aba,          setAba]          = useState('salao');
  const [salao,        setSalao]        = useState(rascunho?.salao    || SALAO_VAZIO);
  const [delivery,     setDelivery]     = useState(rascunho?.delivery || DELIVERY_VAZIO);
  const [motoboys,     setMotoboys]     = useState(rascunho?.motoboys || [MOTOBOY_NOVO(1)]);
  const [brendiAtivo,  setBrendiAtivo]  = useState('A'); // 'A' = Açaí | 'B' = Pizza/Hamburguer
  const [relatorio,    setRelatorio]    = useState(null);
  const [erros,        setErros]        = useState({});
  const [salvando,     setSalvando]     = useState(false);
  const [erroSalvar,   setErroSalvar]   = useState('');
  const [copiando,     setCopiando]     = useState(false);
  const [copiado,      setCopiado]      = useState(false);
  const [confirmarNovo, setConfirmarNovo] = useState(false);

  const toque         = useRef(null);
  const resultadoRef  = useRef(null);
  const conteudoRef   = useRef(null);

  // Subtotais para o toggle
  const subtotais = {
    salao:    salao.maq + salao.maqRetirada + Math.max(0, salao.din - salao.inicial) + salao.excedente,
    delivery: (delivery.vendaWeb - delivery.pixWeb)
            + (delivery.vendaBundiA - delivery.pixBundiA)
            + (delivery.vendaBundiB - delivery.pixBundiB),
  };

  // Scroll ao resultado
  useEffect(() => {
    if (etapa === 'resultado' && resultadoRef.current) {
      setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [etapa]);

  // Auto-salvar rascunho no sessionStorage
  useEffect(() => {
    if (etapa === 'formulario') {
      salvarRascunho({ salao, delivery, motoboys });
    }
  }, [salao, delivery, motoboys, etapa]);

  // Swipe mobile entre abas
  function onTouchStart(e) { toque.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (!toque.current) return;
    const diff = toque.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    const idx = ABAS.findIndex(a => a.id === aba);
    if (diff > 0 && idx < ABAS.length - 1) setAba(ABAS[idx + 1].id);
    if (diff < 0 && idx > 0)               setAba(ABAS[idx - 1].id);
    toque.current = null;
  }

  // Motoboy
  function editarMotoboy(i, campo, val) {
    setMotoboys(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [campo]: campo === 'nome' ? val : (Number(val) || 0) };
      return next;
    });
  }
  function addMotoboy()    { setMotoboys(p => [...p, MOTOBOY_NOVO(p.length + 1)]); }
  function removeMotoboy() { setMotoboys(p => p.length > 1 ? p.slice(0, -1) : p); }

  // Validação
  function validar() {
    const e = {};
    if (!salao.vendaSist || salao.vendaSist <= 0)
      e.vendaSist = 'Informe as vendas do salão';
    if (delivery.vendaWeb + delivery.vendaBundiA + delivery.vendaBundiB <= 0)
      e.vendaDelivery = 'Informe ao menos uma venda de delivery';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  // Calcular + salvar
  async function calcular() {
    if (!validar()) return;

    // ── Salão ──
    const pixRetiradaAuto  = salao.vendaRetirada - salao.pixRetirada;
    const totalVendasSalao = salao.vendaSist + pixRetiradaAuto;
    const realSalao        = (salao.din - salao.inicial) + salao.maq + salao.maqRetirada + salao.excedente;
    const difSalao         = realSalao - totalVendasSalao;

    // ── Delivery ──
    const pixWebAuto    = delivery.vendaWeb   - delivery.pixWeb;    // web sem pix auto
    const pixBundiAAuto = delivery.vendaBundiA - delivery.pixBundiA; // açaí sem pix auto
    const pixBundiBAuto = delivery.vendaBundiB - delivery.pixBundiB; // pizza sem pix auto
    const sistDeliv     = pixWebAuto + pixBundiAAuto + pixBundiBAuto; // total esperado

    const totalMaq      = motoboys.reduce((s, m) => s + m.maq, 0);
    const totalDin      = motoboys.reduce((s, m) => s + m.din, 0);
    const totalGas      = motoboys.reduce((s, m) => s + m.gas, 0);
    const realDelivLiq  = totalMaq + totalDin + totalGas;            // total recebido
    const difDeliv      = realDelivLiq - sistDeliv;

    const dados = {
      // Salão
      sistSalao: salao.vendaSist, realSalao, excedente: salao.excedente, difSalao,
      totalVendasSalao, pixRetiradaAuto,
      vendaRetirada: salao.vendaRetirada, pixRetirada: salao.pixRetirada,
      maqRetirada: salao.maqRetirada,
      // Delivery
      vendaWeb: delivery.vendaWeb, pixWeb: delivery.pixWeb, pixWebAuto,
      vendaBundiA: delivery.vendaBundiA, pixBundiA: delivery.pixBundiA, pixBundiAAuto,
      vendaBundiB: delivery.vendaBundiB, pixBundiB: delivery.pixBundiB, pixBundiBAuto,
      sistDeliv, realDelivLiq, totalGasEnt: totalGas, difDeliv,
      // Geral
      totalGeral: difSalao + difDeliv,
      dataFechamento: dataReferencia(),
      motoboys,
      // Campos originais para salvar no banco
      trocoInicial: salao.inicial, maqSalao: salao.maq, dinheiroGaveta: salao.din,
    };

    setRelatorio(dados);
    setEtapa('resultado');

    // Salva via backend
    setSalvando(true); setErroSalvar('');
    try {
      await criarFechamento(dados);
    } catch (e) {
      setErroSalvar('Não foi possível salvar no servidor. Os dados estão visíveis mas tente novamente.');
      console.error(e);
    } finally {
      setSalvando(false);
    }
  }

  // Copiar como imagem
  async function copiarImagem() {
    const el = conteudoRef.current;
    if (!el) return;
    setCopiando(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, { backgroundColor: '#0f172a', scale: 2, useCORS: true });
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopiado(true); setTimeout(() => setCopiado(false), 3000);
        } catch {
          const url = URL.createObjectURL(blob);
          Object.assign(document.createElement('a'), { href: url, download: 'fechamento.png' }).click();
          URL.revokeObjectURL(url);
        } finally { setCopiando(false); }
      });
    } catch { setCopiando(false); }
  }

  // Novo fechamento
  function novoFechamento() {
    setSalao(SALAO_VAZIO); setDelivery(DELIVERY_VAZIO);
    setMotoboys([MOTOBOY_NOVO(1)]); setRelatorio(null);
    setErros({}); setEtapa('formulario'); setAba('salao');
    setConfirmarNovo(false); setErroSalvar('');
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }

  const positivo = relatorio && Math.abs(relatorio.totalGeral) < 1;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="fc-root">
      <main className="fc-main">

        {/* ══════════════════════════════════════════════════════
            FORMULÁRIO
        ══════════════════════════════════════════════════════ */}
        {etapa === 'formulario' && (
          <div className="fc-fade">
            <ToggleAbas aba={aba} onChange={setAba} subtotais={subtotais} />

            <div className="fc-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div
                className="fc-track"
                style={{ transform: `translateX(-${ABAS.findIndex(a => a.id === aba) * 50}%)` }}
              >

                {/* ── Salão ── */}
                <div className="fc-slide">
                  <div className="fc-card fc-card--salao">
                    <div className="fc-card-header fc-card-header--salao">
                      <IconStore /> Salão
                    </div>

                    <div className="fc-secao">
                      <span className="fc-secao-label">Vendas mesas</span>
                      <Campo label="Venda total" value={salao.vendaSist} erro={erros.vendaSist}
                        onChange={v => { setSalao(s => ({ ...s, vendaSist: v })); setErros(e => ({ ...e, vendaSist: null })); }} />
                    </div>

                    <div className="fc-divider" />

                    <div className="fc-secao">
                      <span className="fc-secao-label">Caixa físico</span>
                      <Campo label="Dinheiro na gaveta" value={salao.din}
                        onChange={v => setSalao(s => ({ ...s, din: v }))} />
                      <Campo label="Troco inicial" hint="valor na gaveta ao abrir caixa" value={salao.inicial}
                        onChange={v => setSalao(s => ({ ...s, inicial: v }))} />
                      <div className="fc-calc-auto">
                        <span className="fc-calc-label">Valor bruto</span>
                        <span className="fc-calc-valor">R$ {fmt(Math.max(0, salao.din - salao.inicial))}</span>
                      </div>
                      <Campo label="Maquininha" value={salao.maq}
                        onChange={v => setSalao(s => ({ ...s, maq: v }))} />
                    </div>

                    <div className="fc-divider" />

                    <div className="fc-secao">
                      <span className="fc-secao-label">Vendas retirada</span>
                      <Campo label="Venda total" value={salao.vendaRetirada}
                        onChange={v => setSalao(s => ({ ...s, vendaRetirada: v }))} />
                      <Campo label="Venda em pix automatico" value={salao.pixRetirada}
                        onChange={v => setSalao(s => ({ ...s, pixRetirada: v }))} />
                      <div className="fc-calc-auto">
                        <span className="fc-calc-label">Valor sem pix automatico</span>
                        <span className="fc-calc-valor">R$ {fmt(Math.max(0, salao.vendaRetirada - salao.pixRetirada))}</span>
                      </div>
                      <Campo label="Maquininha" value={salao.maqRetirada}
                        onChange={v => setSalao(s => ({ ...s, maqRetirada: v }))} />
                    </div>

                    <div className="fc-divider" />

                    <div className="fc-secao">
                      <span className="fc-secao-label">Deduções</span>
                      <Campo label="Excedente funcionários" value={salao.excedente}
                        onChange={v => setSalao(s => ({ ...s, excedente: v }))} />
                    </div>
                  </div>
                </div>

                {/* ── Delivery ── */}
                <div className="fc-slide">
                  <div className="fc-card fc-card--delivery">
                    <div className="fc-card-header fc-card-header--delivery">
                      <IconBike /> Delivery
                    </div>

                    <div className="fc-secao">
                      <span className="fc-secao-label">Web Cardápio</span>
                      <Campo label="Valor total de venda" value={delivery.vendaWeb} erro={erros.vendaDelivery}
                        onChange={v => { setDelivery(d => ({ ...d, vendaWeb: v })); setErros(e => ({ ...e, vendaDelivery: null })); }} />
                      <Campo label="Valor em pix automático" value={delivery.pixWeb}
                        onChange={v => setDelivery(d => ({ ...d, pixWeb: v }))} />
                      <div className="fc-calc-auto">
                        <span className="fc-calc-label">Valor sem pix automático</span>
                        <span className="fc-calc-valor">R$ {fmt(Math.max(0, delivery.vendaWeb - delivery.pixWeb))}</span>
                      </div>
                    </div>

                    <div className="fc-divider" />

                    <div className="fc-secao">
                      <div className="brendi-toggle-wrap">
                        <span className="fc-secao-label" style={{ marginBottom: 0 }}>App Brendi</span>
                        <div className="brendi-toggle">
                          <button
                            className={`brendi-btn ${brendiAtivo === 'A' ? 'brendi-btn--ativo' : ''}`}
                            onClick={() => setBrendiAtivo('A')}
                          >🍦 Açaí</button>
                          <button
                            className={`brendi-btn ${brendiAtivo === 'B' ? 'brendi-btn--ativo' : ''}`}
                            onClick={() => setBrendiAtivo('B')}
                          >🍕 Pizza / Hamburguer</button>
                        </div>
                      </div>

                      {brendiAtivo === 'A' ? (
                        <>
                          <Campo label="Valor total" value={delivery.vendaBundiA}
                            onChange={v => setDelivery(d => ({ ...d, vendaBundiA: v }))} />
                          <Campo label="Valor em pix automático" value={delivery.pixBundiA}
                            onChange={v => setDelivery(d => ({ ...d, pixBundiA: v }))} />
                          <div className="fc-calc-auto">
                            <span className="fc-calc-label">Valor sem pix automático</span>
                            <span className="fc-calc-valor">R$ {fmt(Math.max(0, delivery.vendaBundiA - delivery.pixBundiA))}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Campo label="Valor total" value={delivery.vendaBundiB}
                            onChange={v => setDelivery(d => ({ ...d, vendaBundiB: v }))} />
                          <Campo label="Valor em pix automático" value={delivery.pixBundiB}
                            onChange={v => setDelivery(d => ({ ...d, pixBundiB: v }))} />
                          <div className="fc-calc-auto">
                            <span className="fc-calc-label">Valor sem pix automático</span>
                            <span className="fc-calc-valor">R$ {fmt(Math.max(0, delivery.vendaBundiB - delivery.pixBundiB))}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="fc-divider" />

                    <div className="fc-secao">
                      <div className="fc-motoboys-header">
                        <span className="fc-secao-label" style={{ margin: 0 }}>Acerto dos motoboys</span>
                        <div className="fc-counter">
                          <button onClick={removeMotoboy} disabled={motoboys.length <= 1}>−</button>
                          <span>{motoboys.length}</span>
                          <button onClick={addMotoboy}>+</button>
                        </div>
                      </div>

                      {motoboys.map((m, i) => (
                        <div key={i} className="motoboy-card">
                          <div className="motoboy-topo">
                            <div className="motoboy-avatar">{m.nome.charAt(0).toUpperCase()}</div>
                            <input className="motoboy-nome" type="text" value={m.nome}
                              placeholder={`Entregador ${i + 1}`}
                              onChange={e => editarMotoboy(i, 'nome', e.target.value)} />
                          </div>
                          <div className="motoboy-campos">
                            {[['qtd','Entregas'],['maq','Maquininha'],['din','Dinheiro'],['gas','Gasolina']].map(([campo, lbl]) => (
                              <div key={campo} className="motoboy-campo">
                                <span>{lbl}</span>
                                <input type="number" placeholder="0" value={m[campo] || ''}
                                  onChange={e => editarMotoboy(i, campo, e.target.value)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Erros de validação */}
            {Object.keys(erros).length > 0 && (
              <div className="fc-toast-erro">
                {erros.vendaSist || erros.vendaDelivery}
              </div>
            )}

            <button className="btn btn--calcular" onClick={calcular}>
              Calcular fechamento
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            RESULTADO
        ══════════════════════════════════════════════════════ */}
        {etapa === 'resultado' && relatorio && (
          <div ref={resultadoRef} className="fc-fade">

            <div ref={conteudoRef} className="fc-resultado-wrap">
              {/* Banner */}
              <div className={`fc-banner ${positivo ? 'fc-banner--ok' : 'fc-banner--alerta'}`}>
                <span className="fc-banner-icon">{positivo ? <IconCheck /> : <IconAlert />}</span>
                <div className="fc-banner-info">
                  <strong>{positivo ? 'Caixa fechado!' : 'Divergência encontrada'}</strong>
                  <span>{positivo ? 'Tudo confere.' : 'Verifique os valores.'}</span>
                  <span className="fc-banner-data">{relatorio.dataFechamento}</span>
                </div>
                <span className={`fc-banner-total ${positivo ? 'fc-banner-total--ok' : 'fc-banner-total--alerta'}`}>
                  R$ {fmt(relatorio.totalGeral)}
                </span>
              </div>

              {/* Cards de resumo */}
              <div className="fc-resumo-grid">

                {/* Card Salão */}
                <div className="fc-card fc-card--salao">
                  <div className="fc-card-header fc-card-header--salao"><IconStore /> Salão</div>
                  <div className="fc-resumo-body">
                    <LinhaResumo label="Vendas mesas"         value={relatorio.sistSalao} />
                    <LinhaResumo label="Retirada líquida"     value={relatorio.pixRetiradaAuto} sub />
                    <LinhaResumo label="Total esperado"       value={relatorio.totalVendasSalao} destaque />
                    <div className="fc-divider" />
                    <LinhaResumo label="Dinheiro (bruto)"     value={relatorio.dinheiroGaveta - relatorio.trocoInicial} sub />
                    <LinhaResumo label="Maquininha salão"     value={relatorio.maqSalao} sub />
                    <LinhaResumo label="Maquininha retirada"  value={relatorio.maqRetirada} sub />
                    <LinhaResumo label="Excedente func."      value={relatorio.excedente} sub />
                    <LinhaResumo label="Total realizado"      value={relatorio.realSalao} destaque />
                    <div className="fc-divider" />
                    <LinhaResumo label="Diferença"            value={relatorio.difSalao} destaque />
                  </div>
                </div>

                {/* Card Delivery */}
                <div className="fc-card fc-card--delivery">
                  <div className="fc-card-header fc-card-header--delivery"><IconBike /> Delivery</div>
                  <div className="fc-resumo-body">
                    <LinhaResumo label="Web Cardápio" value={relatorio.pixWebAuto} sub />
                    <LinhaResumo label="Brendi Açaí Brendi"  value={relatorio.pixBundiAAuto} sub />
                    <LinhaResumo label="Brendi Pizza/Hamb"   value={relatorio.pixBundiBAuto} sub />
                    <LinhaResumo label="Total esperado"         value={relatorio.sistDeliv} destaque />
                    <div className="fc-divider" />
                    <LinhaResumo label="Maquininhas"            value={motoboys.reduce((s,m) => s+m.maq, 0)} sub />
                    <LinhaResumo label="Dinheiro"               value={motoboys.reduce((s,m) => s+m.din, 0)} sub />
                    <LinhaResumo label="Gasolina"               value={relatorio.totalGasEnt} sub />
                    <LinhaResumo label="Total realizado"        value={relatorio.realDelivLiq} destaque />
                    <div className="fc-divider" />
                    <LinhaResumo label="Diferença" value={relatorio.difDeliv} destaque />
                  </div>
                  {motoboys.length > 0 && (
                    <>
                      <div className="fc-divider" style={{ margin: '16px 0' }} />
                      <span className="fc-secao-label">Por motoboy</span>
                      {motoboys.map((m, i) => (
                        <div key={i} className="motoboy-resumo">
                          <div className="motoboy-avatar sm">{m.nome.charAt(0).toUpperCase()}</div>
                          <span className="motoboy-resumo-nome">{m.nome}</span>
                          <span className="motoboy-resumo-qtd">{m.qtd} entregas</span>
                          <span className="motoboy-resumo-total">R$ {fmt(m.maq + m.din + m.gas)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* Status de salvamento */}
            {salvando && <p className="fc-status">Salvando no servidor...</p>}
            {erroSalvar && <p className="fc-status fc-status--erro">{erroSalvar}</p>}

            {/* Ações */}
            <div className="fc-acoes">
              <button className="btn btn--ghost" onClick={() => setEtapa('formulario')}>
                ← Voltar e editar
              </button>
              <button className="btn btn--copiar" onClick={copiarImagem} disabled={copiando}>
                {copiando ? '⏳ Gerando...' : copiado ? <><IconCheck /> Copiado!</> : <><IconCamera /> Copiar p/ WhatsApp</>}
              </button>
              <button className="btn btn--ghost" onClick={() => setConfirmarNovo(true)}>
                <IconRefresh /> Novo fechamento
              </button>
            </div>
          </div>
        )}

      </main>

      {confirmarNovo && (
        <Modal
          titulo="Iniciar novo fechamento?"
          mensagem="Os campos serão limpos. O fechamento atual já foi salvo."
          onConfirmar={novoFechamento}
          onCancelar={() => setConfirmarNovo(false)}
        />
      )}
    </div>
  );
}
