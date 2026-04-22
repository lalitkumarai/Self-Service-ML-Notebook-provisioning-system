import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ show, message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className={`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border ${
            type === 'success' 
              ? 'bg-white border-green-100 text-green-800' 
              : 'bg-white border-red-100 text-red-800'
          }`}
        >
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 mr-3 text-red-500" />
          )}
          <div className="mr-8">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
