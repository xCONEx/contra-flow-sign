
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
        // Acelerar o carregamento
        return prevProgress + 8;
      });
    }, 25);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 max-w-sm mx-auto px-4">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ContratPro</h1>
            <p className="text-gray-600 text-sm">Iniciando aplicação...</p>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-full space-y-3">
          <Progress value={progress} className="h-2 bg-gray-200" />
          <p className="text-xs text-gray-500 font-medium">
            {Math.round(progress)}% concluído
          </p>
        </div>

        {/* Loading messages */}
        <div className="text-xs text-gray-400">
          {progress < 30 && "Verificando autenticação..."}
          {progress >= 30 && progress < 60 && "Carregando componentes..."}
          {progress >= 60 && progress < 90 && "Configurando aplicação..."}
          {progress >= 90 && "Quase pronto!"}
        </div>
      </div>
    </div>
  );
};
