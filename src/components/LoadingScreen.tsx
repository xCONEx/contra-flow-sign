
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
          setTimeout(onComplete, 300);
          return 100;
        }
        return prevProgress + 5;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ContratPro</h1>
            <p className="text-gray-600 text-sm">Carregando...</p>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-64 space-y-3">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
};
