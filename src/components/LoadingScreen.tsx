
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { FileText } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 100);
          return 100;
        }
        // Carregamento mais rápido
        return prevProgress + 15;
      });
    }, 15);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4 max-w-sm mx-auto px-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ContratPro</h1>
            <p className="text-gray-600 text-xs">Carregando...</p>
          </div>
        </div>

        <div className="w-full space-y-2">
          <Progress value={progress} className="h-1 bg-gray-200" />
          <p className="text-xs text-gray-500">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
};
