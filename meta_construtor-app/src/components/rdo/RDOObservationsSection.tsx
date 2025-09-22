import { UseFormReturn } from "react-hook-form";
import { FileText, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RDOFormData } from "@/schemas/rdoSchema";

interface RDOObservationsSectionProps {
  form: UseFormReturn<RDOFormData>;
}

export function RDOObservationsSection({ form }: RDOObservationsSectionProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-construction-blue" />
          Observações Gerais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações e Comentários Adicionais</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Registre aqui observações importantes sobre o dia de trabalho, ocorrências especiais, pontos de atenção para os próximos dias, condições especiais da obra, etc."
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preview das observações */}
        {form.watch("observacoes") && (
          <div className="mt-4 p-3 bg-muted/20 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-construction-orange" />
              <span className="text-sm font-medium text-card-foreground">Preview das Observações:</span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {form.watch("observacoes")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}