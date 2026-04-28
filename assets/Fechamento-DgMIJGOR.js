import { r as reactExports, j as jsxRuntimeExports } from './vendor-jF1s2-c6.js';
import { T as ToastContext, _ as __vitePreload, c as criarFechamento, u as useAuth } from './index-C6ZEiERR.js';
import { f as fmt, p as parse } from './format-CcxP-_eH.js';
import './supabase-1T9tw6ve.js';

// ── Constantes ────────────────────────────────────────────────
const SALAO_VAZIO = {
  vendaSist: 0,
  inicial: 0,
  maq: 0,
  din: 0,
  excedente: 0,
  vendaRetirada: 0,
  pixRetirada: 0,
  maqRetirada: 0,
};

const DELIVERY_VAZIO = {
  vendaWeb: 0,
  pixWeb: 0,
  vendaBundiA: 0,
  pixBundiA: 0,
  vendaBundiB: 0,
  pixBundiB: 0,
};

const MOTOBOY_NOVO = (n) => ({
  nome: ``,
  qtd: 0,
  maq: 0,
  din: 0,
  gas: 0,
});

const STORAGE_KEY$1 = 'fechamento_rascunho';

// ── Funções Helper ────────────────────────────────────────────
function dataReferencia() {
  const agora = new Date();
  const base =
    agora.getHours() < 17
      ? new Date(agora.setDate(agora.getDate() - 1))
      : agora;
  return base.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function salvarRascunho(data) {
  try {
    sessionStorage.setItem(STORAGE_KEY$1, JSON.stringify(data));
  } catch {}
}

function carregarRascunho() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY$1);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Hook Principal ───────────────────────────────────────────
function useFechamento() {
  const toast = reactExports.useContext(ToastContext);
  const rascunho = carregarRascunho();

  // Estado Principal
  const [etapa, setEtapa] = reactExports.useState('formulario');
  const [aba, setAba] = reactExports.useState('salao');
  const [salao, setSalao] = reactExports.useState(rascunho?.salao || SALAO_VAZIO);
  const [delivery, setDelivery] = reactExports.useState(
    rascunho?.delivery || DELIVERY_VAZIO
  );
  const [motoboys, setMotoboys] = reactExports.useState(
    rascunho?.motoboys || [MOTOBOY_NOVO()]
  );
  const [brendiAtivo, setBrendiAtivo] = reactExports.useState('A');
  const [relatorio, setRelatorio] = reactExports.useState(null);
  const [erros, setErros] = reactExports.useState({});
  const [copiando, setCopiando] = reactExports.useState(false);
  const [copiado, setCopiado] = reactExports.useState(false);
  const [confirmarNovo, setConfirmarNovo] = reactExports.useState(false);

  // Refs
  const toque = reactExports.useRef(null);
  const resultadoRef = reactExports.useRef(null);
  const conteudoRef = reactExports.useRef(null);

  // Persistência
  reactExports.useEffect(() => {
    if (etapa === 'formulario') {
      salvarRascunho({ salao, delivery, motoboys });
    }
  }, [salao, delivery, motoboys, etapa]);

  // Scroll automático ao resultado
  reactExports.useEffect(() => {
    if (etapa === 'resultado' && resultadoRef.current) {
      setTimeout(
        () =>
          resultadoRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          }),
        100
      );
    }
  }, [etapa]);

  // ── Subtotais para toggle ──────────────────────────────────
  const subtotais = {
    salao:
      salao.maq +
      salao.maqRetirada +
      Math.max(0, salao.din - salao.inicial) +
      salao.excedente,
    delivery:
      delivery.vendaWeb -
      delivery.pixWeb +
      delivery.vendaBundiA -
      delivery.pixBundiA +
      delivery.vendaBundiB -
      delivery.pixBundiB,
  };

  // ── Touch para navegação de abas ───────────────────────────
  function onTouchStart(e) {
    toque.current = e.touches[0].clientX;
  }

  function onTouchEnd(e) {
    if (!toque.current) return;
    const diff = toque.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;

    const abas = ['salao', 'delivery'];
    const idx = abas.indexOf(aba);

    if (diff > 0 && idx < abas.length - 1) setAba(abas[idx + 1]);
    if (diff < 0 && idx > 0) setAba(abas[idx - 1]);

    toque.current = null;
  }

  // ── Manipulação de Motoboys ────────────────────────────────
  function editarMotoboy(i, campo, val) {
    setMotoboys((prev) => {
      const next = [...prev];
      next[i] = {
        ...next[i],
        [campo]: campo === 'nome' ? val : Number(val) || 0,
      };
      return next;
    });
  }

  function addMotoboy() {
    setMotoboys((p) => [...p, MOTOBOY_NOVO(p.length + 1)]);
  }

  function removeMotoboy() {
    setMotoboys((p) => (p.length > 1 ? p.slice(0, -1) : p));
  }

  // ── Validação ──────────────────────────────────────────────
  function validar() {
    const e = {};

    if (!salao.vendaSist || salao.vendaSist <= 0) {
      e.vendaSist = 'Informe as vendas do salão';
    }

    const totalDelivery =
      delivery.vendaWeb +
      delivery.vendaBundiA +
      delivery.vendaBundiB;

    if (totalDelivery <= 0) {
      e.vendaDelivery = 'Informe ao menos uma venda de delivery';
    }

    setErros(e);
    return Object.keys(e).length === 0;
  }

  // ── Cálculo Principal ──────────────────────────────────────
  async function calcular() {
    if (!validar()) return;

    const pixRetiradaAuto = salao.vendaRetirada - salao.pixRetirada;
    const totalVendasSalao = salao.vendaSist + pixRetiradaAuto;
    const realSalao =
      salao.din -
      salao.inicial +
      salao.maq +
      salao.maqRetirada +
      salao.excedente;
    const difSalao = realSalao - totalVendasSalao;

    const pixWebAuto = delivery.vendaWeb - delivery.pixWeb;
    const pixBundiAAuto = delivery.vendaBundiA - delivery.pixBundiA;
    const pixBundiBAuto = delivery.vendaBundiB - delivery.pixBundiB;
    const sistDeliv = pixWebAuto + pixBundiAAuto + pixBundiBAuto;

    const totalMaq = motoboys.reduce((s, m) => s + m.maq, 0);
    const totalDin = motoboys.reduce((s, m) => s + m.din, 0);
    const totalGas = motoboys.reduce((s, m) => s + m.gas, 0);
    const realDelivLiq = totalMaq + totalDin + totalGas;
    const difDeliv = realDelivLiq - sistDeliv;

    const dados = {
      sistSalao: salao.vendaSist,
      realSalao,
      excedente: salao.excedente,
      difSalao,
      totalVendasSalao,
      pixRetiradaAuto,
      vendaRetirada: salao.vendaRetirada,
      pixRetirada: salao.pixRetirada,
      maqRetirada: salao.maqRetirada,
      vendaWeb: delivery.vendaWeb,
      pixWeb: delivery.pixWeb,
      pixWebAuto,
      vendaBundiA: delivery.vendaBundiA,
      pixBundiA: delivery.pixBundiA,
      pixBundiAAuto,
      vendaBundiB: delivery.vendaBundiB,
      pixBundiB: delivery.pixBundiB,
      pixBundiBAuto,
      sistDeliv,
      realDelivLiq,
      totalGasEnt: totalGas,
      difDeliv,
      totalGeral: difSalao + difDeliv,
      dataFechamento: dataReferencia(),
      motoboys,
      trocoInicial: salao.inicial,
      maqSalao: salao.maq,
      dinheiroGaveta: salao.din,
    };

    setRelatorio(dados);
    setEtapa('resultado');

    // Salva no servidor
    try {
      await criarFechamento(dados);
      toast?.('Fechamento salvo com sucesso!', 'ok');
    } catch {
      toast?.('Não foi possível salvar no servidor.', 'erro');
    }
  }

  // ── Copiar Imagem para Clipboard ───────────────────────────
  async function copiarImagem() {
    const el = conteudoRef.current;
    if (!el) return;

    setCopiando(true);

    try {
      const { default: html2canvas } = await __vitePreload(async () => { const { default: html2canvas } = await import('./html2canvas.esm-C_tcw68Z.js');return { default: html2canvas }},true              ?[]:void 0);
      const canvas = await html2canvas(el, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiado(true);
          toast?.('Imagem copiada!', 'ok');
          setTimeout(() => setCopiado(false), 3000);
        } catch {
          // Fallback: download
          const url = URL.createObjectURL(blob);
          Object.assign(document.createElement('a'), {
            href: url,
            download: 'fechamento.png',
          }).click();
          URL.revokeObjectURL(url);
        } finally {
          setCopiando(false);
        }
      });
    } catch {
      setCopiando(false);
    }
  }

  // ── Novo Fechamento ───────────────────────────────────────
  function novoFechamento() {
    setSalao(SALAO_VAZIO);
    setDelivery(DELIVERY_VAZIO);
    setMotoboys([MOTOBOY_NOVO()]);
    setRelatorio(null);
    setErros({});
    setEtapa('formulario');
    setAba('salao');
    setConfirmarNovo(false);

    try {
      sessionStorage.removeItem(STORAGE_KEY$1);
    } catch {}
  }

  return {
    // Estado
    etapa,
    aba,
    salao,
    delivery,
    motoboys,
    brendiAtivo,
    relatorio,
    erros,
    copiando,
    copiado,
    confirmarNovo,
    subtotais,

    // Setters
    setEtapa,
    setAba,
    setSalao,
    setDelivery,
    setMotoboys,
    setBrendiAtivo,
    setErros,
    setConfirmarNovo,

    // Refs
    resultadoRef,
    conteudoRef,

    // Métodos
    onTouchStart,
    onTouchEnd,
    editarMotoboy,
    addMotoboy,
    removeMotoboy,
    calcular,
    copiarImagem,
    novoFechamento,
  };
}

