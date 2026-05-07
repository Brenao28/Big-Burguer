/**
 * FormularioFechamento
 * Componente que renderiza todo o formulário de entrada
 * ~250 linhas - Reutilizável, testável
 */

import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { Campo } from "../../components/Campo";
import { CalcAuto } from "../../components/CalcAuto";
import { IconStore, IconBike } from "../../components/Icons";
import { fmt, parse } from "../../lib/format";
import { MotoboyNomeInput } from "../../components/MotoboyNomeInput";

// ── Input monetário isolado com estado local de display ──────
// Replica exatamente a lógica do Campo: display local (string) durante
// a digitação, parse para número no onChange, fmt no blur/fora do foco.
function MotoboyInputMonetario({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (!focused) setDisplay(value ? fmt(value) : '');
  }, [value, focused]);

  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder="0,00"
      value={display}
      onFocus={() => {
        setFocused(true);
        setDisplay(value ? String(value).replace('.', ',') : '');
      }}
      onChange={(e) => {
        const raw = e.target.value.replace('.', ',');
        setDisplay(raw);
        onChange(parse(raw));
      }}
      onBlur={() => {
        setFocused(false);
        setDisplay(value ? fmt(value) : '');
      }}
    />
  );
}

// ── Card de motoboy com inputs isolados ──────────────────────
function MotoboyCard({ motoboy: m, index: i, onNomeChange, onCampoChange }) {
  return (
    <div className="motoboy-card">
      <div className="motoboy-topo">
        <div className="motoboy-avatar">
          {m.nome.charAt(0).toUpperCase()}
        </div>
        <MotoboyNomeInput
          value={m.nome}
          placeholder={`Entregador ${i + 1}`}
          onChange={onNomeChange}
        />
      </div>
      <div className="motoboy-campos">
        <div className="motoboy-campo">
          <span>Entregas</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={m.qtd || ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '');
              onCampoChange('qtd', parseInt(raw) || 0);
            }}
          />
        </div>
        <div className="motoboy-campo">
          <span>Maquininha</span>
          <MotoboyInputMonetario value={m.maq} onChange={(v) => onCampoChange('maq', v)} />
        </div>
        <div className="motoboy-campo">
          <span>Dinheiro</span>
          <MotoboyInputMonetario value={m.din} onChange={(v) => onCampoChange('din', v)} />
        </div>
      </div>
    </div>
  );
}

const ABAS = [
  { id: 'salao', label: 'Salão', Icon: IconStore },
  { id: 'delivery', label: 'Delivery', Icon: IconBike },
];

