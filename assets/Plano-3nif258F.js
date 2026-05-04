import { r as reactExports, j as jsxRuntimeExports } from './vendor-jF1s2-c6.js';
import { u as useAuth, g as criarAssinaturaMp } from './index-2KkJ2R-W.js';
import './supabase-1T9tw6ve.js';

function Plano() {
  const { user, perfil, planoAtivo, recarregarPerfil } = useAuth();
  const [carregando, setCarregando] = reactExports.useState(false);
  const [erro, setErro] = reactExports.useState("");
  const expira = perfil?.plano_expira_em ? new Date(perfil.plano_expira_em).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }) : null;
  async function handleAssinar() {
    setErro("");
    setCarregando(true);
    try {
      const dados = await criarAssinaturaMp({
        userId: user.id,
        userEmail: user.email
      });
      if (!dados.init_point) throw new Error("Link de assinatura não retornado.");
      window.location.href = dados.init_point;
    } catch (err) {
      setErro(err.message || "Erro ao iniciar assinatura. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }
  if (planoAtivo) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plano-root", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "plano-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plano-icon", children: "⭐" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Você é Pro!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "plano-sub", children: "Sua assinatura está ativa e é renovada automaticamente todo mês." }),
      expira && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.infoExpira, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#94a3b8", fontSize: "0.82rem" }, children: "Próxima renovação" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#f1f5f9", fontWeight: 600, fontSize: "0.9rem" }, children: expira })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plano-features", children: features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "plano-feature", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-check", children: "✓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f })
      ] }, f)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plano-badge", style: { background: "rgba(52,211,153,0.1)", borderColor: "rgba(52,211,153,0.3)", color: "#34d399" }, children: "✅ Assinatura ativa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: recarregarPerfil, style: styles.btnSecundario, children: "Atualizar status" })
    ] }) });
  }
  const aindaAtivo = !planoAtivo && perfil?.plano_expira_em && new Date(perfil.plano_expira_em) > /* @__PURE__ */ new Date();
  if (aindaAtivo) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plano-root", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "plano-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plano-icon", children: "⏳" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { children: [
        "Acesso até ",
        expira
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "plano-sub", children: "Sua assinatura foi cancelada, mas você ainda tem acesso até o fim do período pago." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plano-features", children: features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "plano-feature", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-check", children: "✓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f })
      ] }, f)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAssinar, disabled: carregando, style: { ...styles.btnPrimario, opacity: carregando ? 0.7 : 1 }, children: carregando ? "Aguarde..." : "🔄 Reativar assinatura" }),
      erro && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.erro, children: erro })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plano-root", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "plano-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plano-icon", children: "⭐" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Big Burguer Pro" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "plano-sub", children: "Comece grátis por 30 dias. Depois, apenas" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: styles.preco, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.precoValor, children: "R$ 149,90" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: styles.precoSufixo, children: "/mês" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: styles.trialBadge, children: "🎁 Primeiro mês totalmente grátis" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "plano-features", children: features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "plano-feature", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-check", children: "✓" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f })
    ] }, f)) }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.erro, children: erro }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleAssinar,
        disabled: carregando,
        style: { ...styles.btnPrimario, opacity: carregando ? 0.7 : 1, cursor: carregando ? "not-allowed" : "pointer" },
        children: carregando ? "Aguarde..." : "🚀 Começar grátis"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: styles.rodape, children: "Cobrança automática mensal · Cancele quando quiser · Sem multa" })
  ] }) });
}
const features = [
  "Histórico ilimitado de fechamentos",
  "Relatórios e gráficos mensais",
  "Gestão de equipe completa",
  "Exportação em PDF e Excel"
];
const styles = {
  preco: { display: "flex", alignItems: "baseline", gap: 4, margin: "4px 0 8px" },
  precoValor: { fontSize: "2.2rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.04em" },
  precoSufixo: { fontSize: "0.9rem", color: "#64748b" },
  trialBadge: { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", borderRadius: 999, padding: "5px 16px", fontSize: "0.82rem", fontWeight: 600 },
  infoExpira: { width: "100%", background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4, textAlign: "left" },
  btnPrimario: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", borderRadius: 12, color: "#fff", fontSize: "1rem", fontWeight: 700, fontFamily: "'IBM Plex Sans', 'Inter', system-ui, sans-serif", transition: "all 0.2s", marginTop: 4, cursor: "pointer" },
  btnSecundario: { background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#64748b", padding: "8px 16px", fontSize: "0.82rem", fontFamily: "'IBM Plex Sans', 'Inter', system-ui, sans-serif", cursor: "pointer" },
  erro: { color: "#f87171", fontSize: "0.85rem", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "8px 12px", width: "100%", margin: 0 },
  rodape: { fontSize: "0.75rem", color: "#475569", margin: 0 }
};

export { Plano as default };