function Modal({ titulo, mensagem, onConfirmar, onCancelar, tipo = "confirmacao" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onCancelar, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "modal-titulo", children: titulo }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "modal-sub", children: mensagem }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-acoes", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn btn--ghost", onClick: onCancelar, children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn btn--confirmar", onClick: onConfirmar, children: "Confirmar" })
    ] })
  ] }) });
}

const DENOMINACOES = [
  { v: 200, label: "R$ 200", tipo: "nota" },
  { v: 100, label: "R$ 100", tipo: "nota" },
  { v: 50, label: "R$ 50", tipo: "nota" },
  { v: 20, label: "R$ 20", tipo: "nota" },
  { v: 10, label: "R$ 10", tipo: "nota" },
  { v: 5, label: "R$ 5", tipo: "nota" },
  { v: 2, label: "R$ 2", tipo: "nota" },
  { v: 1, label: "R$ 1", tipo: "moeda" },
  { v: 0.5, label: "R$ 0,50", tipo: "moeda" },
  { v: 0.25, label: "R$ 0,25", tipo: "moeda" },
  { v: 0.1, label: "R$ 0,10", tipo: "moeda" },
  { v: 0.05, label: "R$ 0,05", tipo: "moeda" }
];
function ModoNotas() {
  const [quantidades, setQuantidades] = reactExports.useState(
    () => DENOMINACOES.reduce((acc, d) => ({ ...acc, [d.v]: 0 }), {})
  );
  const setQtd = reactExports.useCallback((v, qtd) => {
    const n = Math.max(0, Math.floor(Number(qtd) || 0));
    setQuantidades((prev) => ({ ...prev, [v]: n }));
  }, []);
  const total = reactExports.useMemo(
    () => DENOMINACOES.reduce((s, d) => s + d.v * (quantidades[d.v] || 0), 0),
    [quantidades]
  );
  const totalNotas = reactExports.useMemo(
    () => DENOMINACOES.reduce((s, d) => s + (quantidades[d.v] || 0), 0),
    [quantidades]
  );
  function limpar() {
    setQuantidades(DENOMINACOES.reduce((acc, d) => ({ ...acc, [d.v]: 0 }), {}));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "calc-notas", "data-testid": "calc-notas", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "calc-notas-lista", children: DENOMINACOES.map((d) => {
      const qtd = quantidades[d.v] || 0;
      const sub = d.v * qtd;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `calc-nota-linha calc-nota-linha--${d.tipo}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "calc-nota-chip", children: d.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "calc-nota-qtd", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "calc-nota-btn",
              onClick: () => setQtd(d.v, qtd - 1),
              "aria-label": "Diminuir",
              "data-testid": `calc-dec-${d.v}`,
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              min: "0",
              inputMode: "numeric",
              className: "calc-nota-input",
              value: qtd === 0 ? "" : qtd,
              placeholder: "0",
              onChange: (e) => setQtd(d.v, e.target.value),
              "data-testid": `calc-qtd-${d.v}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "calc-nota-btn",
              onClick: () => setQtd(d.v, qtd + 1),
              "aria-label": "Aumentar",
              "data-testid": `calc-inc-${d.v}`,
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `calc-nota-sub ${sub > 0 ? "is-ativo" : ""}`, children: [
          "R$ ",
          fmt(sub)
        ] })
      ] }, d.v);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "calc-notas-rodape", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "calc-notas-resumo", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "calc-notas-resumo-label", children: [
          totalNotas,
          " ",
          totalNotas === 1 ? "peça" : "peças"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "calc-notas-resumo-total", "data-testid": "calc-notas-total", children: [
          "R$ ",
          fmt(total)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "calc-acao-secundaria",
          onClick: limpar,
          "data-testid": "calc-notas-limpar",
          children: "Limpar"
        }
      )
    ] })
  ] });
}
function avaliar(expr) {
  if (!expr) return 0;
  const limpa = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, ".").replace(/−/g, "-");
  if (!/^[\d+\-*/.() ]+$/.test(limpa)) throw new Error("Expressão inválida");
  const r = Function(`"use strict"; return (${limpa});`)();
  if (!Number.isFinite(r)) throw new Error("Resultado inválido");
  return r;
}
function ModoNormal() {
  const [expr, setExpr] = reactExports.useState("");
  const [resultado, setResultado] = reactExports.useState(null);
  const [erro, setErro] = reactExports.useState(false);
  const append = reactExports.useCallback((c) => {
    setErro(false);
    setExpr((prev) => {
      if (resultado !== null && /[+\-×÷]/.test(c)) {
        setResultado(null);
        return String(resultado) + c;
      }
      if (resultado !== null) {
        setResultado(null);
        return c;
      }
      if (/[+\-×÷]/.test(c) && /[+\-×÷]$/.test(prev)) {
        return prev.slice(0, -1) + c;
      }
      return prev + c;
    });
  }, [resultado]);
  const backspace = reactExports.useCallback(() => {
    setErro(false);
    if (resultado !== null) {
      setResultado(null);
      setExpr("");
      return;
    }
    setExpr((p) => p.slice(0, -1));
  }, [resultado]);
  const limpar = reactExports.useCallback(() => {
    setErro(false);
    setExpr("");
    setResultado(null);
  }, []);
  const igual = reactExports.useCallback(() => {
    try {
      const r = avaliar(expr);
      setResultado(Math.round(r * 100) / 100);
      setErro(false);
    } catch {
      setErro(true);
    }
  }, [expr]);
  reactExports.useEffect(() => {
    function onKey(e) {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (/^[0-9]$/.test(e.key)) return append(e.key);
      if (e.key === "." || e.key === ",") return append(".");
      if (e.key === "+") return append("+");
      if (e.key === "-") return append("-");
      if (e.key === "*") return append("×");
      if (e.key === "/") return append("÷");
      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        return igual();
      }
      if (e.key === "Backspace") return backspace();
      if (e.key === "Escape") return limpar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [append, igual, backspace, limpar]);
  const BOTOES = [
    ["C", "←", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "="]
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "calc-normal", "data-testid": "calc-normal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `calc-display ${erro ? "is-erro" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "calc-display-expr", "data-testid": "calc-expr", children: expr || " " }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "calc-display-res", "data-testid": "calc-resultado", children: erro ? "Erro" : resultado !== null ? `= R$ ${fmt(resultado)}` : " " })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "calc-teclado", children: BOTOES.flat().map((b) => {
      let cls = "calc-tecla";
      if (["÷", "×", "−", "+"].includes(b)) cls += " calc-tecla--op";
      if (b === "=") cls += " calc-tecla--igual";
      if (b === "C" || b === "←") cls += " calc-tecla--fn";
      if (b === "0") cls += " calc-tecla--wide";
      const onClick = () => {
        if (b === "C") return limpar();
        if (b === "←") return backspace();
        if (b === "=") return igual();
        return append(b);
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: cls,
          onClick,
          "data-testid": `calc-tecla-${b}`,
          children: b
        },
        b
      );
    }) })
  ] });
}
function CalculadoraConteudo() {
  const [modo, setModo] = reactExports.useState("notas");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "calc-modo-toggle", role: "tablist", "aria-label": "Modo de calculadora", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          role: "tab",
          "aria-selected": modo === "notas",
          className: `calc-modo-btn ${modo === "notas" ? "is-ativo" : ""}`,
          onClick: () => setModo("notas"),
          "data-testid": "calc-modo-notas",
          children: "Notas"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          role: "tab",
          "aria-selected": modo === "normal",
          className: `calc-modo-btn ${modo === "normal" ? "is-ativo" : ""}`,
          onClick: () => setModo("normal"),
          "data-testid": "calc-modo-normal",
          children: "Calculadora"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "calc-conteudo", children: modo === "notas" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ModoNotas, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(ModoNormal, {}) })
  ] });
}
function Calculadora() {
  const [aberto, setAberto] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (aberto) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "calc-sidebar", "data-testid": "calc-sidebar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "calc-cabecalho", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Calculadora" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalculadoraConteudo, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: `calc-fab ${aberto ? "is-aberto" : ""}`,
        onClick: () => setAberto((v) => !v),
        "aria-label": "Abrir calculadora",
        "data-testid": "calc-fab",
        children: aberto ? "✕" : /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "2", width: "16", height: "20", rx: "2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "6", x2: "16", y2: "6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "10", x2: "8.01", y2: "10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "10", x2: "12.01", y2: "10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "16", y1: "10", x2: "16.01", y2: "10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "14", x2: "8.01", y2: "14" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "14", x2: "12.01", y2: "14" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "16", y1: "14", x2: "16.01", y2: "14" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "18", x2: "8.01", y2: "18" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "18", x2: "12.01", y2: "18" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "16", y1: "18", x2: "16.01", y2: "18" })
        ] })
      }
    ),
    aberto && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "calc-overlay",
        onClick: () => setAberto(false),
        "data-testid": "calc-overlay",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "calc-sheet", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "calc-cabecalho", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Calculadora" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "calc-fechar",
                onClick: () => setAberto(false),
                "aria-label": "Fechar",
                children: "✕"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalculadoraConteudo, {})
        ] })
      }
    )
  ] });
}

