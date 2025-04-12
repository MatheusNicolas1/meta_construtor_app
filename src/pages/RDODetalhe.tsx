
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RDODetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes do RDO</h1>
          <p className="text-meta-gray-dark dark:text-meta-gray mt-1">ID: {id}</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Relatório Diário de Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Detalhes do RDO serão exibidos aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RDODetalhe;
