import { u as useNavigate, r as reactExports, j as jsxRuntimeExports } from './vendor-jF1s2-c6.js';
import { k as supabase } from './index-2KkJ2R-W.js';
/* empty css               */
import './supabase-1T9tw6ve.js';

function RedefinirSenha() {
  const navigate = useNavigate();
  const [senha, setSenha] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [erro, setErro] = reactExports.useState("");
  const [pronto, setPronto] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    if (accessToken && type === "recovery") {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) setErro("Link inválido ou expirado. Solicite um novo.");
        else setPronto(true);
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setPronto(true);
        else setErro("Link inválido ou expirado. Solicite um novo.");
      });
    }
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setErro("");
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setErro("Erro ao redefinir a senha. Tente solicitar um novo link.");
    } else {
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    }
    setLoading(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "login-root", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-logo", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "login-logo-icon", children: "🍔" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "login-logo-text", children: "Big Burguer" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Definir senha" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Escolha uma senha para acessar o sistema" })
    ] }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "login-msg login-msg--erro", children: erro }),
    !pronto && !erro && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { textAlign: "center", color: "var(--muted)" }, children: "Verificando link…" }),
    !pronto && erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "login-links", style: { marginTop: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/login"), children: "Voltar ao login" }) }),
    pronto && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "login-form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-field", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Nova senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            value: senha,
            onChange: (e) => setSenha(e.target.value),
            placeholder: "Mínimo 6 caracteres",
            required: true,
            autoFocus: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "btn-primary", disabled: loading, children: loading ? "Salvando..." : "Salvar senha" })
    ] })
  ] }) });
}

export { RedefinirSenha as default };