function Campo({ label, hint, value, onChange, erro }) {
  const [focused, setFocused] = reactExports.useState(false);
  const [display, setDisplay] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!focused) setDisplay(value ? fmt(value) : "");
  }, [value, focused]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "campo", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "campo-label", children: [
      label,
      hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "campo-hint", children: hint })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `campo-input ${erro ? "campo-input--erro" : ""} ${focused ? "campo-input--focused" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "campo-prefix", children: "R$" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          inputMode: "decimal",
          value: display,
          placeholder: "0,00",
          onFocus: () => {
            setFocused(true);
            setDisplay(value ? String(value).replace(".", ",") : "");
          },
          onChange: (e) => {
            setDisplay(e.target.value);
            onChange(parse(e.target.value));
          },
          onBlur: () => {
            setFocused(false);
            setDisplay(value ? fmt(value) : "");
          }
        }
      )
    ] }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "campo-erro", children: erro })
  ] });
}

function CalcAuto({ label, value }) {
  const [flash, setFlash] = reactExports.useState(false);
  const prevRef = reactExports.useRef(value);
  reactExports.useEffect(() => {
    if (prevRef.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 500);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `fc-calc-auto ${flash ? "fc-calc-auto--flash" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-calc-label", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "fc-calc-valor", children: [
      "R$ ",
      fmt(Math.max(0, value))
    ] })
  ] });
}

