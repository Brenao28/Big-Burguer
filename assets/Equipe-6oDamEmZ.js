import { r as reactExports, j as jsxRuntimeExports } from './vendor-jF1s2-c6.js';
import { T as ToastContext, f as listarFuncionarios, g as convidarFuncionario, h as removerFuncionario } from './index-C6ZEiERR.js';
import './supabase-1T9tw6ve.js';

function SkeletonLista() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "equipe-lista", children: [...Array(3)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sk-card", style: { animationDelay: `${i * 0.1}s`, height: 64 } }, i)) });
}
function ModalConfirmar({ nome, email, onConfirmar, onCancelar, carregando }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "equipe-overlay", onClick: onCancelar, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "equipe-modal-confirm", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "equipe-modal-confirm-titulo", children: "Remover funcionário?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "equipe-modal-confirm-sub", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: nome || email }),
      " perderá acesso ao sistema imediatamente."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "equipe-modal-confirm-btns", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "equipe-btn-cancelar", onClick: onCancelar, disabled: carregando, children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "equipe-btn-remover", onClick: onConfirmar, disabled: carregando, children: carregando ? "Removendo…" : "Remover" })
    ] })
  ] }) });
}
function CardFuncionario({ f, onRemover }) {
  const inicial = (f.nome || f.email || "?")[0].toUpperCase();
  const formatarData = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("pt-BR");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "equipe-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "equipe-avatar", children: inicial }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "equipe-card-info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "equipe-card-nome", children: f.nome || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "equipe-card-email", children: f.email }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "equipe-card-data", children: [
        "desde ",
        formatarData(f.criado_em)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "equipe-btn-lixo",
        onClick: () => onRemover(f),
        title: "Remover funcionário",
        children: "🗑"
      }
    )
  ] });
}
function Equipe() {
  const addToast = reactExports.useContext(ToastContext);
  const [funcionarios, setFuncionarios] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [erro, setErro] = reactExports.useState("");
  const [emailConvite, setEmailConvite] = reactExports.useState("");
  const [nomeConvite, setNomeConvite] = reactExports.useState("");
  const [enviando, setEnviando] = reactExports.useState(false);
  const [removendo, setRemovendo] = reactExports.useState(false);
  const [alvoRemover, setAlvoRemover] = reactExports.useState(null);
  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      const { funcionarios: dados } = await listarFuncionarios();
      setFuncionarios(dados ?? []);
    } catch {
      setErro("Erro ao carregar funcionários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    carregar();
  }, []);
  async function handleConvidar(e) {
    e.preventDefault();
    if (!emailConvite.trim() || !nomeConvite.trim()) return;
    setEnviando(true);
    try {
      await convidarFuncionario(emailConvite.trim(), nomeConvite.trim());
      addToast(`Convite enviado para ${nomeConvite}!`, "ok");
      setEmailConvite("");
      setNomeConvite("");
      setTimeout(carregar, 1500);
    } catch (err) {
      addToast(err.message || "Erro ao enviar convite.", "erro");
    } finally {
      setEnviando(false);
    }
  }
  async function handleConfirmarRemover() {
    if (!alvoRemover) return;
    setRemovendo(true);
    try {
      await removerFuncionario(alvoRemover.id);
      addToast(`${alvoRemover.nome || alvoRemover.email} foi removido.`, "ok");
      setAlvoRemover(null);
      carregar();
    } catch (err) {
      addToast(err.message || "Erro ao remover funcionário.", "erro");
    } finally {
      setRemovendo(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "equipe-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "equipe-cabecalho", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Minha Equipe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "equipe-badge", children: [
        funcionarios.length,
        " funcionário",
        funcionarios.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "equipe-convite-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "equipe-convite-titulo", children: "Convidar funcionário" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "equipe-convite-sub", children: "O funcionário receberá um email para criar a senha e já terá acesso ao sistema." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "equipe-convite-form", onSubmit: handleConvidar, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            className: "equipe-input",
            placeholder: "Nome do funcionário",
            value: nomeConvite,
            onChange: (e) => setNomeConvite(e.target.value),
            disabled: enviando,
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            className: "equipe-input",
            placeholder: "email@funcionario.com",
            value: emailConvite,
            onChange: (e) => setEmailConvite(e.target.value),
            disabled: enviando,
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            className: "equipe-btn-convidar",
            disabled: enviando || !emailConvite.trim() || !nomeConvite.trim(),
            children: enviando ? "Enviando…" : "Enviar convite"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "equipe-secao", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "equipe-secao-titulo", children: "Funcionários ativos" }),
      erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "equipe-erro", children: erro }),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonLista, {}),
      !loading && funcionarios.length === 0 && !erro && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "equipe-vazio", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Nenhum funcionário cadastrado ainda." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "equipe-vazio-sub", children: "Convide alguém usando o formulário acima." })
      ] }),
      !loading && funcionarios.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "equipe-lista", children: funcionarios.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardFuncionario,
        {
          f,
          onRemover: setAlvoRemover
        },
        f.id
      )) })
    ] }),
    alvoRemover && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ModalConfirmar,
      {
        nome: alvoRemover.nome,
        email: alvoRemover.email,
        onConfirmar: handleConfirmarRemover,
        onCancelar: () => setAlvoRemover(null),
        carregando: removendo
      }
    )
  ] });
}

export { Equipe as default };
