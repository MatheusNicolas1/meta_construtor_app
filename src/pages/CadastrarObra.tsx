
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlans } from "@/hooks/usePlans";
import { Select } from "@/components/ui/select";

interface Atividade {
  id: number;
  nome: string;
  quantidade: string;
  unidade: string;
  prazo: string;
  valor: string;
}

const unidadeOptions = ["Metro", "Metro Quadrado", "Metro Cúbico", "Unidade"];

const CadastrarObra = () => {
  const navigate = useNavigate();
  const { checkObraLimit } = usePlans();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    startDate: "",
    deadline: "",
    description: "",
    orcamentoSintetico: "",
  });

  const [atividades, setAtividades] = useState<Atividade[]>([
    { id: 1, nome: "", quantidade: "", unidade: "Metro", prazo: "", valor: "" }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const { value } = e.target;
    // Permite apenas números, pontos e vírgulas
    const sanitizedValue = value.replace(/[^0-9.,]/g, '');
    
    if (fieldName === 'orcamentoSintetico') {
      setFormData(prev => ({ ...prev, orcamentoSintetico: sanitizedValue }));
    }
  };

  const handleAtividadeChange = (id: number, field: string, value: string) => {
    setAtividades(atividades.map(atividade => 
      atividade.id === id ? { ...atividade, [field]: value } : atividade
    ));
  };

  const handleUnidadeChange = (id: number, value: string) => {
    setAtividades(atividades.map(atividade => 
      atividade.id === id ? { ...atividade, unidade: value } : atividade
    ));
  };

  const addAtividade = () => {
    const newId = Math.max(...atividades.map(a => a.id)) + 1;
    setAtividades([...atividades, { id: newId, nome: "", quantidade: "", unidade: "Metro", prazo: "", valor: "" }]);
  };

  const removeAtividade = (id: number) => {
    if (atividades.length > 1) {
      setAtividades(atividades.filter(atividade => atividade.id !== id));
    } else {
      toast.error("É necessário ter pelo menos uma atividade");
    }
  };

  // Calculate sum of all activity values
  const totalAtividades = () => {
    let total = 0;
    atividades.forEach(atividade => {
      if (atividade.valor) {
        const valor = parseFloat(atividade.valor.replace(/[^\d,.-]/g, '').replace(',', '.'));
        if (!isNaN(valor)) {
          total += valor;
        }
      }
    });
    return total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.location || !formData.startDate || !formData.deadline) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if user can create more obras
      const canCreateMore = await checkObraLimit();
      
      if (!canCreateMore) {
        toast.error("Limite de obras atingido no seu plano atual. Faça upgrade para adicionar mais obras.");
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Mock success - in a real implementation this would be an API call
      setTimeout(() => {
        // Create the obra
        toast.success("Obra cadastrada com sucesso!");
        navigate("/app/obras");
      }, 800);
      
    } catch (err: any) {
      toast.error(`Erro ao cadastrar obra: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Obra</h1>
          <p className="text-meta-gray-dark mt-1">Cadastre uma nova obra de construção</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Obra</CardTitle>
              <CardDescription>
                Preencha os detalhes básicos da sua obra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Obra*</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Residencial Vista Mar"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização*</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Ex: Santos, SP"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início*</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo*</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição da Obra</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descreva os detalhes da obra..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Nova seção para Curva ABC */}
          <Card>
            <CardHeader>
              <CardTitle>Informações para Curva ABC</CardTitle>
              <CardDescription>
                Cadastre as atividades e orçamentos para análise de Curva ABC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Atividades a Serem Executadas</Label>
                {atividades.map((atividade, index) => (
                  <div key={atividade.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md relative">
                    <div className="space-y-2">
                      <Label htmlFor={`atividade-nome-${atividade.id}`}>Nome da Atividade</Label>
                      <Input
                        id={`atividade-nome-${atividade.id}`}
                        placeholder="Ex: Fundações"
                        value={atividade.nome}
                        onChange={(e) => handleAtividadeChange(atividade.id, 'nome', e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="space-y-2 flex-1">
                        <Label htmlFor={`atividade-qtd-${atividade.id}`}>Quantidade</Label>
                        <Input
                          id={`atividade-qtd-${atividade.id}`}
                          placeholder="Ex: 10"
                          value={atividade.quantidade}
                          onChange={(e) => handleAtividadeChange(atividade.id, 'quantidade', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2 w-28">
                        <Label htmlFor={`atividade-unidade-${atividade.id}`}>Unidade</Label>
                        <select
                          id={`atividade-unidade-${atividade.id}`}
                          value={atividade.unidade}
                          onChange={(e) => handleUnidadeChange(atividade.id, e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                          {unidadeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`atividade-prazo-${atividade.id}`}>Prazo da Atividade</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`atividade-prazo-${atividade.id}`}
                          placeholder="Ex: 10"
                          value={atividade.prazo}
                          onChange={(e) => handleAtividadeChange(atividade.id, 'prazo', e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-sm">dias</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`atividade-valor-${atividade.id}`}>Valor</Label>
                      <Input
                        id={`atividade-valor-${atividade.id}`}
                        placeholder="Ex: 50000"
                        value={atividade.valor}
                        onChange={(e) => {
                          const sanitizedValue = e.target.value.replace(/[^0-9.,]/g, '');
                          handleAtividadeChange(atividade.id, 'valor', sanitizedValue);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeAtividade(atividade.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addAtividade}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Atividade
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="orcamentoAnalitico">Orçamento Analítico (calculado)</Label>
                  <div className="flex items-center">
                    <span className="mr-1">R$</span>
                    <Input
                      id="orcamentoAnalitico"
                      value={totalAtividades()}
                      readOnly
                      className="bg-secondary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orcamentoSintetico">Orçamento Sintético</Label>
                  <div className="flex items-center">
                    <span className="mr-1">R$</span>
                    <Input
                      id="orcamentoSintetico"
                      name="orcamentoSintetico"
                      placeholder="Ex: 80000"
                      value={formData.orcamentoSintetico}
                      onChange={(e) => handleNumericInput(e, 'orcamentoSintetico')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-meta-orange hover:bg-meta-orange/90"
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Cadastrando..." : "Cadastrar Obra"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CadastrarObra;