const IconStore = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "9 22 9 12 15 12 15 22" })
] });
const IconBike = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "5.5", cy: "17.5", r: "3.5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "18.5", cy: "17.5", r: "3.5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 6a1 1 0 0 0-1 1v5.5l-5-3.5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 6h5l3 5.5" })
] });
const IconCheck = () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "20 6 9 17 4 12" }) });
const IconAlert = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
] });
const IconRefresh = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "1 4 1 10 7 10" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3.51 15a9 9 0 1 0 .49-3.65" })
] });
const IconCamera = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "13", r: "4" })
] });

const STORAGE_KEY = "bb_nomes_motoboys";
function getNomesSalvos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function salvarNome(nome) {
  const n = nome.trim();
  if (n.length < 2) return;
  const lista = getNomesSalvos();
  if (!lista.includes(n)) {
    lista.push(n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }
}
function removerNome(nome) {
  const lista = getNomesSalvos().filter((n) => n !== nome);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}
function MotoboyNomeInput({ value, onChange, placeholder }) {
  const [aberto, setAberto] = reactExports.useState(false);
  const [nomes, setNomes] = reactExports.useState([]);
  const wrapRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const sugestoes = nomes.filter(
    (n) => n.toLowerCase().includes(value.toLowerCase()) && n !== value.trim()
  );
  const nomeNovo = value.trim().length >= 2 && !nomes.includes(value.trim());
  const mostrarDropdown = aberto && (sugestoes.length > 0 || nomeNovo);
  function handleFocus() {
    setNomes(getNomesSalvos());
    setAberto(true);
  }
  function handleBlur() {
    if (value.trim().length >= 2) {
      salvarNome(value.trim());
      setNomes(getNomesSalvos());
    }
  }
  function selecionarNome(nome) {
    onChange(nome);
    setAberto(false);
  }
  function handleDeletar(e, nome) {
    e.preventDefault();
    e.stopPropagation();
    removerNome(nome);
    setNomes(getNomesSalvos());
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "motoboy-nome-wrap", ref: wrapRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        className: "motoboy-nome",
        type: "text",
        value,
        placeholder,
        onChange: (e) => onChange(e.target.value),
        onFocus: handleFocus,
        onBlur: handleBlur,
        autoComplete: "off"
      }
    ),
    mostrarDropdown && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "motoboy-sugestoes", children: [
      sugestoes.map((nome) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "motoboy-sugestao-item",
          onMouseDown: () => selecionarNome(nome),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "motoboy-sugestao-nome", children: nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "motoboy-sugestao-del",
                title: "Remover nome salvo",
                onMouseDown: (e) => handleDeletar(e, nome),
                children: "✕"
              }
            )
          ]
        },
        nome
      )),
      nomeNovo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "motoboy-sugestao-hint", children: [
        'Pressione Tab ou clique fora para salvar "',
        value.trim(),
        '"'
      ] })
    ] })
  ] });
}

