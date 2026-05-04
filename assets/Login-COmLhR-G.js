import { u as useNavigate, r as reactExports, j as jsxRuntimeExports } from './vendor-jF1s2-c6.js';
import { l as login, r as registrar, a as recuperarSenha } from './index-BtucOAKh.js';
/* empty css               */
import './supabase-1T9tw6ve.js';

const IconEye = ({ fechado }) => fechado ? /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })
] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" })
] });
function traduzirErro(msg = "") {
  if (msg.includes("Invalid login")) return "Email ou senha incorretos.";
  if (msg.includes("Email not confirmed")) return "Confirme seu email antes de entrar.";
  if (msg.includes("already registered")) return "Este email já está cadastrado.";
  if (msg.includes("Password should")) return "A senha deve ter pelo menos 6 caracteres.";
  if (msg.includes("Too many requests")) return "Muitas tentativas. Aguarde alguns minutos.";
  return "Algo deu errado. Tente novamente.";
}
function Login() {
  const navigate = useNavigate();
  const [modo, setModo] = reactExports.useState("login");
  const [nome, setNome] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [senha, setSenha] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [erro, setErro] = reactExports.useState("");
  const [sucesso, setSucesso] = reactExports.useState("");
  const [verSenha, setVerSenha] = reactExports.useState(false);
  function resetar() {
    setErro("");
    setSucesso("");
  }
  async function handleLogin(e) {
    e.preventDefault();
    resetar();
    setLoading(true);
    try {
      await login(email, senha);
      navigate("/");
    } catch (err) {
      setErro(traduzirErro(err.message));
    } finally {
      setLoading(false);
    }
  }
  async function handleRegistro(e) {
    e.preventDefault();
    resetar();
    setLoading(true);
    try {
      await registrar(email, senha, nome);
      setSucesso("Conta criada! Verifique seu email para confirmar o cadastro.");
      setModo("login");
    } catch (err) {
      setErro(traduzirErro(err.message));
    } finally {
      setLoading(false);
    }
  }
  async function handleRecuperar(e) {
    e.preventDefault();
    resetar();
    setLoading(true);
    try {
      await recuperarSenha(email);
      setSucesso("Email enviado! Verifique sua caixa de entrada.");
    } catch (err) {
      setErro(traduzirErro(err.message));
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "login-root", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-logo", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "login-logo-icon", children: "🍔" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "login-logo-text", children: "Big Burguer" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { children: [
        modo === "login" && "Entrar",
        modo === "registro" && "Criar conta",
        modo === "recuperar" && "Recuperar senha"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        modo === "login" && "Sistema de fechamento de caixa",
        modo === "registro" && "Preencha os dados abaixo",
        modo === "recuperar" && "Enviaremos um link para seu email"
      ] })
    ] }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "login-msg login-msg--erro", children: erro }),
    sucesso && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "login-msg login-msg--ok", children: sucesso }),
    modo === "login" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "login-form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-field", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "seu@email.com",
            required: true,
            autoFocus: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-field", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-senha-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: verSenha ? "text" : "password",
              value: senha,
              onChange: (e) => setSenha(e.target.value),
              placeholder: "••••••",
              required: true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "btn-ver-senha", onClick: () => setVerSenha((v) => !v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconEye, { fechado: verSenha }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "btn-primary", disabled: loading, children: loading ? "Entrando..." : "Entrar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-links", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          resetar();
          setModo("recuperar");
        }, children: "Esqueci a senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          resetar();
          setModo("registro");
        }, children: "Criar conta" })
      ] })
    ] }),
    modo === "registro" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleRegistro, className: "login-form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-field", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Nome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: nome,
            onChange: (e) => setNome(e.target.value),
            placeholder: "Seu nome",
            required: true,
            autoFocus: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-field", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "seu@email.com",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-field", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-senha-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: verSenha ? "text" : "password",
              value: senha,
              onChange: (e) => setSenha(e.target.value),
              placeholder: "Mínimo 6 caracteres",
              required: true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "btn-ver-senha", onClick: () => setVerSenha((v) => !v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconEye, { fechado: verSenha }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "btn-primary", disabled: loading, children: loading ? "Criando conta..." : "Criar conta" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "login-links", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
        resetar();
        setModo("login");
      }, children: "Já tenho conta" }) })
    ] }),
    modo === "recuperar" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleRecuperar, className: "login-form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login-field", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "seu@email.com",
            required: true,
            autoFocus: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "btn-primary", disabled: loading, children: loading ? "Enviando..." : "Enviar link" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "login-links", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
        resetar();
        setModo("login");
      }, children: "Voltar ao login" }) })
    ] })
  ] }) });
}

export { Login as default };
