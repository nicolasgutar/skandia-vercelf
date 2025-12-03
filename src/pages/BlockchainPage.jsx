import React, { useState, useEffect } from 'react';
import { Loader2, Shield, Activity, CheckCircle, XCircle, Clock, FileText, Hash, Package } from 'lucide-react';

const API_URL = 'https://blockchain.validator.puygroup.com/api/v1/reconciliation';

export default function BlockchainPage() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [txLimit, setTxLimit] = useState(10);
  const [proofLimit, setProofLimit] = useState(10);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else {
      fetchProofs();
    }
  }, [activeTab, txLimit, proofLimit]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/transactions?limit=${txLimit}`);
      if (!response.ok) throw new Error('Error al cargar transacciones');
      const data = await response.json();
      setTransactions(data.data.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProofs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/blockchain-proofs?limit=${proofLimit}`);
      if (!response.ok) throw new Error('Error al cargar pruebas');
      const data = await response.json();
      setProofs(data.data.proofs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PROCESSED: 'bg-green-100 text-green-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      FAILED: 'bg-red-100 text-red-700'
    };
    
    const icons = {
      PROCESSED: CheckCircle,
      CONFIRMED: CheckCircle,
      PENDING: Clock,
      FAILED: XCircle
    };
    
    const Icon = icons[status] || Clock;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      TRANSFER: 'bg-blue-100 text-blue-700',
      MINT: 'bg-purple-100 text-purple-700',
      BURN: 'bg-orange-100 text-orange-700'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blockchain</h1>
          <p className="text-slate-500">Consulta transacciones y pruebas en blockchain</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity size={20} />
            Transacciones
          </button>
          <button
            onClick={() => setActiveTab('proofs')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'proofs'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield size={20} />
            Pruebas Blockchain
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          {activeTab === 'transactions' ? (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-600">Límite:</label>
              <select
                value={txLimit}
                onChange={(e) => setTxLimit(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-600">Límite:</label>
              <select
                value={proofLimit}
                onChange={(e) => setProofLimit(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center text-slate-400">
              <Loader2 size={32} className="animate-spin" />
            </div>
          ) : activeTab === 'transactions' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <th className="px-6 py-3 font-medium">Monto</th>
                    <th className="px-6 py-3 font-medium">Descripción</th>
                    <th className="px-6 py-3 font-medium">Estado</th>
                    <th className="px-6 py-3 font-medium">Origen</th>
                    <th className="px-6 py-3 font-medium">Destino</th>
                    <th className="px-6 py-3 font-medium">Fecha</th>
                    <th className="px-6 py-3 font-medium">Blockchain TX</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        {getTypeBadge(tx.transactionType)}
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-900">
                        {formatAmount(tx.amount)}
                      </td>
                      <td className="px-6 py-3 text-slate-600 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="px-6 py-3">
                        {getStatusBadge(tx.status)}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        <div className="text-xs">
                          <div className="font-medium">{tx.originWallet.walletType}</div>
                          <div className="text-slate-400">{tx.originWallet.uniqueId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {tx.destinationWallet ? (
                          <div className="text-xs">
                            <div className="font-medium">{tx.destinationWallet.walletType}</div>
                            <div className="text-slate-400">{tx.destinationWallet.uniqueId}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-slate-600 text-xs">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-6 py-3">
                        <a 
                          href={`https://explorer.solana.com/tx/${tx.blockchainTxId}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <Hash size={14} />
                          <code className="text-xs font-mono truncate max-w-[150px]">
                            {tx.blockchainTxId}
                          </code>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  <Activity size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No se encontraron transacciones</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Batch ID</th>
                    <th className="px-6 py-3 font-medium">Archivos</th>
                    <th className="px-6 py-3 font-medium">Tasa Validación</th>
                    <th className="px-6 py-3 font-medium">Estado</th>
                    <th className="px-6 py-3 font-medium">Transacción Solana</th>
                    <th className="px-6 py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proofs.map((proof) => (
                    <tr key={proof.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-blue-500" />
                          <span className="font-medium text-slate-900">{proof.batchId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        <div className="text-xs">
                          <div className="font-semibold text-sm">{proof.validFiles}/{proof.totalFiles}</div>
                          <div className="text-slate-400">válidos</div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: proof.validationRate }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-700">{proof.validationRate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {getStatusBadge(proof.status)}
                      </td>
                      <td className="px-6 py-3">
                        <a 
                          href={`https://explorer.solana.com/tx/${proof.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <FileText size={14} />
                          <code className="text-xs font-mono truncate max-w-[200px]">
                            {proof.signature}
                          </code>
                        </a>
                      </td>
                      <td className="px-6 py-3 text-slate-600 text-xs">
                        {formatDate(proof.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {proofs.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  <Shield size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No se encontraron pruebas blockchain</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}