const ABAS = [
  { id: "salao", label: "Salão", Icon: IconStore },
  { id: "delivery", label: "Delivery", Icon: IconBike }
];
function ToggleAbas({ aba, onChange, subtotais }) {
  const refs = reactExports.useRef([]);
  const pill = reactExports.useRef(null);
  reactExports.useLayoutEffect(() => {
    const idx = ABAS.findIndex((a) => a.id === aba);
    const btn = refs.current[idx];
    if (btn && pill.current) {
      pill.current.style.left = `${btn.offsetLeft}px`;
      pill.current.style.width = `${btn.offsetWidth}px`;
    }
  }, [aba]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "toggle-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "toggle", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: pill,
        className: `toggle-pill toggle-pill--${aba}`
      }
    ),
    ABAS.map(({ id, label, Icon }, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        ref: (el) => refs.current[i] = el,
        className: `toggle-btn ${aba === id ? "toggle-btn--ativo" : ""}`,
        onClick: () => onChange(id),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {}),
          " ",
          label,
          subtotais[id] > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "toggle-sub", children: [
            "R$ ",
            fmt(subtotais[id])
          ] })
        ]
      },
      id
    ))
  ] }) });
}
function FormularioFechamento({
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
  onCalcular
}) {
  function handleSalaoChange(campo, val) {
    onSalaoChange({ ...salao, [campo]: val });
  }
  function handleDeliveryChange(campo, val) {
    onDeliveryChange({ ...delivery, [campo]: val });
  }
  function editarMotoboy(i, campo, val) {
    const next = [...motoboys];
    next[i] = {
      ...next[i],
      [campo]: campo === "nome" ? val : Number(val) || 0
    };
    onMotoboysChange(next);
  }
  function addMotoboy() {
    onMotoboysChange([
      ...motoboys,
      { nome: ``, qtd: 0, maq: 0, din: 0, gas: 0 }
    ]);
  }
  function removeMotoboy() {
    if (motoboys.length > 1) {
      onMotoboysChange(motoboys.slice(0, -1));
    }
  }
  const abaIdx = ABAS.findIndex((a) => a.id === aba);
  const viewportRef = reactExports.useRef(null);
  const slideRefs = reactExports.useRef([]);
  const [altura, setAltura] = reactExports.useState("auto");
  reactExports.useLayoutEffect(() => {
    function medir() {
      const ativo2 = slideRefs.current[abaIdx];
      if (ativo2) setAltura(`${ativo2.scrollHeight}px`);
    }
    medir();
    const ativo = slideRefs.current[abaIdx];
    if (!ativo || typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver(medir);
    obs.observe(ativo);
    return () => obs.disconnect();
  }, [abaIdx, motoboys.length, brendiAtivo]);
  reactExports.useEffect(() => {
    function onResize() {
      const ativo = slideRefs.current[abaIdx];
      if (ativo) setAltura(`${ativo.scrollHeight}px`);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [abaIdx]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-fade", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleAbas, { aba, onChange: onAbaChange, subtotais }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fc-viewport",
        ref: viewportRef,
        style: { height: altura },
        onTouchStart,
        onTouchEnd,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "fc-track",
            style: { transform: `translateX(-${abaIdx * 50}%)` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-slide", ref: (el) => slideRefs.current[0] = el, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-card fc-card--salao", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-card-header fc-card-header--salao", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(IconStore, {}),
                  " Salão"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-secao", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-secao-label", children: "Vendas mesas" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Campo,
                    {
                      label: "Venda total",
                      value: salao.vendaSist,
                      erro: erros.vendaSist,
                      onChange: (v) => {
                        handleSalaoChange("vendaSist", v);
                        if (erros.vendaSist) ;
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-divider" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-secao", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-secao-label", children: "Caixa físico" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Campo,
                    {
                      label: "Dinheiro na gaveta",
                      value: salao.din,
                      onChange: (v) => handleSalaoChange("din", v)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Campo,
                    {
                      label: "Troco inicial",
                      hint: "valor na gaveta ao abrir caixa",
                      value: salao.inicial,
                      onChange: (v) => handleSalaoChange("inicial", v)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CalcAuto, { label: "Valor bruto", value: salao.din - salao.inicial }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Campo,
                    {
                      label: "Maquininha",
                      value: salao.maq,
                      onChange: (v) => handleSalaoChange("maq", v)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-divider" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-secao", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-secao-label", children: "Vendas retirada" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Campo,
                    {
                      label: "Venda total",
                      value: salao.vendaRetirada,
                      onChange: (v) => handleSalaoChange("vendaRetirada", v)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Campo,
                    {
                      label: "Venda em pix automático",
                      value: salao.pixRetirada,
                      onChange: (v) => handleSalaoChange("pixRetirada", v)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    CalcAuto,
                    {
                      label: "Valor sem pix automático",
                      value: salao.vendaRetirada - salao.pixRetirada
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Campo,
                    {
                      label: "Maquininha",
                      value: salao.maqRetirada,
                      onChange: (v) => handleSalaoChange("maqRetirada", v)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-divider" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-secao", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-secao-label", children: "Deduções" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Campo,
                    {
                      label: "Excedente funcionários",
                      value: salao.excedente,
                      onChange: (v) => handleSalaoChange("excedente", v)
                    }
                  )
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-slide", ref: (el) => slideRefs.current[1] = el, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-card fc-card--delivery", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-card-header fc-card-header--delivery", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(IconBike, {}),
                  " Delivery"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-secao", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-secao-label", children: "Web Cardápio" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Campo,
                    {
                      label: "Valor total de venda",
                      value: delivery.vendaWeb,
                      erro: erros.vendaDelivery,
                      onChange: (v) => handleDeliveryChange("vendaWeb", v)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Campo,
                    {
                      label: "Valor em pix automático",
                      value: delivery.pixWeb,
                      onChange: (v) => handleDeliveryChange("pixWeb", v)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    CalcAuto,
                    {
                      label: "Valor sem pix automático",
                      value: delivery.vendaWeb - delivery.pixWeb
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-divider" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-secao", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "brendi-toggle-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-secao-label", style: { marginBottom: 0 }, children: "App Brendi" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "brendi-toggle", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          className: `brendi-btn ${brendiAtivo === "A" ? "brendi-btn--ativo" : ""}`,
                          onClick: () => onBrendiAtivoChange("A"),
                          children: "🍦 Açaí"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          className: `brendi-btn ${brendiAtivo === "B" ? "brendi-btn--ativo" : ""}`,
                          onClick: () => onBrendiAtivoChange("B"),
                          children: "🍕 Pizza / Hamburguer"
                        }
                      )
                    ] })
                  ] }),
                  brendiAtivo === "A" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Campo,
                      {
                        label: "Valor total",
                        value: delivery.vendaBundiA,
                        onChange: (v) => handleDeliveryChange("vendaBundiA", v)
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Campo,
                      {
                        label: "Valor em pix automático",
                        value: delivery.pixBundiA,
                        onChange: (v) => handleDeliveryChange("pixBundiA", v)
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CalcAuto,
                      {
                        label: "Valor sem pix automático",
                        value: delivery.vendaBundiA - delivery.pixBundiA
                      }
                    )
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Campo,
                      {
                        label: "Valor total",
                        value: delivery.vendaBundiB,
                        onChange: (v) => handleDeliveryChange("vendaBundiB", v)
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Campo,
                      {
                        label: "Valor em pix automático",
                        value: delivery.pixBundiB,
                        onChange: (v) => handleDeliveryChange("pixBundiB", v)
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CalcAuto,
                      {
                        label: "Valor sem pix automático",
                        value: delivery.vendaBundiB - delivery.pixBundiB
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-divider" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-secao", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-motoboys-header", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-secao-label", style: { margin: 0 }, children: "Acerto dos motoboys" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-counter", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: removeMotoboy, disabled: motoboys.length <= 1, children: "−" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: motoboys.length }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: addMotoboy, children: "+" })
                    ] })
                  ] }),
                  motoboys.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "motoboy-card", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "motoboy-topo", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "motoboy-avatar", children: m.nome.charAt(0).toUpperCase() }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        MotoboyNomeInput,
                        {
                          value: m.nome,
                          placeholder: `Entregador ${i + 1}`,
                          onChange: (v) => editarMotoboy(i, "nome", v)
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "motoboy-campos", children: [
                      ["qtd", "Entregas"],
                      ["maq", "Maquininha"],
                      ["din", "Dinheiro"],
                      ["gas", "Gasolina"]
                    ].map(([campo, lbl]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "motoboy-campo", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lbl }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "number",
                          placeholder: "0",
                          value: m[campo] || "",
                          onChange: (e) => editarMotoboy(i, campo, e.target.value)
                        }
                      )
                    ] }, campo)) })
                  ] }, i))
                ] })
              ] }) })
            ]
          }
        )
      }
    ),
    Object.keys(erros).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-toast-erro", children: erros.vendaSist || erros.vendaDelivery }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn btn--calcular", onClick: onCalcular, children: "Calcular fechamento" })
  ] });
}

