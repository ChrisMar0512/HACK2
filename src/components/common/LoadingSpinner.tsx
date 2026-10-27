import React from 'react';
import { Compass } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Consultando el Log Pose...',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Anillo exterior animado */}
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        {/* Ícono náutico central */}
        <Compass className={`absolute text-amber-400 ${sizeMap[size]}`} />
      </div>
      {message && (
        <p className="text-sm font-medium text-amber-200/80 animate-pulse tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
};
