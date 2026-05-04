const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Login-COmLhR-G.js","assets/vendor-jF1s2-c6.js","assets/supabase-1T9tw6ve.js","assets/Login-CwkpzoRI.css","assets/Fechamento-DPCp5rCW.js","assets/format-CcxP-_eH.js","assets/Fechamento-BW6vmn4F.css","assets/Historico-wpi8SA9g.js","assets/Historico-jpdBEvQk.css","assets/Plano-B7iKff8O.js","assets/Plano-XQq3oUCK.css","assets/Equipe-lPQyNv4j.js","assets/Equipe-Cm_FHM0f.css","assets/RedefinirSenha-BCRcdjK6.js"])))=>i.map(i=>d[i]);
import { r as reactExports, j as jsxRuntimeExports, R as React, u as useNavigate, a as useLocation, b as reactDomExports, H as HashRouter, c as Routes, d as Route, N as Navigate, e as ReactDOM } from './vendor-jF1s2-c6.js';
import { c as createClient } from './supabase-1T9tw6ve.js';

true              &&(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
}());

const scriptRel = 'modulepreload';const assetsURL = function(dep) { return "/Big-Burguer/"+dep };const seen = {};const __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (true               && deps && deps.length > 0) {
		document.getElementsByTagName("link");
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises$2) {
			return Promise.all(promises$2.map((p) => Promise.resolve(p).then((value$1) => ({
				status: "fulfilled",
				value: value$1
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		promise = allSettled(deps.map((dep) => {
			dep = assetsURL(dep);
			if (dep in seen) return;
			seen[dep] = true;
			const isCss = dep.endsWith(".css");
			const cssSelector = isCss ? "[rel=\"stylesheet\"]" : "";
			if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}));
	}
	function handlePreloadError(err$2) {
		const e$1 = new Event("vite:preloadError", { cancelable: true });
		e$1.payload = err$2;
		window.dispatchEvent(e$1);
		if (!e$1.defaultPrevented) throw err$2;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};

const url = "https://mnkxmhrqifjhvjcrcpzh.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3htaHJxaWZqaHZqY3JjcHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTY0OTIsImV4cCI6MjA5MTY3MjQ5Mn0.EtLRuVHaUyHja_UZ7XzoUgMVNyOVUpVfBBniS4GmPF0";
const supabase = createClient(url, key);

const AuthContext = reactExports.createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = reactExports.useState(null);
  const [perfil, setPerfil] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [perfilLoading, setPerfilLoading] = reactExports.useState(false);
  async function carregarPerfil(sessionUser, forcarRecarga = false) {
    if (!sessionUser) {
      setPerfil(null);
      sessionStorage.removeItem("bb_perfil");
      return;
    }
    if (!forcarRecarga) {
      const cached = sessionStorage.getItem("bb_perfil");
      if (cached) {
        try {
          setPerfil(JSON.parse(cached));
          return;
        } catch {
          sessionStorage.removeItem("bb_perfil");
        }
      }
    }
    setPerfilLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("perfil", {
        body: { action: "get" }
      });
      if (!error && data) {
        setPerfil(data);
        sessionStorage.setItem("bb_perfil", JSON.stringify(data));
      } else {
        setPerfil(null);
      }
    } catch {
      setPerfil(null);
    } finally {
      setPerfilLoading(false);
    }
  }
  reactExports.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      carregarPerfil(session?.user).finally(() => setLoading(false));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      carregarPerfil(session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);
  const planoAtivo = (() => {
    if (!perfil) return false;
    if (!perfil.plano_ativo) return false;
    if (!perfil.plano_expira_em) return true;
    return new Date(perfil.plano_expira_em) > /* @__PURE__ */ new Date();
  })();
  const value = {
    user,
    perfil,
    loading: loading || perfilLoading,
    isAdmin: perfil?.perfil === "admin",
    isGerente: perfil?.perfil === "gerente",
    isFuncionario: perfil?.perfil === "funcionario",
    planoAtivo,
    recarregarPerfil: () => carregarPerfil(user, true)
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  const ctx = reactExports.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de <AuthProvider>");
  return ctx;
}

// src/lib/api.js
// ─────────────────────────────────────────────────────────────
// Camada de API: todo acesso ao backend passa por aqui.
// O frontend nunca fala diretamente com o banco de dados.
// ─────────────────────────────────────────────────────────────


// ── Helpers ──────────────────────────────────────────────────

/**
 * Chama uma Edge Function do Supabase com autenticação automática.
 * @param {string} fn   Nome da função (ex: 'fechamentos')
 * @param {object} body Payload JSON
 */
async function callFunction(fn, body = {}) {
  const { data, error } = await supabase.functions.invoke(fn, {
    body,
    headers: { 'Content-Type': 'application/json' },
  });
  if (error) {
    // Tenta extrair mensagem de erro do contexto da Edge Function
    const msg = error.context?.json?.error || error.message || 'Erro na requisição';
    throw new Error(msg);
  }
  return data;
}

// ── Auth ─────────────────────────────────────────────────────

/** Login com email + senha */
async function login(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw error;
  return data;
}

/** Criar conta nova (auto-registro — usado pelo gerente na assinatura) */
async function registrar(email, password, nome) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome, perfil: 'gerente' },
      emailRedirectTo: 'https://brenao28.github.io/Big-Burguer/#/login',
    },
  });
  if (error) throw error;
  return data;
}