function LinhaResumo({ label, value, destaque, sub }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `linha-resumo ${destaque ? "linha-resumo--destaque" : ""} ${sub ? "linha-resumo--sub" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      "R$ ",
      fmt(value)
    ] })
  ] });
}

function ResultadoFechamento({
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
  onNovoFechamento
}) {
  const { perfil } = useAuth();
  const nomeFuncionario = perfil?.nome || perfil?.email || "Funcionário";
  const positivo = relatorio && Math.abs(relatorio.totalGeral) < 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: resultadoRef, className: "fc-fade", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: conteudoRef, className: "fc-resultado-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `fc-hero ${positivo ? "fc-hero--ok" : "fc-hero--alerta"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-hero-icone", children: positivo ? /* @__PURE__ */ jsxRuntimeExports.jsx(IconCheck, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(IconAlert, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `fc-hero-valor ${positivo ? "fc-hero-valor--ok" : "fc-hero-valor--alerta"}`,
            children: [
              "R$ ",
              fmt(relatorio.totalGeral)
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-hero-label", children: positivo ? "Caixa fechado · Tudo confere" : "Divergência encontrada" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-hero-data", children: relatorio.dataFechamento }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-hero-operador", children: [
          "Fechado por: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: nomeFuncionario })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-resumo-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-card fc-card--salao", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-card-header fc-card-header--salao", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconStore, {}),
            " Salão"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-resumo-body", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LinhaResumo, { label: "Vendas mesas", value: relatorio.sistSalao }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Retirada líquida",
                value: relatorio.pixRetiradaAuto,
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Total esperado",
                value: relatorio.totalVendasSalao,
                destaque: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-divider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Dinheiro (bruto)",
                value: relatorio.dinheiroGaveta - relatorio.trocoInicial,
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Maquininha salão",
                value: relatorio.maqSalao,
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Maquininha retirada",
                value: relatorio.maqRetirada,
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Excedente func.",
                value: relatorio.excedente,
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Total realizado",
                value: relatorio.realSalao,
                destaque: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-divider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Diferença",
                value: relatorio.difSalao,
                destaque: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-card fc-card--delivery", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-card-header fc-card-header--delivery", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconBike, {}),
            " Delivery"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-resumo-body", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Web Cardápio",
                value: relatorio.pixWebAuto,
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Brendi Açaí",
                value: relatorio.pixBundiAAuto,
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Brendi Pizza/Hamb",
                value: relatorio.pixBundiBAuto,
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Total esperado",
                value: relatorio.sistDeliv,
                destaque: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-divider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Maquininhas",
                value: motoboys.reduce((s, m) => s + m.maq, 0),
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Dinheiro",
                value: motoboys.reduce((s, m) => s + m.din, 0),
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Gasolina",
                value: relatorio.totalGasEnt,
                sub: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Total realizado",
                value: relatorio.realDelivLiq,
                destaque: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-divider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinhaResumo,
              {
                label: "Diferença",
                value: relatorio.difDeliv,
                destaque: true
              }
            )
          ] }),
          motoboys.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fc-divider", style: { margin: "16px 0" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-secao-label", children: "Por motoboy" }),
            motoboys.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "motoboy-resumo", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "motoboy-avatar sm", children: m.nome.charAt(0).toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "motoboy-resumo-nome", children: m.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "motoboy-resumo-qtd", children: [
                m.qtd,
                " entregas"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "motoboy-resumo-total", children: [
                "R$ ",
                fmt(m.maq + m.din + m.gas)
              ] })
            ] }, i))
          ] })
        ] })
      ] }),
      observacao ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-obs-screenshot", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-obs-screenshot-label", children: "Observação:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "fc-obs-screenshot-texto", children: observacao })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-observacao-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "fc-observacao-label", children: "Observação (opcional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          className: "fc-observacao-input",
          placeholder: "Ex: caixa com moedas separadas, entregador saiu mais cedo...",
          value: observacao,
          onChange: (e) => onObservacaoChange(e.target.value),
          rows: 3
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-acoes", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn btn--ghost", onClick: onVoltar, children: "← Voltar e editar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "btn btn--copiar",
          onClick: onCopiar,
          disabled: copiando,
          children: copiando ? "⏳ Gerando..." : copiado ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconCheck, {}),
            " Copiado!"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconCamera, {}),
            " Copiar p/ WhatsApp"
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "btn btn--ghost", onClick: onNovoFechamento, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconRefresh, {}),
        " Novo fechamento"
      ] })
    ] })
  ] });
}

