import React from 'react';
import { X } from 'lucide-react';

const ConfirmationModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all">
      <div className="flex justify-between items-start border-b pb-3 mb-4">
        <h3 className="text-xl font-bold text-red-600">Confirmar Eliminación</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <p className="text-gray-700 mb-6">¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer.</p>
      <div className="flex justify-end space-x-3">
        <button onClick={onCancel} className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancelar</button>
        <button onClick={onConfirm} className="py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition">Eliminar</button>
      </div>
    </div>
  </div>
);

export default ConfirmationModal;
