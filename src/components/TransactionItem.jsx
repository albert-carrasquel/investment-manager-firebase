import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const TransactionItem = ({ transaction, onDelete, userNames = {} }) => {
  const isCompra = transaction.tipoOperacion === 'compra';
  const typeClass = isCompra ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  const Icon = isCompra ? ArrowUpRight : ArrowDownLeft;
  const sourceDate = transaction.fechaTransaccion || transaction.fecha;
  const formattedDate = sourceDate instanceof Date
    ? sourceDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Cargando fecha...';
  const userName = userNames[transaction.usuarioId] || 'Usuario';
  const token = (transaction.activo || '').toUpperCase();
  const moneda = transaction.moneda || 'ARS';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition duration-150 ease-in-out">
      <div className="flex items-center space-x-3 min-w-0">
        <div className={`p-2 rounded-full ${typeClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate">{transaction.nombreActivo || token}</p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
          <p className="text-xs text-indigo-700 font-bold">Token: {token}</p>
          <p className="text-xs text-gray-700">Usuario: {userName}</p>
          <p className="text-xs text-gray-700">Tipo: {isCompra ? 'Compra' : 'Venta'}</p>
          <p className="text-xs text-gray-700">Cantidad: {transaction.cantidad}</p>
          <p className="text-xs text-gray-700">Precio Unitario: {formatCurrency(transaction.precioUnitario, moneda)}</p>
          <p className="text-xs text-gray-700">Moneda: {moneda}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 mt-2 md:mt-0">
        <p className={`font-bold text-lg ${isCompra ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(transaction.montoTotal || 0, moneda)}</p>
        <button onClick={() => onDelete(transaction.id)} className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition duration-150" title="Eliminar Transacción">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;
