import React, { useState, useEffect, useRef } from 'react';
import "./fechamento.css";
import logo from '/img/logo.png';
import html2canvas from 'html2canvas';

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
const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const STEPS = ['Caixa', 'Resultado'];
const STEP_MAP = { formulario: 0, resultado: 1 };

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

const ResumoRow = ({ label, value, accent, sub }) => (
  <div className={`resumo-row ${sub ? 'sub' : ''} ${accent ? 'accent' : ''}`}>
    <span className="resumo-label">{label}</span>
    <span className="resumo-val">R$ {Number(value).toFixed(2)}</span>
  </div>
);

const obterDataFechamento = () => {
  const agora = new Date();
  const hora = agora.getHours();
  const data = hora < 17 ? new Date(agora.setDate(agora.getDate() - 1)) : agora;
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const Fechamento = () => {
  const [etapa, setEtapa] = useState('formulario');
  const [salao, setSalao] = useState({ vendaSist: 0, inicial: 0, maq: 0, din: 0, excedente: 0 });
  const [delivery, setDelivery] = useState({ vendaWeb: 0, vendaBundi: 0, maqRetirada: 0 });
  const [dadosMotoboys, setDadosMotoboys] = useState([
    { nome: 'Entregador 1', qtd: 0, maq: 0, din: 0, gas: 0 }
  ]);
  const [relatorio, setRelatorio] = useState(null);
  const [copiando, setCopiando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const resultadoRef = useRef(null);
  const conteudoRef = useRef(null);

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
      dataFechamento: obterDataFechamento(),
    });
    setEtapa('resultado');
  };

  const copiarComoImagem = async () => {
    const elemento = conteudoRef.current;
    if (!elemento) return;
    setCopiando(true);
    try {
      const canvas = await html2canvas(elemento, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 3000);
        } catch {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'fechamento.png';
          a.click();
          URL.revokeObjectURL(url);
        } finally {
          setCopiando(false);
        }
      });
    } catch {
      setCopiando(false);
    }
  };

  useEffect(() => {
    if (etapa === 'resultado' && resultadoRef.current) {
      setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [etapa]);

  const positivo = relatorio && Math.abs(relatorio.totalGeral) < 1;

  return (
    <div className="fc-root">
      <header className="fc-header">
        <img src={logo} alt="Logo" className="fc-logo" />
        <Stepper etapa={etapa} />
      </header>

      <main className="fc-main">

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
                  <Field label="Vendas totais (mesas)" value={salao.vendaSist}
                    onChange={e => setSalao({ ...salao, vendaSist: Number(e.target.value) })} />
                </div>
                <div className="section-divider" />
                <div className="section-block">
                  <p className="section-label">Caixa físico</p>
                  <Field label="Troco inicial" hint="valor que estava na gaveta ao abrir"
                    value={salao.inicial} onChange={e => setSalao({ ...salao, inicial: Number(e.target.value) })} />
                  <Field label="Maquininha" value={salao.maq}
                    onChange={e => setSalao({ ...salao, maq: Number(e.target.value) })} />
                  <Field label="Dinheiro na gaveta" value={salao.din}
                    onChange={e => setSalao({ ...salao, din: Number(e.target.value) })} />
                </div>
                <div className="section-divider" />
                <div className="section-block">
                  <p className="section-label">Deduções</p>
                  <Field label="Excedente funcionários" value={salao.excedente}
                    onChange={e => setSalao({ ...salao, excedente: Number(e.target.value) })} />
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
                  <Field label="Web Cardápio" value={delivery.vendaWeb}
                    onChange={e => setDelivery({ ...delivery, vendaWeb: Number(e.target.value) })} />
                  <Field label="App Brendi" value={delivery.vendaBundi}
                    onChange={e => setDelivery({ ...delivery, vendaBundi: Number(e.target.value) })} />
                </div>
                <div className="section-divider" />
                <div className="section-block">
                  <p className="section-label">Retirada no balcão</p>
                  <Field label="Maquininha balcão" value={delivery.maqRetirada}
                    onChange={e => setDelivery({ ...delivery, maqRetirada: Number(e.target.value) })} />
                </div>
                <div className="section-divider" />
                <div className="section-block">
                  <div className="motoboy-section-header">
                    <p className="section-label" style={{ margin: 0 }}>Acerto dos motoboys</p>
                    <div className="motoboy-counter">
                      <button className="counter-btn"
                        onClick={() => { if (dadosMotoboys.length <= 1) return; setDadosMotoboys(prev => prev.slice(0, -1)); }}
                        disabled={dadosMotoboys.length <= 1}>−</button>
                      <span className="counter-val">{dadosMotoboys.length}</span>
                      <button className="counter-btn"
                        onClick={() => setDadosMotoboys(prev => [
                          ...prev, { nome: `Entregador ${prev.length + 1}`, qtd: 0, maq: 0, din: 0, gas: 0 }
                        ])}>+</button>
                    </div>
                  </div>
                  {dadosMotoboys.map((m, i) => (
                    <div key={i} className="motoboy-card">
                      <div className="motoboy-header">
                        <div className="motoboy-avatar">{m.nome.charAt(0).toUpperCase()}</div>
                        <input type="text" className="motoboy-nome-input" value={m.nome}
                          placeholder={`Entregador ${i + 1}`}
                          onChange={e => {
                            setDadosMotoboys(prev => {
                              const next = [...prev];
                              next[i] = { ...next[i], nome: e.target.value };
                              return next;
                            });
                          }} />
                      </div>
                      <div className="motoboy-fields">
                        <div className="moto-field">
                          <span className="moto-lbl">Entregas</span>
                          <input type="number" placeholder="0" value={m.qtd || ''}
                            onChange={e => handleMotoboyChange(i, 'qtd', e.target.value)} />
                        </div>
                        <div className="moto-field">
                          <span className="moto-lbl">Maquininha</span>
                          <input type="number" placeholder="0" value={m.maq || ''}
                            onChange={e => handleMotoboyChange(i, 'maq', e.target.value)} />
                        </div>
                        <div className="moto-field">
                          <span className="moto-lbl">Dinheiro</span>
                          <input type="number" placeholder="0" value={m.din || ''}
                            onChange={e => handleMotoboyChange(i, 'din', e.target.value)} />
                        </div>
                        <div className="moto-field">
                          <span className="moto-lbl">Gasolina</span>
                          <input type="number" placeholder="0" value={m.gas || ''}
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

        {etapa === 'resultado' && relatorio && (
          <div ref={resultadoRef} className="anima-fade" style={{ width: '100%' }}>

            {/* Apenas esta div é capturada na imagem */}
            <div ref={conteudoRef} style={{ padding: '16px', background: '#0f172a', borderRadius: '14px' }}>
              <div className={`resultado-banner ${positivo ? 'banner--ok' : 'banner--alerta'}`}>
                <span className="banner-icon">{positivo ? <IconCheck /> : <IconAlert />}</span>
                <div className="banner-info">
                  <p className="banner-titulo">{positivo ? 'Caixa fechado!' : 'Divergência encontrada'}</p>
                  <p className="banner-sub">{positivo ? 'Tudo confere.' : 'Verifique os valores abaixo.'}</p>
                  <p className="banner-data">{relatorio.dataFechamento}</p>
                </div>
                <span className={`banner-valor ${positivo ? 'val--ok' : 'val--alerta'}`}>
                  R$ {relatorio.totalGeral.toFixed(2)}
                </span>
              </div>

              <div className="fc-grid" style={{ marginTop: 16 }}>
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
                    <ResumoRow label="Diferença" value={relatorio.difSalao} accent />
                  </div>
                </div>

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
                          <span className="motoboy-total">R$ {(m.maq + m.din + m.gas).toFixed(2)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Botões fora da captura */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-icon" onClick={() => setEtapa('formulario')}>
                ← Voltar e editar
              </button>
              <button
                className={`btn btn-icon ${copiado ? 'btn-copiado' : 'btn-copiar'}`}
                onClick={copiarComoImagem}
                disabled={copiando}
              >
                {copiando ? <>⏳ Gerando imagem...</> : copiado ? <><IconCheck /> Copiado!</> : <><IconCamera /> Copiar para WhatsApp</>}
              </button>
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