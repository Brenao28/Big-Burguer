/**
 * ResultadoFechamento
 * Componente que renderiza o resultado do fechamento
 * com detalhamento transparente passo a passo dos cálculos.
 */

import React from 'react';
import { IconStore, IconBike, IconCheck, IconAlert, IconCamera, IconRefresh } from "../../components/Icons";
import { fmt } from "../../lib/format";
import { useAuth } from "../../contexts/AuthContext";

// ── Componente: Linha de Cálculo ──────────────────────────────
function LinhaCalculo({ sinal, label, value, destaque, hint }) {
  const val = Number(value) || 0;
  const isZero = val === 0;
  const opacidade = isZero && !destaque ? 'lc--zero' : '';

  return (
    <div className={`lc-linha ${destaque ? 'lc-linha--destaque' : ''} ${opacidade}`}>
      <span className="lc-sinal">{sinal}</span>
      <span className="lc-label">
        {label}
        {hint && <span className="lc-hint"> ({hint})</span>}
      </span>
      <span className={`lc-valor ${val < 0 ? 'lc-valor--neg' : ''}`}>
        R$ {fmt(Math.abs(val))}
      </span>
    </div>
  );
}

// Linha separadora com resultado parcial
function LinhaSoma({ label, value }) {
  const val = Number(value) || 0;
  return (
    <div className="lc-soma">
      <span className="lc-soma-label">{label}</span>
      <span className={`lc-soma-valor ${val < 0 ? 'lc-soma-valor--neg' : val > 0 ? 'lc-soma-valor--pos' : 'lc-soma-valor--zero'}`}>
        {val > 0 ? '+' : val < 0 ? '' : ''}R$ {fmt(val)}
      </span>
    </div>
  );
}

