import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ValidationPage from './pages/ValidationPage';
import ValidationPage2 from './pages/ValidationPage2';
import ExtractsPage from './pages/ExtractsPage';
import BlockchainPage from './pages/BlockchainPage';
import BalancesYRezagos from './pages/BalancesYRezagos';
import RezagosPage from './pages/RezagosPage';
import ConciliacionesPage from './pages/ConciliacionesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ValidationPage2 />} />
          <Route path="balances-y-rezagos" element={<BalancesYRezagos />} />
          <Route path="validacion2" element={<ValidationPage />} />
          <Route path="extractos" element={<ExtractsPage />} />
          <Route path="blockchain" element={<BlockchainPage />} />
          <Route path="rezagos" element={<RezagosPage />} />
          <Route path="conciliaciones" element={<ConciliacionesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
