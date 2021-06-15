import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Block from './pages/Block';
import Transaction from './pages/Transaction';
import Wallets from './pages/Wallets';
import Supply from './pages/Supply';

const routes = [
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'block/:id', element: <Block /> },
      { path: 'transaction/:id', element: <Transaction /> },
      { path: 'wallets', element: <Wallets /> },
      { path: 'supply/:id', element: <Supply /> },
      { path: '', element: <Dashboard /> },
      { path: '*', element: <NotFound /> }
    ]
  },
];

export default routes;
