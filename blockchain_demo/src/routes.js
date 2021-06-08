import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Block from './pages/Block';
import Transaction from './pages/Transaction';
import Wallets from './pages/Wallets';

const routes = [
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'block/:id', element: <Block /> },
      { path: 'transaction/:id', element: <Transaction /> },
      { path: 'wallets', element: <Wallets /> },
      { path: '', element: <Dashboard /> },
      { path: '*', element: <NotFound /> }
    ]
  },
];

export default routes;
