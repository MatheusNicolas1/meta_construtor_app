import { useState, useEffect } from "react";
import { testSupabaseConnection } from "../supabase-test";
import { Button } from "./ui/button";

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<{
    success?: boolean;
    message?: string;
    loading?: boolean;
  }>({
    loading: false
  });

  const runConnectionTest = async () => {
    setConnectionStatus({ loading: true });
    
    try {
      const result = await testSupabaseConnection();
      setConnectionStatus({
        success: result.success,
        message: result.message,
        loading: false
      });
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
        loading: false
      });
    }
  };

  useEffect(() => {
    // Executar o teste automaticamente ao montar o componente
    runConnectionTest();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-background max-w-md mx-auto">
      <h3 className="text-lg font-medium mb-2">Teste de Conexão com Supabase</h3>
      
      {connectionStatus.loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-8 h-8 border-2 border-t-transparent border-meta-orange rounded-full animate-spin"></div>
        </div>
      ) : connectionStatus.success === undefined ? (
        <div className="text-muted-foreground">Teste não iniciado</div>
      ) : (
        <div className={`p-3 rounded ${connectionStatus.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
          <p className={`text-sm ${connectionStatus.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
            {connectionStatus.message}
          </p>
        </div>
      )}
      
      <div className="mt-4">
        <Button 
          onClick={runConnectionTest} 
          disabled={connectionStatus.loading}
          size="sm"
        >
          {connectionStatus.loading ? 'Testando...' : 'Testar Novamente'}
        </Button>
      </div>
    </div>
  );
};

export default SupabaseConnectionTest; 