// ── Bloco: Raio-X do Salão ────────────────────────────────────
function RaioXSalao({ relatorio }) {
  const {
    sistSalao, vendaRetirada, pixRetirada, pixRetiradaAuto,
    totalVendasSalao, excedente,
    dinheiroGaveta, trocoInicial, maqSalao, maqRetirada,
    notinhas, abastecimento, realSalao, difSalao,
  } = relatorio;

  return (
    <div className="raio-x-bloco">
      <div className="raio-x-titulo">
        <IconStore />
        <span>Como chegamos na diferença do Salão</span>
      </div>

      <div className="raio-x-passo">
        <span className="raio-x-passo-label">① O que o sistema esperava receber</span>
        <div className="lc-equacao">
          <LinhaCalculo sinal="+" label="Vendas mesas (sistema)" value={sistSalao} />
          <LinhaCalculo
            sinal="+"
            label="Retirada líquida"
            value={pixRetiradaAuto}
            hint={`${fmt(vendaRetirada)} total − ${fmt(pixRetirada)} pix automático`}
          />
          <LinhaSoma label="= Total esperado" value={totalVendasSalao} />
        </div>
      </div>

      <div className="raio-x-passo">
        <span className="raio-x-passo-label">② O que foi realmente apurado</span>
        <div className="lc-equacao">
          <LinhaCalculo
            sinal="+"
            label="Dinheiro na gaveta (bruto)"
            value={dinheiroGaveta - trocoInicial}
            hint={`${fmt(dinheiroGaveta)} gaveta − ${fmt(trocoInicial)} troco inicial`}
          />
          <LinhaCalculo sinal="+" label="Maquininha salão" value={maqSalao} />
          <LinhaCalculo sinal="+" label="Maquininha retirada" value={maqRetirada} />
          <LinhaCalculo sinal="+" label="Notinhas" value={notinhas} hint="pedidos de funcionários não pagos" />
          <LinhaCalculo sinal="+" label="Abastecimento" value={abastecimento} hint="valor retirado para veículos" />
          <LinhaCalculo sinal="−" label="Excedente funcionários" value={excedente} hint="valor cobrado a mais, subtrai no realizado" />
          <LinhaSoma label="= Total realizado" value={realSalao} />
        </div>
      </div>

      <div className="raio-x-passo raio-x-passo--resultado">
        <span className="raio-x-passo-label">③ Diferença</span>
        <div className="lc-equacao">
          <LinhaCalculo sinal=" " label="Total realizado" value={realSalao} />
          <LinhaCalculo sinal="−" label="Total esperado" value={totalVendasSalao} />
          <LinhaSoma label="= Diferença salão" value={difSalao} />
        </div>
        {difSalao < -0.5 && (
          <div className="raio-x-alerta">
            ⚠️ Faltam <strong>R$ {fmt(Math.abs(difSalao))}</strong> no salão.
            Verifique: dinheiro contado errado, troco calculado errado, maquininha não conferida ou notinha esquecida.
          </div>
        )}
        {difSalao > 0.5 && (
          <div className="raio-x-ok">
            ✅ Sobram <strong>R$ {fmt(difSalao)}</strong> no salão. Caixa com saldo positivo.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bloco: Raio-X do Delivery ─────────────────────────────────
function RaioXDelivery({ relatorio, motoboys }) {
  const {
    vendaWeb, pixWeb, pixWebAuto,
    vendaBundiA, pixBundiA, pixBundiAAuto,
    vendaBundiB, pixBundiB, pixBundiBAuto,
    sistDeliv, realDelivLiq, difDeliv,
  } = relatorio;

  return (
    <div className="raio-x-bloco">
      <div className="raio-x-titulo">
        <IconBike />
        <span>Como chegamos na diferença do Delivery</span>
      </div>

      <div className="raio-x-passo">
        <span className="raio-x-passo-label">① O que o sistema esperava receber (excluindo pix automático)</span>
        <div className="lc-equacao">
          <LinhaCalculo sinal="+" label="Web Cardápio líquido" value={pixWebAuto} hint={`${fmt(vendaWeb)} total − ${fmt(pixWeb)} pix automático`} />
          <LinhaCalculo sinal="+" label="Brendi Açaí líquido" value={pixBundiAAuto} hint={`${fmt(vendaBundiA)} total − ${fmt(pixBundiA)} pix automático`} />
          <LinhaCalculo sinal="+" label="Brendi Pizza/Hamb líquido" value={pixBundiBAuto} hint={`${fmt(vendaBundiB)} total − ${fmt(pixBundiB)} pix automático`} />
          <LinhaSoma label="= Total esperado" value={sistDeliv} />
        </div>
      </div>

      <div className="raio-x-passo">
        <span className="raio-x-passo-label">② O que os motoboys trouxeram</span>
        <div className="lc-equacao">
          {motoboys.map((m, i) => {
            const total = (m.maq || 0) + (m.din || 0);
            return (
              <LinhaCalculo
                key={i}
                sinal="+"
                label={m.nome || `Entregador ${i + 1}`}
                value={total}
                hint={`maq R$ ${fmt(m.maq)} + din R$ ${fmt(m.din)}`}
              />
            );
          })}
          <LinhaSoma label="= Total realizado" value={realDelivLiq} />
        </div>
      </div>

      <div className="raio-x-passo raio-x-passo--resultado">
        <span className="raio-x-passo-label">③ Diferença</span>
        <div className="lc-equacao">
          <LinhaCalculo sinal=" " label="Total realizado" value={realDelivLiq} />
          <LinhaCalculo sinal="−" label="Total esperado" value={sistDeliv} />
          <LinhaSoma label="= Diferença delivery" value={difDeliv} />
        </div>
        {difDeliv < -0.5 && (
          <div className="raio-x-alerta">
            ⚠️ Faltam <strong>R$ {fmt(Math.abs(difDeliv))}</strong> no delivery.
            Verifique: motoboy com valor errado, pedido cancelado não descontado ou pix automático informado incorretamente.
          </div>
        )}
        {difDeliv > 0.5 && (
          <div className="raio-x-ok">
            ✅ Sobram <strong>R$ {fmt(difDeliv)}</strong> no delivery.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────
export function ResultadoFechamento({
  resultadoRef,
  conteudoRef,
  relatorio,
  motoboys,
  copiando,
  copiado,
  observacao,
  onObservacaoChange,
  onVoltar,
  onCopiar,
  onNovoFechamento,
}) {
  const { perfil } = useAuth();
  const nomeFuncionario = perfil?.nome || perfil?.email || 'Funcionário';
  const positivo = relatorio && Math.abs(relatorio.totalGeral) < 1;

  return (
    <div ref={resultadoRef} className="fc-fade">
      <div ref={conteudoRef} className="fc-resultado-wrap">

        {/* ── Hero: número grande ── */}
        <div className={`fc-hero ${positivo ? 'fc-hero--ok' : 'fc-hero--alerta'}`}>
          <div className="fc-hero-icone">
            {positivo ? <IconCheck /> : <IconAlert />}
          </div>
          <div className={`fc-hero-valor ${positivo ? 'fc-hero-valor--ok' : 'fc-hero-valor--alerta'}`}>
            R$ {fmt(relatorio.totalGeral)}
          </div>
          <div className="fc-hero-label">
            {positivo ? 'Caixa fechado · Tudo confere' : 'Divergência encontrada'}
          </div>
          <div className="fc-hero-data">{relatorio.dataFechamento}</div>
          <div className="fc-hero-operador">Fechado por: <strong>{nomeFuncionario}</strong></div>
        </div>

        {/* ── Observação (screenshot) ── */}
        {observacao ? (
          <div className="fc-obs-screenshot">
            <span className="fc-obs-screenshot-label">Observação:</span>
            <span className="fc-obs-screenshot-texto">{observacao}</span>
          </div>
        ) : null}
      </div>

      {/* ── Raio-X dos Cálculos ── */}
      <div className="raio-x-wrap">
        <div className="raio-x-painel raio-x-painel--aberto">
          <p className="raio-x-intro">
            Abaixo está o passo a passo de como cada número foi calculado.
            Use isso para identificar exatamente onde está a divergência.
          </p>
          <RaioXSalao relatorio={relatorio} />
          <div className="raio-x-separador" />
          <RaioXDelivery relatorio={relatorio} motoboys={motoboys} />

          <div className="raio-x-bloco raio-x-bloco--final">
            <div className="raio-x-titulo">
              <span>📊 Resumo geral</span>
            </div>
            <div className="lc-equacao">
              <LinhaCalculo sinal=" " label="Diferença salão" value={relatorio.difSalao} />
              <LinhaCalculo sinal="+" label="Diferença delivery" value={relatorio.difDeliv} />
              <LinhaSoma label="= Diferença total" value={relatorio.totalGeral} />
            </div>
            {!positivo && (
              <div className="raio-x-alerta raio-x-alerta--total">
                O caixa fechou com <strong>R$ {fmt(Math.abs(relatorio.totalGeral))}</strong> de
                {relatorio.totalGeral < 0 ? ' falta' : ' sobra'}.
                {relatorio.difSalao < -0.5 && relatorio.difDeliv < -0.5 && ' A divergência está tanto no salão quanto no delivery.'}
                {relatorio.difSalao < -0.5 && relatorio.difDeliv >= -0.5 && ' A divergência está concentrada no salão.'}
                {relatorio.difSalao >= -0.5 && relatorio.difDeliv < -0.5 && ' A divergência está concentrada no delivery.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Campo de Observação ── */}
      <div className="fc-observacao-wrap">
        <label className="fc-observacao-label">Observação (opcional)</label>
        <textarea
          className="fc-observacao-input"
          placeholder="Ex: caixa com moedas separadas, entregador saiu mais cedo..."
          value={observacao}
          onChange={e => onObservacaoChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* ── Botões de Ação ── */}
      <div className="fc-acoes">
        <button className="btn btn--ghost" onClick={onVoltar}>
          ← Voltar e editar
        </button>
        <button className="btn btn--copiar" onClick={onCopiar} disabled={copiando}>
          {copiando ? '⏳ Gerando...' : copiado ? <><IconCheck /> Copiado!</> : <><IconCamera /> Copiar p/ WhatsApp</>}
        </button>
        <button className="btn btn--ghost" onClick={onNovoFechamento}>
          <IconRefresh /> Novo fechamento
        </button>
      </div>

      {/* ── CSS ── */}
      <style>{`
        .raio-x-wrap { margin: 16px 0 8px; }
        .raio-x-painel--aberto {
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .raio-x-intro { margin: 0; font-size: 0.8rem; color: #64748b; line-height: 1.5; }
        .raio-x-separador { height: 1px; background: rgba(255,255,255,0.07); }
        .raio-x-bloco { display: flex; flex-direction: column; gap: 14px; }
        .raio-x-bloco--final {
          padding: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
        }
        .raio-x-titulo { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: #cbd5e1; }
        .raio-x-titulo svg { width: 16px; height: 16px; opacity: 0.7; }
        .raio-x-passo { display: flex; flex-direction: column; gap: 6px; }
        .raio-x-passo-label { font-size: 0.75rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
        .raio-x-passo--resultado .raio-x-passo-label { color: #94a3b8; }
        .lc-equacao { background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
        .lc-linha { display: flex; align-items: baseline; gap: 6px; padding: 3px 0; font-size: 0.82rem; color: #94a3b8; transition: opacity 0.2s; }
        .lc-linha--zero { opacity: 0.38; }
        .lc-linha--destaque { color: #e2e8f0; font-weight: 500; }
        .lc-sinal { width: 14px; text-align: center; flex-shrink: 0; color: #475569; font-weight: 600; font-size: 0.9rem; }
        .lc-label { flex: 1; min-width: 0; }
        .lc-hint { font-size: 0.72rem; color: #475569; font-style: italic; }
        .lc-valor { font-variant-numeric: tabular-nums; font-weight: 500; white-space: nowrap; }
        .lc-valor--neg { color: #f87171; }
        .lc-soma { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.85rem; font-weight: 600; }
        .lc-soma-label { color: #cbd5e1; }
        .lc-soma-valor { font-variant-numeric: tabular-nums; }
        .lc-soma-valor--neg { color: #f87171; }
        .lc-soma-valor--pos { color: #4ade80; }
        .lc-soma-valor--zero { color: #4ade80; }
        .raio-x-alerta { margin-top: 8px; padding: 10px 12px; background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: 8px; font-size: 0.8rem; color: #fca5a5; line-height: 1.5; }
        .raio-x-alerta--total { background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.3); font-size: 0.85rem; }
        .raio-x-ok { margin-top: 8px; padding: 10px 12px; background: rgba(74,222,128,0.07); border: 1px solid rgba(74,222,128,0.2); border-radius: 8px; font-size: 0.8rem; color: #86efac; line-height: 1.5; }
      `}</style>
    </div>
  );
}