/** Logout */
async function logout() {
  sessionStorage.removeItem('bb_perfil');
  await supabase.auth.signOut();
}

/** Recuperação de senha por email */
async function recuperarSenha(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://brenao28.github.io/Big-Burguer/auth-redirect.html',
  });
  if (error) throw error;
}

// ── Fechamentos ───────────────────────────────────────────────

/**
 * Registra um novo fechamento de caixa.
 * Passa pelo backend (Edge Function) que valida e salva.
 */
async function criarFechamento(payload) {
  return callFunction('fechamentos', { action: 'criar', ...payload });
}

/**
 * Lista os fechamentos do usuário logado.
 * O backend aplica RLS — gerente vê todos, funcionário só os próprios.
 */
async function listarFechamentos({ pagina = 0, limite = 20 } = {}) {
  return callFunction('fechamentos', { action: 'listar', pagina, limite });
}

/**
 * Deleta um fechamento pelo ID.
 * Gerente deleta qualquer um. Funcionário só deleta o próprio do dia.
 */
async function deletarFechamento(id) {
  return callFunction('fechamentos', { action: 'deletar', id });
}

// ── Equipe (gerente) ──────────────────────────────────────────

/**
 * Convida um funcionário por email.
 * O Supabase envia email com link para o funcionário definir sua senha.
 */
async function convidarFuncionario(email, nome) {
  return callFunction('convidar-funcionario', { email, nome });
}

/**
 * Lista todos os funcionários cadastrados.
 * Apenas o gerente tem acesso.
 */
async function listarFuncionarios() {
  return callFunction('gerenciar-equipe', { action: 'listar' });
}

/**
 * Remove um funcionário do sistema.
 * Apenas o gerente tem acesso.
 */
async function removerFuncionario(funcionarioId) {
  return callFunction('gerenciar-equipe', { action: 'remover', funcionarioId });
}

// ── Mercado Pago — Assinatura ─────────────────────────────────

/**
 * Cria uma assinatura recorrente mensal no Mercado Pago
 * com trial gratuito de 30 dias.
 * Retorna { init_point, assinatura_id, status }
 */
async function criarAssinaturaMp({ userId, userEmail }) {
  return callFunction('criar-assinatura-mp', { userId, userEmail });
}

/**
 * Cancela a assinatura recorrente no Mercado Pago.
 * O acesso continua até plano_expira_em — apenas não renova mais.
 * Retorna { ok: true, plano_expira_em }
 */
async function cancelarAssinatura() {
  return callFunction('cancelar-assinatura', {});
}

// ── Entregadores ──────────────────────────────────────────────

/**
 * Retorna o gerente_id do usuário logado.
 * - Se for gerente: retorna o próprio ID.
 * - Se for funcionário: retorna o gerente_id do perfil dele.
 */
async function resolverGerenteId() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil, error } = await supabase
    .from('perfis')
    .select('perfil, gerente_id')
    .eq('id', user.id)
    .single();
  if (error) throw error;
  // Gerente usa o próprio ID; funcionário usa o gerente_id do seu perfil
  if (perfil.perfil === 'gerente' || perfil.perfil === 'admin') return user.id;
  return perfil.gerente_id;
}

/**
 * Lista todos os nomes de entregadores do grupo (gerente + funcionários).
 * Qualquer membro do grupo vê a mesma lista.
 */
