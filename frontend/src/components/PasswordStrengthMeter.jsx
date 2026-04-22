import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordStrengthMeter = ({ password }) => {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a special character", met: /[^A-Za-z0-9]/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  ];

  const strength = requirements.filter(r => r.met).length;

  const getStrengthColor = (s) => {
    if (s === 0) return "bg-slate-200";
    if (s <= 1) return "bg-red-500";
    if (s <= 2) return "bg-orange-500";
    if (s <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (s) => {
    if (s === 0) return "Enter password";
    if (s <= 2) return "Weak";
    if (s === 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-slate-500">Password Strength</span>
        <span className="text-xs font-medium text-slate-700">{getStrengthText(strength)}</span>
      </div>
      
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`} 
          style={{ width: `${(strength / 4) * 100}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2">
            {req.met ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-slate-300" />
            )}
            <span className={`text-xs ${req.met ? 'text-slate-700' : 'text-slate-400'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;