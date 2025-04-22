import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    location: "",
    startDate: "",
    deadline: "",
    budget: "",
    description: "",
    team: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.client || !formData.location || !formData.startDate || !formData.deadline) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate project creation
    setTimeout(() => {
      toast.success("Projeto criado com sucesso!");
      navigate("/projects");
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Projeto</h1>
          <p className="text-meta-gray-dark mt-1">Crie um novo projeto de construção</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
            <CardDescription>
              Preencha os detalhes básicos do seu projeto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto*</Label>
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
                <Label htmlFor="client">Cliente*</Label>
                <Input
                  id="client"
                  name="client"
                  placeholder="Ex: Construtora Oceano"
                  value={formData.client}
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
                <Label htmlFor="team">Tamanho da Equipe</Label>
                <Input
                  id="team"
                  name="team"
                  type="number"
                  placeholder="Ex: 8"
                  value={formData.team}
                  onChange={handleChange}
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

              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="Ex: 1000000"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Projeto</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descreva os detalhes do projeto..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-meta-orange hover:bg-meta-orange/90">
            <Save className="mr-2 h-4 w-4" />
            Salvar Projeto
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
