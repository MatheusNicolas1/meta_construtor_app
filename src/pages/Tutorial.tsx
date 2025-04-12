
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Tutorial = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tutorial</h1>
        <p className="text-meta-gray-dark dark:text-meta-gray mt-1">Aprenda a usar o MetaConstrutor</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao MetaConstrutor!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>Este tutorial irá guiá-lo pelos recursos principais do MetaConstrutor.</p>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">1. Cadastrando uma Obra</h3>
            <p>Para cadastrar uma nova obra, acesse o menu "Obras" e clique em "Nova Obra".</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">2. Criando RDOs</h3>
            <p>Os Relatórios Diários de Obra (RDOs) podem ser criados na seção "RDOs".</p>
          </div>
          
          <Button 
            onClick={() => navigate('/app/dashboard')} 
            className="bg-meta-orange hover:bg-meta-orange/90 mt-4"
          >
            Iniciar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tutorial;
