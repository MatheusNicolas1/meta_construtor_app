import { useState, useEffect } from "react";
import { testSupabaseConnectionAndUser, validateSupabaseKey } from "../supabase-test-auth";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

type ValidationResult = {
  success: boolean;
  message: string;
  details: {
    issuer: string;
    reference: string;
    role: string;
    expirationDate: string;
    issuedDate: string;
    isExpired: boolean;
    timeUntilExpiration: string;
  } | null;
};

type ConnectionResult = {
  success: boolean;
  connectionValid: boolean;
  userExists: boolean;
  message: string;
};

const SupabaseAuthTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionResult | null>(null);
  const [keyValidation, setKeyValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setLoading(true);
    
    try {
      // Validar a chave do Supabase
      const validationResult = await validateSupabaseKey();
      setKeyValidation(validationResult as ValidationResult);
      
      // Testar conexão e verificar usuário
      const connectionResult = await testSupabaseConnectionAndUser();
      setConnectionStatus(connectionResult);
    } catch (error) {
      console.error("Erro ao executar testes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Verificação de Supabase e Usuário</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status de Carregamento */}
        {loading && (
          <div className="flex justify-center my-4">
            <div className="w-8 h-8 border-2 border-t-transparent border-meta-orange rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Validação da Chave */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">1. Validação da Chave Supabase</h3>
          {keyValidation ? (
            <div className={`p-4 rounded-md ${keyValidation.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <p className="font-medium">{keyValidation.message}</p>
              
              {keyValidation.details && (
                <div className="mt-2 space-y-1 text-sm">
                  <p>Emissor: <span className="font-medium">{keyValidation.details.issuer}</span></p>
                  <p>Referência: <span className="font-medium">{keyValidation.details.reference}</span></p>
                  <p>Papel: <span className="font-medium">{keyValidation.details.role}</span></p>
                  <p>Data de Emissão: <span className="font-medium">{keyValidation.details.issuedDate}</span></p>
                  <p>Data de Expiração: <span className="font-medium">{keyValidation.details.expirationDate}</span></p>
                  <p>Status: <span className={`font-medium ${keyValidation.details.isExpired ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {keyValidation.details.isExpired ? 'Expirado' : 'Válido'}
                  </span></p>
                  <p>Tempo até expiração: <span className="font-medium">{keyValidation.details.timeUntilExpiration}</span></p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Não foi possível validar a chave</p>
          )}
        </div>
        
        <Separator />
        
        {/* Teste de Conexão e Usuário */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">2. Conexão e Verificação de Usuário</h3>
          {connectionStatus ? (
            <div className={`p-4 rounded-md ${connectionStatus.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <p className="font-medium mb-2">{connectionStatus.message}</p>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Conexão com Supabase:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    connectionStatus.connectionValid 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {connectionStatus.connectionValid ? 'Válida' : 'Inválida'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium mr-2">Usuário matheusnicolas.org@gmail.com:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    connectionStatus.userExists 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {connectionStatus.userExists ? 'Encontrado' : 'Não Encontrado'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Não foi possível verificar a conexão e o usuário</p>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={runTests} 
            disabled={loading}
            className="bg-meta-blue hover:bg-meta-blue/90"
          >
            {loading ? 'Verificando...' : 'Verificar Novamente'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseAuthTest; 