import React from 'react';

/**
 * Reusable message display component
 * Can be used for success, error, and info messages
 */

const Message = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const baseClasses = 'p-4 rounded-xl mb-4 flex items-center justify-between';
  const typeClasses = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-sm font-medium hover:opacity-70"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Message;
