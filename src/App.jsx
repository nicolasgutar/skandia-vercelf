import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ValidationPage from './pages/ValidationPage';
import ValidationPage2 from './pages/ValidationPage2';
import ExtractsPage from './pages/ExtractsPage';
import BlockchainPage from './pages/BlockchainPage';
import BalancesYRezagos from './pages/BalancesYRezagos';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ValidationPage />} />
          <Route path="balances-y-rezagos" element={<BalancesYRezagos />} />
          <Route path="validacion2" element={<ValidationPage2 />} />
          <Route path="extractos" element={<ExtractsPage />} />
          <Route path="blockchain" element={<BlockchainPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
