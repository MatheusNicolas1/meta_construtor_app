
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/useTheme";
import { TeamMemberForm, TeamMember } from "@/components/TeamMemberForm";
import { ActivityList, Activity } from "@/components/ActivityList";
import { PhotoUploader } from "@/components/PhotoUploader";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

export default function CreateRDO() {
  const { toast } = useToast();
  // Get theme information
  const { resolvedTheme } = useTheme();

  // Form states
  const [project, setProject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [responsible, setResponsible] = useState("");
  const [workDay, setWorkDay] = useState("morning");
  const [morningWeather, setMorningWeather] = useState("");
  const [afternoonWeather, setAfternoonWeather] = useState("");
  const [nightWeather, setNightWeather] = useState("");
  
  // Weather forecast
  const [location, setLocation] = useState("São Paulo, SP");
  const [temperature, setTemperature] = useState("24°C");
  const [condition, setCondition] = useState("Ensolarado");
  const [precipitation, setPrecipitation] = useState("0%");
  const [wind, setWind] = useState("10 km/h");
  const [isTeamIdle, setIsTeamIdle] = useState(false);
  const [idleHours, setIdleHours] = useState(0);
  
  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Activities
  const [activities, setActivities] = useState<Activity[]>([]);
  // Mock pre-registered activities
  const preRegisteredActivities = [
    { id: "1", name: "Fundações" },
    { id: "2", name: "Alvenaria" },
    { id: "3", name: "Acabamento" },
    { id: "4", name: "Instalações Elétricas" },
    { id: "5", name: "Instalações Hidráulicas" },
  ];
  
  // Extra activities
  const [extraActivities, setExtraActivities] = useState<Activity[]>([]);
  
  // Accident and equipment registers
  const [hasAccident, setHasAccident] = useState(false);
  const [accidentDetails, setAccidentDetails] = useState("");
  const [peopleInvolved, setPeopleInvolved] = useState(0);
  const [involvedRole, setInvolvedRole] = useState("");
  
  const [hasEquipmentIssue, setHasEquipmentIssue] = useState(false);
  const [equipmentIssueDetails, setEquipmentIssueDetails] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [equipmentQuantity, setEquipmentQuantity] = useState(0);
  
  // Observations
  const [observations, setObservations] = useState("");

  // Background style based on theme
  const cardBgStyle = resolvedTheme === "dark" 
    ? "bg-[#1A2A44] text-white border-gray-700" 
    : "bg-white text-gray-800 border-gray-200";
  
  // Content background style based on theme
  const contentBgStyle = resolvedTheme === "dark"
    ? "bg-gray-800" 
    : "bg-gray-50";

  // Load previous RDO data when project changes
  useEffect(() => {
    if (project) {
      // In a real application, this would fetch the previous RDO data from an API
      // For this demo, we'll just show a toast message
      toast({
        title: "Dados do RDO anterior carregados",
        description: `Informações do último RDO do projeto "${project}" foram carregadas.`,
      });

      // Simulate loading previous RDO data
      if (project === "project1") {
        setWorkDay("morning_afternoon");
        setMorningWeather("sunny");
        setAfternoonWeather("cloudy");
        // Set other fields as needed
      }

      // In a real app, we would also update the location based on the selected project
      setLocation(project === "project1" ? "São Paulo, SP" : 
                 project === "project2" ? "Rio de Janeiro, RJ" : 
                 "Belo Horizonte, MG");
    }
  }, [project, toast]);

  // Generate responsible options based on team members
  const responsibleOptions = teamMembers.map(member => ({
    id: member.id,
    label: `${member.role} (${member.quantity})`,
    value: member.role
  }));

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "RDO Salvo",
      description: "Relatório Diário de Obra salvo com sucesso!",
    });
    // In a real app, this would send the data to an API
  };

  return (
    <div className={cn(
      "container mx-auto py-6 space-y-6",
      resolvedTheme === "dark" ? "bg-[#121928]" : "bg-[#F5F7FA]"
    )}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={cn(
          "text-2xl font-bold",
          resolvedTheme === "dark" ? "text-white" : "text-gray-800"
        )}>
          Novo RDO
        </h1>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project">Projeto</Label>
                <Select value={project} onValueChange={setProject}>
                  <SelectTrigger 
                    id="project" 
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  >
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project1">Residencial Vista Verde</SelectItem>
                    <SelectItem value="project2">Comercial Centro Empresarial</SelectItem>
                    <SelectItem value="project3">Industrial Park Logistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  />
                </div>
                <div>
                  <Label htmlFor="responsible">Responsável pelo RDO</Label>
                  <Select value={responsible} onValueChange={setResponsible}>
                    <SelectTrigger 
                      id="responsible"
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsibleOptions.length > 0 ? (
                        responsibleOptions.map(option => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_team">Adicione membros à equipe primeiro</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="workDay">Jornada de Trabalho</Label>
                <Select value={workDay} onValueChange={setWorkDay}>
                  <SelectTrigger 
                    id="workDay"
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  >
                    <SelectValue placeholder="Selecione a jornada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Apenas Manhã</SelectItem>
                    <SelectItem value="morning_afternoon">Manhã e Tarde</SelectItem>
                    <SelectItem value="full_day">Manhã, Tarde e Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(workDay === "morning" || workDay === "morning_afternoon" || workDay === "full_day") && (
                <div>
                  <Label htmlFor="morningWeather">Clima - Manhã</Label>
                  <Select value={morningWeather} onValueChange={setMorningWeather}>
                    <SelectTrigger 
                      id="morningWeather"
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunny">Ensolarado</SelectItem>
                      <SelectItem value="cloudy">Nublado</SelectItem>
                      <SelectItem value="rainy">Chuvoso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {(workDay === "morning_afternoon" || workDay === "full_day") && (
                <div>
                  <Label htmlFor="afternoonWeather">Clima - Tarde</Label>
                  <Select value={afternoonWeather} onValueChange={setAfternoonWeather}>
                    <SelectTrigger 
                      id="afternoonWeather"
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunny">Ensolarado</SelectItem>
                      <SelectItem value="cloudy">Nublado</SelectItem>
                      <SelectItem value="rainy">Chuvoso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {workDay === "full_day" && (
                <div>
                  <Label htmlFor="nightWeather">Clima - Noite</Label>
                  <Select value={nightWeather} onValueChange={setNightWeather}>
                    <SelectTrigger 
                      id="nightWeather"
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Limpo</SelectItem>
                      <SelectItem value="cloudy">Nublado</SelectItem>
                      <SelectItem value="rainy">Chuvoso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weather Forecast */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Previsão do Tempo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Local</Label>
                <Input 
                  id="location" 
                  value={location} 
                  readOnly
                  disabled
                  className={cn(
                    resolvedTheme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300",
                    "opacity-70 cursor-not-allowed"
                  )}
                />
              </div>
              
              <div>
                <Label htmlFor="temperature">Temperatura</Label>
                <Input 
                  id="temperature" 
                  value={temperature} 
                  onChange={(e) => setTemperature(e.target.value)}
                  className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="condition">Condição</Label>
                <Input 
                  id="condition" 
                  value={condition} 
                  onChange={(e) => setCondition(e.target.value)}
                  className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                />
              </div>
              
              <div>
                <Label htmlFor="precipitation">Precipitação</Label>
                <Input 
                  id="precipitation" 
                  value={precipitation} 
                  onChange={(e) => setPrecipitation(e.target.value)}
                  className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                />
              </div>
              
              <div>
                <Label htmlFor="wind">Vento</Label>
                <Input 
                  id="wind" 
                  value={wind} 
                  onChange={(e) => setWind(e.target.value)}
                  className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4 border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Switch
                  id="idle-switch"
                  checked={isTeamIdle}
                  onCheckedChange={setIsTeamIdle}
                />
                <Label htmlFor="idle-switch">A equipe ficou ociosa devido ao clima?</Label>
              </div>
              
              {isTeamIdle && (
                <div className="mt-2">
                  <Label htmlFor="idle-hours">Quantidade de Horas</Label>
                  <Input 
                    id="idle-hours" 
                    type="number" 
                    min="0"
                    value={idleHours} 
                    onChange={(e) => setIdleHours(parseInt(e.target.value) || 0)}
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamMemberForm onTeamMembersChange={setTeamMembers} />
          </CardContent>
        </Card>

        {/* Activities */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Atividades Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityList 
              preRegisteredActivities={preRegisteredActivities}
              onActivitiesChange={setActivities}
            />
          </CardContent>
        </Card>

        {/* Extra Activities */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Atividades Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityList 
              preRegisteredActivities={[]}
              onActivitiesChange={setExtraActivities}
              isExtra={true}
            />
          </CardContent>
        </Card>

        {/* Accident and Equipment Registration - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={cardBgStyle}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Registro de Acidentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="accident-switch"
                  checked={hasAccident}
                  onCheckedChange={setHasAccident}
                />
                <Label htmlFor="accident-switch">Houve Acidente?</Label>
              </div>
              
              {hasAccident && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="people-involved">Quantidade de Pessoas Envolvidas</Label>
                    <Input
                      id="people-involved"
                      type="number"
                      min="0"
                      value={peopleInvolved}
                      onChange={(e) => setPeopleInvolved(parseInt(e.target.value) || 0)}
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="involved-role">Função dos Colaboradores</Label>
                    <Select value={involvedRole} onValueChange={setInvolvedRole}>
                      <SelectTrigger 
                        id="involved-role"
                        className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                      >
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.length > 0 ? (
                          teamMembers.map(member => (
                            <SelectItem key={member.id} value={member.role}>
                              {member.role}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_role">Adicione funções à equipe primeiro</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Textarea
                    placeholder="Descreva o acidente..."
                    value={accidentDetails}
                    onChange={(e) => setAccidentDetails(e.target.value)}
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className={cardBgStyle}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Registro de Equipamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="equipment-switch"
                  checked={hasEquipmentIssue}
                  onCheckedChange={setHasEquipmentIssue}
                />
                <Label htmlFor="equipment-switch">Houve Problema com Equipamento?</Label>
              </div>
              
              {hasEquipmentIssue && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="equipment-type">Tipo de Equipamento</Label>
                    <Input
                      id="equipment-type"
                      value={equipmentType}
                      onChange={(e) => setEquipmentType(e.target.value)}
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="equipment-quantity">Quantidade</Label>
                    <Input
                      id="equipment-quantity"
                      type="number"
                      min="0"
                      value={equipmentQuantity}
                      onChange={(e) => setEquipmentQuantity(parseInt(e.target.value) || 0)}
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Descreva o problema com o equipamento..."
                    value={equipmentIssueDetails}
                    onChange={(e) => setEquipmentIssueDetails(e.target.value)}
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Observations */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Adicione observações gerais sobre o andamento da obra..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className={cn(
                "min-h-24",
                resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
              )}
            />
          </CardContent>
        </Card>

        {/* Photo Records */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Registros Fotográficos</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUploader />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            className={resolvedTheme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Salvar RDO
          </Button>
        </div>
      </form>
    </div>
  );
}
