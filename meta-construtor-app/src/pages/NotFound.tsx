import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="card-standard max-w-md w-full mx-4">
          <CardHeader className="card-header text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Página não encontrada
            </CardTitle>
          </CardHeader>
          <CardContent className="card-content text-center space-y-4">
            <p className="text-muted-foreground">
              A página que você está procurando não existe ou foi movida.
            </p>
            <p className="text-sm text-muted-foreground">
              Rota tentada: <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="btn-standard flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NotFound;
