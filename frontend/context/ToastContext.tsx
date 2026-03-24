"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'loading' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  txHash?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, txHash?: string) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: string, txHash?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message, txHash }]);
    
    if (type !== 'error' && type !== 'loading') {
      setTimeout(() => dismissToast(id), 5000);
    }
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
                toast.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-900' :
                toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-900' :
                toast.type === 'loading' ? 'bg-blue-50/90 border-blue-200 text-blue-900' :
                'bg-gray-50/90 border-gray-200 text-gray-900'
              }`}
            >
              <div className="mt-0.5">
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                {toast.type === 'loading' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-gray-600" />}
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-sm">{toast.message}</p>
                {toast.txHash && (
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${toast.txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs underline mt-1 block opacity-70 hover:opacity-100 transition"
                  >
                    View on Etherscan
                  </a>
                )}
              </div>

              <button 
                onClick={() => dismissToast(toast.id)}
                className="p-1 hover:bg-black/5 rounded-full transition"
              >
                <X className="w-4 h-4 opacity-50" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
