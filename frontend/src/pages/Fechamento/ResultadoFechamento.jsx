/**
 * ResultadoFechamento
 * Componente que renderiza o resultado do fechamento
 * ~200 linhas - Reutilizável, testável
 */

import React from 'react';
import { LinhaResumo } from "../../components/LinhaResumo";
import { IconStore, IconBike, IconCheck, IconAlert, IconCamera, IconRefresh } from "../../components/Icons";
import { fmt } from "../../lib/format";
import { useAuth } from "../../contexts/AuthContext";

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
        {/* Número grande centralizado */}
        <div className={`fc-hero ${positivo ? 'fc-hero--ok' : 'fc-hero--alerta'}`}>
          <div className="fc-hero-icone">
            {positivo ? <IconCheck /> : <IconAlert />}
          </div>
          <div
            className={`fc-hero-valor ${
              positivo ? 'fc-hero-valor--ok' : 'fc-hero-valor--alerta'
            }`}
          >
            R$ {fmt(relatorio.totalGeral)}
          </div>
          <div className="fc-hero-label">
            {positivo
              ? 'Caixa fechado · Tudo confere'
              : 'Divergência encontrada'}
          </div>
          <div className="fc-hero-data">{relatorio.dataFechamento}</div>
          <div className="fc-hero-operador">Fechado por: <strong>{nomeFuncionario}</strong></div>
        </div>

        {/* Cards de resumo */}
        <div className="fc-resumo-grid">
          {/* Card Salão */}
          <div className="fc-card fc-card--salao">
            <div className="fc-card-header fc-card-header--salao">
              <IconStore /> Salão
            </div>
            <div className="fc-resumo-body">
              <LinhaResumo label="Vendas mesas" value={relatorio.sistSalao} />
              <LinhaResumo
                label="Retirada líquida"
                value={relatorio.pixRetiradaAuto}
                sub
              />
              <LinhaResumo
                label="Total esperado"
                value={relatorio.totalVendasSalao}
                destaque
              />
              <div className="fc-divider" />
              <LinhaResumo
                label="Dinheiro (bruto)"
                value={relatorio.dinheiroGaveta - relatorio.trocoInicial}
                sub
              />
              <LinhaResumo
                label="Maquininha salão"
                value={relatorio.maqSalao}
                sub
              />
              <LinhaResumo
                label="Maquininha retirada"
                value={relatorio.maqRetirada}
                sub
              />
              <LinhaResumo
                label="Excedente func."
                value={relatorio.excedente}
                sub
              />
              <LinhaResumo
                label="Notinhas"
                value={relatorio.notinhas}
                sub
              />
              <LinhaResumo
                label="Abastecimento"
                value={relatorio.abastecimento}
                sub
              />
              <LinhaResumo
                label="Total realizado"
                value={relatorio.realSalao}
                destaque
              />
              <div className="fc-divider" />
              <LinhaResumo
                label="Diferença"
                value={relatorio.difSalao}
                destaque
              />
            </div>
          </div>

          {/* Card Delivery */}
          <div className="fc-card fc-card--delivery">
            <div className="fc-card-header fc-card-header--delivery">
              <IconBike /> Delivery
            </div>
            <div className="fc-resumo-body">
              <LinhaResumo
                label="Web Cardápio"
                value={relatorio.pixWebAuto}
                sub
              />
              <LinhaResumo
                label="Brendi Açaí"
                value={relatorio.pixBundiAAuto}
                sub
              />
              <LinhaResumo
                label="Brendi Pizza/Hamb"
                value={relatorio.pixBundiBAuto}
                sub
              />
              <LinhaResumo
                label="Total esperado"
                value={relatorio.sistDeliv}
                destaque
              />
              <div className="fc-divider" />
              <LinhaResumo
                label="Maquininhas"
                value={motoboys.reduce((s, m) => s + m.maq, 0)}
                sub
              />
              <LinhaResumo
                label="Dinheiro"
                value={motoboys.reduce((s, m) => s + m.din, 0)}
                sub
              />
              <LinhaResumo
                label="Total realizado"
                value={relatorio.realDelivLiq}
                destaque
              />
              <div className="fc-divider" />
              <LinhaResumo
                label="Diferença"
                value={relatorio.difDeliv}
                destaque
              />
            </div>

            {/* Detalhes por Motoboy */}
            {motoboys.length > 0 && (
              <>
                <div className="fc-divider" style={{ margin: '16px 0' }} />
                <span className="fc-secao-label">Por motoboy</span>
                {motoboys.map((m, i) => (
                  <div key={i} className="motoboy-resumo">
                    <div className="motoboy-avatar sm">
                      {m.nome.charAt(0).toUpperCase()}
                    </div>
                    <span className="motoboy-resumo-nome">{m.nome}</span>
                    <span className="motoboy-resumo-qtd">{m.qtd} entregas</span>
                    <span className="motoboy-resumo-total">
                      R$ {fmt(m.maq + m.din + m.gas)}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        {observacao ? (
          <div className="fc-obs-screenshot">
            <span className="fc-obs-screenshot-label">Observação:</span>
            <span className="fc-obs-screenshot-texto">{observacao}</span>
          </div>
        ) : null}
      </div>

      {/* Campo de Observação */}
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

      {/* Botões de Ação */}
      <div className="fc-acoes">
        <button className="btn btn--ghost" onClick={onVoltar}>
          ← Voltar e editar
        </button>
        <button
          className="btn btn--copiar"
          onClick={onCopiar}
          disabled={copiando}
        >
          {copiando ? (
            '⏳ Gerando...'
          ) : copiado ? (
            <>
              <IconCheck /> Copiado!
            </>
          ) : (
            <>
              <IconCamera /> Copiar p/ WhatsApp
            </>
          )}
        </button>
        <button className="btn btn--ghost" onClick={onNovoFechamento}>
          <IconRefresh /> Novo fechamento
        </button>
      </div>
    </div>
  );
}
