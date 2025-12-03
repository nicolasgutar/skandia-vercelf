import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ValidationPage from './pages/ValidationPage';
import ExtractsPage from './pages/ExtractsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ValidationPage />} />
          <Route path="extractos" element={<ExtractsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