function Fechamento() {
  const {
    etapa,
    aba,
    salao,
    delivery,
    motoboys,
    brendiAtivo,
    relatorio,
    erros,
    copiando,
    copiado,
    confirmarNovo,
    subtotais,
    setEtapa,
    setAba,
    setSalao,
    setDelivery,
    setMotoboys,
    setBrendiAtivo,
    setConfirmarNovo,
    observacao,
    setObservacao,
    resultadoRef,
    conteudoRef,
    onTouchStart,
    onTouchEnd,
    calcular,
    copiarImagem,
    novoFechamento
  } = useFechamento();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fc-layout", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "fc-main", children: [
        etapa === "formulario" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormularioFechamento,
          {
            aba,
            onAbaChange: setAba,
            salao,
            onSalaoChange: setSalao,
            delivery,
            onDeliveryChange: setDelivery,
            motoboys,
            onMotoboysChange: setMotoboys,
            brendiAtivo,
            onBrendiAtivoChange: setBrendiAtivo,
            erros,
            subtotais,
            onTouchStart,
            onTouchEnd,
            onCalcular: calcular
          }
        ),
        etapa === "resultado" && relatorio && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ResultadoFechamento,
          {
            resultadoRef,
            conteudoRef,
            relatorio,
            motoboys,
            copiando,
            copiado,
            observacao,
            onObservacaoChange: setObservacao,
            onVoltar: () => setEtapa("formulario"),
            onCopiar: copiarImagem,
            onNovoFechamento: () => setConfirmarNovo(true)
          }
        )
      ] }),
      etapa === "formulario" && /* @__PURE__ */ jsxRuntimeExports.jsx(Calculadora, {})
    ] }),
    confirmarNovo && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        titulo: "Iniciar novo fechamento?",
        mensagem: "Os campos serão limpos. O fechamento atual já foi salvo.",
        onConfirmar: novoFechamento,
        onCancelar: () => setConfirmarNovo(false)
      }
    )
  ] });
}

export { Fechamento as default };