async function listarEntregadores() {
  const gerenteId = await resolverGerenteId();
  const { data, error } = await supabase
    .from('nomes_entregadores')
    .select('id, nome')
    .eq('gerente_id', gerenteId)
    .order('nome', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Salva um novo nome de entregador vinculado ao gerente do grupo.
 * Ignora silenciosamente se o nome já existir.
 */
async function salvarEntregador(nome) {
  const gerenteId = await resolverGerenteId();
  const { error } = await supabase
    .from('nomes_entregadores')
    .upsert({ gerente_id: gerenteId, nome: nome.trim() }, { onConflict: 'gerente_id,nome' });
  if (error) throw error;
}

/** Remove um nome de entregador pelo ID */
async function removerEntregador(id) {
  const { error } = await supabase
    .from('nomes_entregadores')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

const Login = reactExports.lazy(() => __vitePreload(() => import('./Login-COmLhR-G.js'),true              ?__vite__mapDeps([0,1,2,3]):void 0));
const Fechamento = reactExports.lazy(() => __vitePreload(() => import('./Fechamento-DPCp5rCW.js'),true              ?__vite__mapDeps([4,1,5,2,6]):void 0));
const Historico = reactExports.lazy(() => __vitePreload(() => import('./Historico-wpi8SA9g.js'),true              ?__vite__mapDeps([7,1,5,2,8]):void 0));
const Plano = reactExports.lazy(() => __vitePreload(() => import('./Plano-B7iKff8O.js'),true              ?__vite__mapDeps([9,1,2,10]):void 0));
const Equipe = reactExports.lazy(() => __vitePreload(() => import('./Equipe-lPQyNv4j.js'),true              ?__vite__mapDeps([11,1,2,12]):void 0));
const RedefinirSenha = reactExports.lazy(() => __vitePreload(() => import('./RedefinirSenha-BCRcdjK6.js'),true              ?__vite__mapDeps([13,1,2,3]):void 0));
const ToastContext = React.createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = reactExports.useState([]);
  const addToast = reactExports.useCallback((msg, tipo = "ok") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, tipo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ToastContext.Provider, { value: addToast, children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "toast-wrap", children: toasts.map(({ id, msg, tipo }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `toast toast--${tipo}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tipo === "ok" ? "✓" : "✕" }),
      " ",
      msg
    ] }, id)) })
  ] });
}
function Carregando() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tela-carregando", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sk-logo" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sk-linha", style: { width: 180 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sk-linha", style: { width: 120 } })
  ] });
}
function RotaProtegida({ children }) {
  const { user, loading } = useAuth();
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Carregando, {});
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/login", replace: true });
  return children;
}
function GuardaPlano({ children }) {
  const { user, perfil, loading, planoAtivo } = useAuth();
  const location = useLocation();
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Carregando, {});
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/login", replace: true });
  if (!perfil) return /* @__PURE__ */ jsxRuntimeExports.jsx(Carregando, {});
  const aindaAtivo = !perfil.plano_ativo && perfil.plano_expira_em && new Date(perfil.plano_expira_em) > /* @__PURE__ */ new Date();
  if (!planoAtivo && !aindaAtivo && location.pathname !== "/plano") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/plano", replace: true });
  }
  return children;
}
function GuardaGerente({ children }) {
  const { user, perfil, loading } = useAuth();
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Carregando, {});
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/login", replace: true });
  if (perfil && perfil.perfil !== "gerente" && perfil.perfil !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/", replace: true });
  }
  return children;
}
function ModalAssinatura({ onFechar }) {
  const [confirmando, setConfirmando] = reactExports.useState(false);
  const [cancelando, setCancelando] = reactExports.useState(false);
  const { perfil, planoAtivo } = useAuth();
  const addToast = React.useContext(ToastContext);
  async function handleCancelar() {
    setCancelando(true);
    try {
      await cancelarAssinatura();
      addToast("Assinatura cancelada. Acesso mantido até o fim do período.", "ok");
      onFechar();
    } catch (err) {
      addToast(err.message || "Erro ao cancelar assinatura.", "erro");
    } finally {
      setCancelando(false);
      setConfirmando(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", onClick: onFechar, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-assinatura", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-assinatura-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "modal-assinatura-icone", children: "💳" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Assinatura" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-assinatura-status", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `assinatura-badge ${planoAtivo ? "assinatura-badge--ativa" : "assinatura-badge--inativa"}`, children: planoAtivo ? "⭐ Plano Pro — Ativo" : "⚠️ Plano inativo" }),
      perfil?.plano_expira_em && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "assinatura-expira", children: [
        planoAtivo ? "Renova em" : "Acesso até",
        ": ",
        new Date(perfil.plano_expira_em).toLocaleDateString("pt-BR")
      ] })
    ] }),
    !confirmando ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-assinatura-acoes", children: [
      planoAtivo && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "btn-cancelar-assinatura",
          onClick: () => setConfirmando(true),
          children: "Cancelar assinatura"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-fechar-modal", onClick: onFechar, children: "Fechar" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-assinatura-confirmar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Tem certeza? Você perderá o acesso ao sistema ao fim do período pago." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-assinatura-acoes", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "btn-cancelar-assinatura",
            onClick: handleCancelar,
            disabled: cancelando,
            children: cancelando ? "Cancelando…" : "Sim, cancelar"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-fechar-modal", onClick: () => setConfirmando(false), children: "Voltar" })
      ] })
    ] })
  ] }) });
}
function AvatarMenu({ user }) {
  const [aberto, setAberto] = reactExports.useState(false);
  const [modalAssinatura, setModalAssinatura] = reactExports.useState(false);
  const navigate = useNavigate();
  const ref = reactExports.useRef(null);
  const { perfil } = useAuth();
  const isGerente = perfil?.perfil === "gerente" || perfil?.perfil === "admin";
  const inicial = (user?.email?.[0] ?? "?").toUpperCase();
  reactExports.useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "avatar-wrap", ref, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "avatar-btn", onClick: () => setAberto((v) => !v), title: user?.email, children: inicial }),
      aberto && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "avatar-menu", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-menu-email", children: user?.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "avatar-menu-hr" }),
        isGerente && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "avatar-menu-item avatar-menu-item--assinatura",
            onClick: () => {
              setAberto(false);
              setModalAssinatura(true);
            },
            children: "💳 Assinatura"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "avatar-menu-item avatar-menu-item--danger", onClick: async () => {
          setAberto(false);
          await logout();
          navigate("/login");
        }, children: "Sair" })
      ] })
    ] }),
    modalAssinatura && reactDomExports.createPortal(/* @__PURE__ */ jsxRuntimeExports.jsx(ModalAssinatura, { onFechar: () => setModalAssinatura(false) }), document.body)
  ] });
}
const Navbar = reactExports.memo(function Navbar2() {
  const { user, perfil, planoAtivo, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const indicadorRef = reactExports.useRef(null);
  const btnRefs = reactExports.useRef([]);
  const isGerente = perfil?.perfil === "gerente" || perfil?.perfil === "admin";
  const links = [
    { path: "/", label: "Caixa" },
    { path: "/historico", label: "Histórico" },
    ...isGerente ? [{ path: "/equipe", label: "👥 Equipe" }] : []
  ];
  reactExports.useEffect(() => {
    const idx = links.findIndex((l) => l.path === location.pathname);
    const btn = btnRefs.current[idx];
    const ind = indicadorRef.current;
    if (btn && ind) {
      ind.style.left = `${btn.offsetLeft}px`;
      ind.style.width = `${btn.offsetWidth}px`;
      ind.style.opacity = "1";
    } else if (ind) {
      ind.style.opacity = "0";
    }
  }, [location.pathname, planoAtivo, isGerente]);
  if (loading || !user || location.pathname === "/login") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "navbar", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "navbar-logo", onClick: () => navigate("/"), children: "🍔 Big Burguer" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "navbar-links", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: indicadorRef, className: "navbar-indicator" }),
      links.map(({ path, label }, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          ref: (el) => btnRefs.current[i] = el,
          onClick: () => navigate(path),
          className: `navbar-btn${location.pathname === path ? " navbar-btn--ativo" : ""}`,
          children: label
        },
        path
      ))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarMenu, { user })
  ] });
});
function PaginaAnimada({ children }) {
  const location = useLocation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pagina-fade", children }, location.pathname);
}
function AppInner() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Carregando, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaginaAnimada, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Routes, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/login", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Login, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/", element: /* @__PURE__ */ jsxRuntimeExports.jsx(GuardaPlano, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Fechamento, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/historico", element: /* @__PURE__ */ jsxRuntimeExports.jsx(GuardaPlano, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Historico, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/plano", element: /* @__PURE__ */ jsxRuntimeExports.jsx(RotaProtegida, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plano, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/equipe", element: /* @__PURE__ */ jsxRuntimeExports.jsx(GuardaGerente, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Equipe, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/redefinir-senha", element: /* @__PURE__ */ jsxRuntimeExports.jsx(RedefinirSenha, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "*", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/", replace: true }) })
    ] }) }) })
  ] });
}
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(HashRouter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToastProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppInner, {}) }) }) });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);

export { ToastContext as T, __vitePreload as _, recuperarSenha as a, listarEntregadores as b, criarFechamento as c, removerEntregador as d, listarFechamentos as e, deletarFechamento as f, criarAssinaturaMp as g, listarFuncionarios as h, convidarFuncionario as i, removerFuncionario as j, supabase as k, login as l, registrar as r, salvarEntregador as s, useAuth as u };
