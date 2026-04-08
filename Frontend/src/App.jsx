import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Lazy loading para melhor performance e code splitting em apps profissionais
const Fechamento = lazy(() => import('./pages/Fechamento/Fechamento'));
// O Login será importado aqui em breve

// O uso do createBrowserRouter é o padrão recomendado e mais moderno do React Router (v6.4+)
const router = createBrowserRouter([
  {
    path: '/',
    // O Suspense exibe um fallback (ex: um spinner) enquanto o componente é baixado
    element: (
      <Suspense fallback={<div>Carregando página...</div>}>
        <Fechamento />
      </Suspense>
    ),
    // errorElement: <PaginaDeErro />, // Você pode adicionar isso depois para tratar rota não encontrada
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;