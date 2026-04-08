import React, { useState, useEffect, useRef } from 'react';
import './Fechamento.css';

// ── Ícones SVG inline leves ──────────────────────────────────────────
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconStore = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconBike = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6a1 1 0 0 0-1 1v5.5l-5-3.5"/><path d="M9 6h5l3 5.5"/>
  </svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.65"/>
  </svg>
);

// ── Stepper de progresso ─────────────────────────────────────────────
const STEPS = ['Equipe', 'Nomes', 'Caixa', 'Resultado'];
const STEP_MAP = { setup: 0, nomes: 1, formulario: 2, resultado: 3 };

const Stepper = ({ etapa }) => {
  const current = STEP_MAP[etapa] ?? 0;
  return (
    <div className="stepper">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`step ${i < current ? 'done' : ''} ${i === current ? 'active' : ''}`}>
            <div className="step-dot">
              {i < current ? <IconCheck /> : <span>{i + 1}</span>}
            </div>
            <span className="step-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`step-line ${i < current ? 'done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Campo de input com label embutido ────────────────────────────────
const Field = ({ label, hint, value, onChange, prefix = 'R$', type = 'number' }) => (
  <div className="field">
    <label className="field-label">{label}</label>
    {hint && <span className="field-hint">{hint}</span>}
    <div className="field-input-wrap">
      {prefix && <span className="field-prefix">{prefix}</span>}
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder="0"
        className={prefix ? 'has-prefix' : ''}
      />
    </div>
  </div>
);

// ── Card de resumo no resultado ──────────────────────────────────────
const ResumoRow = ({ label, value, accent, sub }) => (
  <div className={`resumo-row ${sub ? 'sub' : ''} ${accent ? 'accent' : ''}`}>
    <span className="resumo-label">{label}</span>
    <span className="resumo-val">R$ {Number(value).toFixed(2)}</span>
  </div>
);

// ── Componente principal ─────────────────────────────────────────────
const Fechamento = () => {
  const [etapa, setEtapa] = useState('setup');
  const [qtdEntregadores, setQtdEntregadores] = useState('');
  const [nomesEntregadores, setNomesEntregadores] = useState([]);
  const [salao, setSalao] = useState({ vendaSist: 0, inicial: 0, maq: 0, din: 0, excedente: 0 });
  const [delivery, setDelivery] = useState({ vendaWeb: 0, vendaBundi: 0, maqRetirada: 0 });
  const [dadosMotoboys, setDadosMotoboys] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  const resultadoRef = useRef(null);

  const configurarEquipe = () => {
    const n = Number(qtdEntregadores);
    if (!n || n <= 0) return;
    setNomesEntregadores(new Array(n).fill(''));
    setEtapa('nomes');
  };

  const confirmarNomes = () => {
    setDadosMotoboys(
      nomesEntregadores.map(nome => ({
        nome: nome.trim() || 'Entregador',
        qtd: 0, maq: 0, din: 0, gas: 0,
      }))
    );
    setEtapa('formulario');
  };

  const handleMotoboyChange = (index, campo, valor) => {
    setDadosMotoboys(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [campo]: Number(valor) || 0 };
      return next;
    });
  };

  const calcularTudo = () => {
    const realSalao = (salao.din - salao.inicial) + salao.maq;
    const difSalao = (realSalao - salao.excedente) - salao.vendaSist;

    const sistDeliv = delivery.vendaWeb + delivery.vendaBundi;
    const totalMaqEnt = dadosMotoboys.reduce((a, m) => a + m.maq, 0);
    const totalDinEnt = dadosMotoboys.reduce((a, m) => a + m.din, 0);
    const totalGasEnt = dadosMotoboys.reduce((a, m) => a + m.gas, 0);

    const realDelivLiq = delivery.maqRetirada + totalMaqEnt + totalDinEnt;
    const realDeliv = realDelivLiq + totalGasEnt;
    const difDeliv = realDeliv - sistDeliv;

    setRelatorio({
      sistSalao: salao.vendaSist,
      realSalao,
      excedente: salao.excedente,
      difSalao,
      sistDeliv,
      realDelivLiq,
      totalGasEnt,
      difDeliv,
      totalGeral: difSalao + difDeliv,
      motoboys: dadosMotoboys,
    });
    setEtapa('resultado');
  };

  useEffect(() => {
    if (etapa === 'resultado' && resultadoRef.current) {
      setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [etapa]);

  const positivo = relatorio && Math.abs(relatorio.totalGeral) < 1;

  return (
    <div className="fc-root">
      {/* Header */}
      <header className="fc-header">
        <img src="/img/logo.png" alt="Logo" className="fc-logo" />
        {etapa !== 'setup' && <Stepper etapa={etapa} />}
      </header>

      <main className="fc-main">
        {/* ── ETAPA 1: Setup ── */}
        {etapa === 'setup' && (
          <div className="fc-card fc-card--center anima-fade">
            <div className="setup-icon-wrap">
              <IconUsers />
            </div>
            <h2 className="fc-title">Iniciar Fechamento</h2>
            <p className="fc-subtitle">Quantos entregadores trabalharam hoje?</p>
            <input
              type="number"
              value={qtdEntregadores}
              onChange={e => setQtdEntregadores(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && configurarEquipe()}
              className="input-center"
              placeholder="0"
              min="0"
              autoFocus
            />
            <button
              className="btn btn-primary btn-block"
              onClick={configurarEquipe}
              disabled={!qtdEntregadores || Number(qtdEntregadores) <= 0}
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── ETAPA 2: Nomes ── */}
        {etapa === 'nomes' && (
          <div className="fc-card anima-fade" style={{ maxWidth: 460, margin: '0 auto' }}>
            <h2 className="fc-title" style={{ textAlign: 'center' }}>Nome dos entregadores</h2>
            <p className="fc-subtitle" style={{ textAlign: 'center', marginBottom: 20 }}>
              Pode deixar em branco se não souber
            </p>
            <div className="nomes-list">
              {nomesEntregadores.map((_, i) => (
                <div key={i} className="nome-row">
                  <div className="nome-avatar">{i + 1}</div>
                  <input
                    type="text"
                    placeholder={`Entregador ${i + 1}`}
                    onChange={e => {
                      const n = [...nomesEntregadores];
                      n[i] = e.target.value;
                      setNomesEntregadores(n);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="btn-row">
              <button className="btn btn-ghost" onClick={() => setEtapa('setup')}>Voltar</button>
              <button className="btn btn-primary" onClick={confirmarNomes}>Abrir Caixa</button>
            </div>
          </div>
        )}

        {/* ── ETAPA 3: Formulário ── */}
        {etapa === 'formulario' && (
          <div className="anima-fade" style={{ width: '100%' }}>
            <div className="fc-grid">

              {/* SALÃO */}
              <div className="fc-card fc-card--salao">
                <div className="setor-header setor-header--salao">
                  <span className="setor-icon"><IconStore /></span>
                  <span className="setor-title">Salão</span>
                </div>

                <div className="section-block">
                  <p className="section-label">Sistema</p>
                  <Field
                    label="Vendas totais (mesas)"
                    value={salao.vendaSist}
                    onChange={e => setSalao({ ...salao, vendaSist: Number(e.target.value) })}
                  />
                </div>

                <div className="section-divider" />

                <div className="section-block">
                  <p className="section-label">Caixa físico</p>
                  <Field
                    label="Troco inicial"
                    hint="valor que estava na gaveta ao abrir"
                    value={salao.inicial}
                    onChange={e => setSalao({ ...salao, inicial: Number(e.target.value) })}
                  />
                  <Field
                    label="Maquininha"
                    value={salao.maq}
                    onChange={e => setSalao({ ...salao, maq: Number(e.target.value) })}
                  />
                  <Field
                    label="Dinheiro na gaveta"
                    value={salao.din}
                    onChange={e => setSalao({ ...salao, din: Number(e.target.value) })}
                  />
                </div>

                <div className="section-divider" />

                <div className="section-block">
                  <p className="section-label">Deduções</p>
                  <Field
                    label="Excedente funcionários"
                    value={salao.excedente}
                    onChange={e => setSalao({ ...salao, excedente: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* DELIVERY */}
              <div className="fc-card fc-card--delivery">
                <div className="setor-header setor-header--delivery">
                  <span className="setor-icon"><IconBike /></span>
                  <span className="setor-title">Delivery / Retirada</span>
                </div>

                <div className="section-block">
                  <p className="section-label">Vendas online</p>
                  <Field
                    label="Web Cardápio"
                    value={delivery.vendaWeb}
                    onChange={e => setDelivery({ ...delivery, vendaWeb: Number(e.target.value) })}
                  />
                  <Field
                    label="App Bundi"
                    value={delivery.vendaBundi}
                    onChange={e => setDelivery({ ...delivery, vendaBundi: Number(e.target.value) })}
                  />
                </div>

                <div className="section-divider" />

                <div className="section-block">
                  <p className="section-label">Retirada no balcão</p>
                  <Field
                    label="Maquininha balcão"
                    value={delivery.maqRetirada}
                    onChange={e => setDelivery({ ...delivery, maqRetirada: Number(e.target.value) })}
                  />
                </div>

                <div className="section-divider" />

                <div className="section-block">
                  <p className="section-label">Acerto dos motoboys</p>
                  {dadosMotoboys.map((m, i) => (
                    <div key={i} className="motoboy-card">
                      <div className="motoboy-header">
                        <div className="motoboy-avatar">
                          {m.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="motoboy-nome">{m.nome}</span>
                      </div>
                      <div className="motoboy-fields">
                        <div className="moto-field">
                          <span className="moto-lbl">Entregas</span>
                          <input type="number" placeholder="0"
                            onChange={e => handleMotoboyChange(i, 'qtd', e.target.value)} />
                        </div>
                        <div className="moto-field">
                          <span className="moto-lbl">Maquininha</span>
                          <input type="number" placeholder="0"
                            onChange={e => handleMotoboyChange(i, 'maq', e.target.value)} />
                        </div>
                        <div className="moto-field">
                          <span className="moto-lbl">Dinheiro</span>
                          <input type="number" placeholder="0"
                            onChange={e => handleMotoboyChange(i, 'din', e.target.value)} />
                        </div>
                        <div className="moto-field">
                          <span className="moto-lbl">Gasolina</span>
                          <input type="number" placeholder="0"
                            onChange={e => handleMotoboyChange(i, 'gas', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="btn btn-calcular" onClick={calcularTudo}>
              Calcular fechamento
            </button>
          </div>
        )}

        {/* ── ETAPA 4: Resultado ── */}
        {etapa === 'resultado' && relatorio && (
          <div ref={resultadoRef} className="anima-fade" style={{ width: '100%' }}>
            <div className={`resultado-banner ${positivo ? 'banner--ok' : 'banner--alerta'}`}>
              <span className="banner-icon">{positivo ? <IconCheck /> : <IconAlert />}</span>
              <div>
                <p className="banner-titulo">{positivo ? 'Caixa fechado!' : 'Divergência encontrada'}</p>
                <p className="banner-sub">{positivo ? 'Tudo confere.' : 'Verifique os valores abaixo.'}</p>
              </div>
              <span className={`banner-valor ${positivo ? 'val--ok' : 'val--alerta'}`}>
                R$ {relatorio.totalGeral.toFixed(2)}
              </span>
            </div>

            <div className="fc-grid" style={{ marginTop: 16 }}>
              {/* Resumo Salão */}
              <div className="fc-card fc-card--salao">
                <div className="setor-header setor-header--salao">
                  <span className="setor-icon"><IconStore /></span>
                  <span className="setor-title">Salão</span>
                </div>
                <div className="resumo-block">
                  <ResumoRow label="Esperado (sistema)" value={relatorio.sistSalao} />
                  <ResumoRow label="Realizado (caixa)" value={relatorio.realSalao} />
                  <ResumoRow label="Excedente funcionários" value={relatorio.excedente} sub />
                  <div className="resumo-divider" />
                  <ResumoRow
                    label="Diferença"
                    value={relatorio.difSalao}
                    accent
                  />
                </div>
              </div>

              {/* Resumo Delivery */}
              <div className="fc-card fc-card--delivery">
                <div className="setor-header setor-header--delivery">
                  <span className="setor-icon"><IconBike /></span>
                  <span className="setor-title">Delivery</span>
                </div>
                <div className="resumo-block">
                  <ResumoRow label="Esperado (sistema)" value={relatorio.sistDeliv} />
                  <ResumoRow label="Realizado (líquido)" value={relatorio.realDelivLiq} />
                  <ResumoRow label="Gasolina adicionada" value={relatorio.totalGasEnt} sub />
                  <div className="resumo-divider" />
                  <ResumoRow label="Diferença" value={relatorio.difDeliv} accent />
                </div>

                {relatorio.motoboys.length > 0 && (
                  <>
                    <div className="section-divider" style={{ margin: '16px 0' }} />
                    <p className="section-label">Por motoboy</p>
                    {relatorio.motoboys.map((m, i) => (
                      <div key={i} className="motoboy-resumo">
                        <div className="motoboy-avatar sm">{m.nome.charAt(0).toUpperCase()}</div>
                        <span className="motoboy-nome">{m.nome}</span>
                        <span className="motoboy-qtd">{m.qtd} entregas</span>
                        <span className="motoboy-total">
                          R$ {(m.maq + m.din + m.gas).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button className="btn btn-ghost btn-icon" onClick={() => window.location.reload()}>
                <IconRefresh /> Novo fechamento
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Fechamento;