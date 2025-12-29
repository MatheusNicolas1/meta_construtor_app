import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import type { CostCategory } from '@/types/expense';
import { supabase } from '@/integrations/supabase/client';

// Função para converter valor brasileiro (1.000,50) para formato decimal (1000.50)
const normalizeBrazilianCurrency = (value: string): number => {
  // Remove espaços e R$
  let normalized = value.replace(/\s/g, '').replace('R$', '');
  // Remove pontos (separador de milhar)
  normalized = normalized.replace(/\./g, '');
  // Substitui vírgula por ponto (separador decimal)
  normalized = normalized.replace(',', '.');
  return parseFloat(normalized) || 0;
};

const expenseSchema = z.object({
  obra_id: z.string().min(1, 'Selecione uma obra'),
  cost_category: z.enum(['Material', 'Mão de Obra', 'Equipamento', 'Frete', 'Serviços', 'Outros']),
  invoice_number: z.string().min(1, 'Número da nota fiscal é obrigatório'),
  supplier_name: z.string().min(1, 'Nome do fornecedor é obrigatório'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  date_of_expense: z.string().min(1, 'Data da despesa é obrigatória'),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obras: Array<{ id: string; nome: string }>;
}

export function ExpenseForm({ open, onOpenChange, obras }: ExpenseFormProps) {
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createExpense, uploadInvoice } = useExpenses();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      obra_id: '',
      cost_category: 'Material',
      invoice_number: '',
      supplier_name: '',
      amount: '',
      date_of_expense: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setInvoiceFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setIsUploading(true);
      
      // Converter valor brasileiro para número
      const normalizedAmount = normalizeBrazilianCurrency(data.amount);
      
      if (normalizedAmount <= 0) {
        form.setError('amount', { message: 'Valor deve ser maior que zero' });
        setIsUploading(false);
        return;
      }

      let invoiceUrl: string | undefined;

      if (invoiceFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          invoiceUrl = await uploadInvoice(invoiceFile, user.id);
        }
      }

      await createExpense.mutateAsync({
        obra_id: data.obra_id,
        cost_category: data.cost_category,
        invoice_number: data.invoice_number,
        supplier_name: data.supplier_name,
        amount: normalizedAmount,
        date_of_expense: data.date_of_expense,
        notes: data.notes,
        invoice_file_url: invoiceUrl,
      });

      form.reset();
      setInvoiceFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nova Despesa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="obra_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obra *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a obra" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {obras.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id}>
                          {obra.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                      <SelectItem value="Equipamento">Equipamento</SelectItem>
                      <SelectItem value="Frete">Frete</SelectItem>
                      <SelectItem value="Serviços">Serviços</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Nota Fiscal *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="NF-12345" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do fornecedor" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="1.000,50"
                        onChange={(e) => {
                          // Permite apenas números, vírgula e ponto
                          const value = e.target.value.replace(/[^\d.,]/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use vírgula para decimais (ex: 1.000,50)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_expense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Despesa *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Nota Fiscal (Arquivo)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
              {invoiceFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Arquivo: {invoiceFile.name}
                </p>
              )}
            </FormItem>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Informações adicionais sobre a despesa..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar Despesa
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