// ── Toggle de Abas ────────────────────────────────────────────
function ToggleAbas({ aba, onChange, subtotais }) {
  const refs = useRef([]);
  const pill = useRef(null);

  useLayoutEffect(() => {
    const idx = ABAS.findIndex((a) => a.id === aba);
    const btn = refs.current[idx];
    if (btn && pill.current) {
      pill.current.style.left = `${btn.offsetLeft}px`;
      pill.current.style.width = `${btn.offsetWidth}px`;
    }
  }, [aba]);

  return (
    <div className="toggle-wrap">
      <div className="toggle">
        <div
          ref={pill}
          className={`toggle-pill toggle-pill--${aba}`}
        />
        {ABAS.map(({ id, label, Icon }, i) => (
          <button
            key={id}
            ref={(el) => (refs.current[i] = el)}
            className={`toggle-btn ${
              aba === id ? 'toggle-btn--ativo' : ''
            }`}
            onClick={() => onChange(id)}
          >
            <Icon /> {label}
            {subtotais[id] > 0 && (
              <span className="toggle-sub">
                R$ {fmt(subtotais[id])}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Formulário Principal ──────────────────────────────────────
export function FormularioFechamento({
  aba,
  onAbaChange,
  salao,
  onSalaoChange,
  delivery,
  onDeliveryChange,
  motoboys,
  onMotoboysChange,
  brendiAtivo,
  onBrendiAtivoChange,
  erros,
  subtotais,
  onTouchStart,
  onTouchEnd,
  onCalcular,
}) {
  function handleSalaoChange(campo, val) {
    onSalaoChange({ ...salao, [campo]: val });
  }

  function handleDeliveryChange(campo, val) {
    onDeliveryChange({ ...delivery, [campo]: val });
  }

  function editarMotoboy(i, campo, val) {
    const next = [...motoboys];
    const parsed = campo === 'nome'
      ? val
      : (typeof val === 'string' && isNaN(Number(val.replace(',', '.'))))
        ? val
        : campo === 'qtd'
          ? (parseInt(val) || 0)
          : (typeof val === 'number' ? val : (parseFloat(String(val).replace(',', '.')) || 0));
    next[i] = { ...next[i], [campo]: parsed };
    onMotoboysChange(next);
  }

  function addMotoboy() {
    onMotoboysChange([
      ...motoboys,
      { nome: ``, qtd: 0, maq: 0, din: 0 },
    ]);
  }

  function removeMotoboy() {
    if (motoboys.length > 1) {
      onMotoboysChange(motoboys.slice(0, -1));
    }
  }

  const abaIdx = ABAS.findIndex((a) => a.id === aba);

  // ── Ajusta altura do viewport sem causar re-render ──────────
  // Usa refs diretas ao invés de state para evitar re-renders durante animação.
  // rAF garante que a medição acontece após o browser pintar o frame,
  // e o debounce no ResizeObserver evita medir enquanto o slide ainda anima.
  const viewportRef = useRef(null);
  const slideRefs   = useRef([]);
  const rafRef      = useRef(null);

  function medirAposTransicao() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const ativo = slideRefs.current[abaIdx];
      if (viewportRef.current && ativo) {
        viewportRef.current.style.height = `${ativo.scrollHeight}px`;
      }
    });
  }

  useLayoutEffect(() => {
    medirAposTransicao();

    const ativo = slideRefs.current[abaIdx];
    if (!ativo || typeof ResizeObserver === 'undefined') return;

    // Debounce de 100ms: só mede depois que o conteúdo parou de mudar,
    // evitando disparos durante a animação do fc-track.
    let debounce;
    const obs = new ResizeObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(medirAposTransicao, 100);
    });
    obs.observe(ativo);

    return () => {
      obs.disconnect();
      clearTimeout(debounce);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [abaIdx, motoboys.length, brendiAtivo]);

  // Remede em resize de janela
  useEffect(() => {
    function onResize() { medirAposTransicao(); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [abaIdx]);

  return (
    <div className="fc-fade">
      <ToggleAbas aba={aba} onChange={onAbaChange} subtotais={subtotais} />

      {/* height controlado via ref (sem state), eliminando re-renders durante transição */}
      <div
        className="fc-viewport"
        ref={viewportRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="fc-track"
          style={{ transform: `translateX(-${abaIdx * 50}%)` }}
        >
          {/* ── Salão ── */}
          <div className="fc-slide" ref={(el) => (slideRefs.current[0] = el)}>
            <div className="fc-card fc-card--salao">
              <div className="fc-card-header fc-card-header--salao">
                <IconStore /> Salão
              </div>

              <div className="fc-secao">
                <span className="fc-secao-label">Vendas mesas</span>
                <Campo
                  label="Venda total"
                  value={salao.vendaSist}
                  erro={erros.vendaSist}
                  onChange={(v) => {
                    handleSalaoChange('vendaSist', v);
                    if (erros.vendaSist) {
                      // Limpa erro
                    }
                  }}
                />
              </div>

              <div className="fc-divider" />

              <div className="fc-secao">
                <span className="fc-secao-label">Caixa físico</span>
                <Campo
                  label="Dinheiro na gaveta"
                  value={salao.din}
                  onChange={(v) => handleSalaoChange('din', v)}
                />
                <Campo
                  label="Troco inicial"
                  hint="valor na gaveta ao abrir caixa"
                  value={salao.inicial}
                  onChange={(v) => handleSalaoChange('inicial', v)}
                />
                <CalcAuto label="Valor bruto" value={salao.din - salao.inicial} />
                <Campo
                  label="Maquininha"
                  value={salao.maq}
                  onChange={(v) => handleSalaoChange('maq', v)}
                />
              </div>

              <div className="fc-divider" />

              <div className="fc-secao">
                <span className="fc-secao-label">Vendas retirada</span>
                <Campo
                  label="Venda total"
                  value={salao.vendaRetirada}
                  onChange={(v) => handleSalaoChange('vendaRetirada', v)}
                />
                <Campo
                  label="Venda em pix automático"
                  value={salao.pixRetirada}
                  onChange={(v) => handleSalaoChange('pixRetirada', v)}
                />
                <CalcAuto
                  label="Valor sem pix automático"
                  value={salao.vendaRetirada - salao.pixRetirada}
                />
                <Campo
                  label="Maquininha"
                  value={salao.maqRetirada}
                  onChange={(v) => handleSalaoChange('maqRetirada', v)}
                />
              </div>

              <div className="fc-divider" />

              <div className="fc-secao">
                <span className="fc-secao-label">Deduções e Ajustes</span>
                <Campo
                  label="Excedente funcionários"
                  hint="valor que sobrou quando funcionário pagou mais"
                  value={salao.excedente}
                  onChange={(v) => handleSalaoChange('excedente', v)}
                />
                <Campo
                  label="Notinhas"
                  hint="pedidos de funcionários não pagos"
                  value={salao.notinhas}
                  onChange={(v) => handleSalaoChange('notinhas', v)}
                />
                <Campo
                  label="Abastecimento"
                  hint="valor retirado para abastecer veículos"
                  value={salao.abastecimento}
                  onChange={(v) => handleSalaoChange('abastecimento', v)}
                />
              </div>
            </div>
          </div>

          {/* ── Delivery ── */}
          <div className="fc-slide" ref={(el) => (slideRefs.current[1] = el)}>
            <div className="fc-card fc-card--delivery">
              <div className="fc-card-header fc-card-header--delivery">
                <IconBike /> Delivery
              </div>

              <div className="fc-secao">
                <span className="fc-secao-label">Web Cardápio</span>
                <Campo
                  label="Valor total de venda"
                  value={delivery.vendaWeb}
                  erro={erros.vendaDelivery}
                  onChange={(v) => handleDeliveryChange('vendaWeb', v)}
                />
                <Campo
                  label="Valor em pix automático"
                  value={delivery.pixWeb}
                  onChange={(v) => handleDeliveryChange('pixWeb', v)}
                />
                <CalcAuto
                  label="Valor sem pix automático"
                  value={delivery.vendaWeb - delivery.pixWeb}
                />
              </div>

              <div className="fc-divider" />

              <div className="fc-secao">
                <div className="brendi-toggle-wrap">
                  <span className="fc-secao-label" style={{ marginBottom: 0 }}>
                    App Brendi
                  </span>
                  <div className="brendi-toggle">
                    <button
                      className={`brendi-btn ${
                        brendiAtivo === 'A' ? 'brendi-btn--ativo' : ''
                      }`}
                      onClick={() => onBrendiAtivoChange('A')}
                    >
                      🍦 Açaí
                    </button>
                    <button
                      className={`brendi-btn ${
                        brendiAtivo === 'B' ? 'brendi-btn--ativo' : ''
                      }`}
                      onClick={() => onBrendiAtivoChange('B')}
                    >
                      🍕 Pizza / Hamburguer
                    </button>
                  </div>
                </div>

                {brendiAtivo === 'A' ? (
                  <>
                    <Campo
                      label="Valor total"
                      value={delivery.vendaBundiA}
                      onChange={(v) =>
                        handleDeliveryChange('vendaBundiA', v)
                      }
                    />
                    <Campo
                      label="Valor em pix automático"
                      value={delivery.pixBundiA}
                      onChange={(v) =>
                        handleDeliveryChange('pixBundiA', v)
                      }
                    />
                    <CalcAuto
                      label="Valor sem pix automático"
                      value={delivery.vendaBundiA - delivery.pixBundiA}
                    />
                  </>
                ) : (
                  <>
                    <Campo
                      label="Valor total"
                      value={delivery.vendaBundiB}
                      onChange={(v) =>
                        handleDeliveryChange('vendaBundiB', v)
                      }
                    />
                    <Campo
                      label="Valor em pix automático"
                      value={delivery.pixBundiB}
                      onChange={(v) =>
                        handleDeliveryChange('pixBundiB', v)
                      }
                    />
                    <CalcAuto
                      label="Valor sem pix automático"
                      value={delivery.vendaBundiB - delivery.pixBundiB}
                    />
                  </>
                )}
              </div>

              <div className="fc-divider" />

              <div className="fc-secao">
                <div className="fc-motoboys-header">
                  <span className="fc-secao-label" style={{ margin: 0 }}>
                    Acerto dos motoboys
                  </span>
                  <div className="fc-counter">
                    <button onClick={removeMotoboy} disabled={motoboys.length <= 1}>
                      −
                    </button>
                    <span>{motoboys.length}</span>
                    <button onClick={addMotoboy}>+</button>
                  </div>
                </div>

                {motoboys.map((m, i) => (
                  <MotoboyCard
                    key={i}
                    motoboy={m}
                    index={i}
                    onNomeChange={(v) => editarMotoboy(i, 'nome', v)}
                    onCampoChange={(campo, num) => editarMotoboy(i, campo, num)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(erros).length > 0 && (
        <div className="fc-toast-erro">
          {erros.vendaSist || erros.vendaDelivery}
        </div>
      )}

      <button className="btn btn--calcular" onClick={onCalcular}>
        Calcular fechamento
      </button>
    </div>
  );
}
