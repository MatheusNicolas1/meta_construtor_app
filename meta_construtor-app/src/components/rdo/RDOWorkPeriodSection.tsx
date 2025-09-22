import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Clock, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RDOFormData } from "@/schemas/rdoSchema";

interface RDOWorkPeriodSectionProps {
  form: UseFormReturn<RDOFormData>;
}

interface WorkPeriod {
  id: string;
  type: string;
  startTime?: string;
  endTime?: string;
  label: string;
}

const predefinedPeriods = [
  { value: "Meio período", label: "Meio período (4h)" },
  { value: "Integral", label: "Integral (8h)" },
  { value: "Turno noturno", label: "Turno noturno" },
  { value: "Turno estendido", label: "Turno estendido (extra)" },
  { value: "Personalizado", label: "Personalizado" },
];

export function RDOWorkPeriodSection({ form }: RDOWorkPeriodSectionProps) {
  const [workPeriods, setWorkPeriods] = useState<WorkPeriod[]>([]);
  const [selectedPeriodType, setSelectedPeriodType] = useState<string>("");
  const [customStartTime, setCustomStartTime] = useState<string>("");
  const [customEndTime, setCustomEndTime] = useState<string>("");

  const addWorkPeriod = () => {
    if (!selectedPeriodType) return;

    const newPeriod: WorkPeriod = {
      id: Date.now().toString(),
      type: selectedPeriodType,
      label: selectedPeriodType === "Personalizado" 
        ? `${customStartTime} - ${customEndTime}`
        : predefinedPeriods.find(p => p.value === selectedPeriodType)?.label || selectedPeriodType
    };

    if (selectedPeriodType === "Personalizado") {
      newPeriod.startTime = customStartTime;
      newPeriod.endTime = customEndTime;
    }

    setWorkPeriods([...workPeriods, newPeriod]);
    setSelectedPeriodType("");
    setCustomStartTime("");
    setCustomEndTime("");

    // Update form data
    form.setValue("periodo", workPeriods.length > 0 ? "Múltiplos" : selectedPeriodType as any);
  };

  const removeWorkPeriod = (id: string) => {
    const updatedPeriods = workPeriods.filter(period => period.id !== id);
    setWorkPeriods(updatedPeriods);
    
    // Update form data
    if (updatedPeriods.length === 0) {
      form.setValue("periodo", "Manhã");
    } else if (updatedPeriods.length === 1) {
      form.setValue("periodo", updatedPeriods[0].type as any);
    }
  };

  const isCustomPeriod = selectedPeriodType === "Personalizado";
  const canAddPeriod = selectedPeriodType && (!isCustomPeriod || (customStartTime && customEndTime));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-construction-blue" />
          Períodos de Trabalho
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing work periods */}
        {workPeriods.length > 0 && (
          <div className="space-y-2">
            <FormLabel>Períodos Cadastrados:</FormLabel>
            <div className="flex flex-wrap gap-2">
              {workPeriods.map((period) => (
                <Badge 
                  key={period.id} 
                  variant="secondary" 
                  className="flex items-center gap-2 px-3 py-1"
                >
                  <Clock className="h-3 w-3" />
                  {period.label}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeWorkPeriod(period.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add new work period */}
        <div className="space-y-4 p-4 border border-dashed border-border rounded-lg">
          <FormLabel>Adicionar Período de Trabalho:</FormLabel>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <FormLabel className="text-sm">Tipo de Período</FormLabel>
              <Select value={selectedPeriodType} onValueChange={setSelectedPeriodType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedPeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isCustomPeriod && (
              <>
                <div className="space-y-2">
                  <FormLabel className="text-sm">Horário de Início</FormLabel>
                  <Input
                    type="time"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    placeholder="08:00"
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel className="text-sm">Horário de Término</FormLabel>
                  <Input
                    type="time"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    placeholder="17:00"
                  />
                </div>
              </>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addWorkPeriod}
            disabled={!canAddPeriod}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Período
          </Button>
        </div>

        {/* Hidden field for form compatibility */}
        <FormField
          control={form.control}
          name="periodo"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {workPeriods.length === 0 && (
          <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-lg">
            💡 Você pode adicionar múltiplos períodos de trabalho para o mesmo dia, caso necessário.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
