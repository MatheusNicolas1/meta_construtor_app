import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Componente de teste para verificar se os inputs não perdem foco
export function TestInputs() {
  const [textValue, setTextValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [dynamicInputs, setDynamicInputs] = useState<{ id: string; value: string }[]>([]);

  const addDynamicInput = () => {
    setDynamicInputs(prev => [...prev, { id: Date.now().toString(), value: "" }]);
  };

  const updateDynamicInput = (id: string, value: string) => {
    setDynamicInputs(prev => prev.map(item => 
      item.id === id ? { ...item, value } : item
    ));
  };

  const removeDynamicInput = (id: string) => {
    setDynamicInputs(prev => prev.filter(item => item.id !== id));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de Inputs - Verificação de Foco</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input simples */}
        <div>
          <label className="text-sm font-medium">Input Simples</label>
          <Input
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Digite aqui para testar o foco..."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Valor atual: {textValue}
          </p>
        </div>

        {/* Textarea */}
        <div>
          <label className="text-sm font-medium">Textarea</label>
          <Textarea
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder="Digite um parágrafo longo para testar..."
            className="mt-1"
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Caracteres: {textareaValue.length}
          </p>
        </div>

        {/* Inputs Dinâmicos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Inputs Dinâmicos</label>
            <Button onClick={addDynamicInput} size="sm">
              Adicionar Input
            </Button>
          </div>
          
          <div className="space-y-2">
            {dynamicInputs.map((input) => (
              <div key={input.id} className="flex gap-2">
                <Input
                  value={input.value}
                  onChange={(e) => updateDynamicInput(input.id, e.target.value)}
                  placeholder={`Input dinâmico ${input.id}`}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeDynamicInput(input.id)}
                  variant="outline"
                  size="sm"
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
          
          {dynamicInputs.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Nenhum input dinâmico adicionado
            </p>
          )}
        </div>

        {/* Instruções de teste */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Instruções de Teste:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>1. Digite texto nos campos acima</li>
            <li>2. Verifique se o foco não se perde durante a digitação</li>
            <li>3. Teste com parágrafos longos no textarea</li>
            <li>4. Adicione inputs dinâmicos e teste a digitação</li>
            <li>5. Certifique-se de que não há warnings no console</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}