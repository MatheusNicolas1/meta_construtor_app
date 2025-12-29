import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecureForm, secureStringSchema, secureEmailSchema, secureTextAreaSchema } from './InputValidator';
import { z } from 'zod';
import { AlertTriangle, CheckCircle } from 'lucide-react';

// Schema do formulário
const secureFormSchema = z.object({
  name: secureStringSchema,
  email: secureEmailSchema,
  message: secureTextAreaSchema,
});

type SecureFormData = z.infer<typeof secureFormSchema>;

// Componente exemplo de uso das validações
export const SecureFormExample = () => {
  const [formData, setFormData] = useState<SecureFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const { validateField, validateForm } = useSecureForm(secureFormSchema);

  const handleFieldChange = (fieldName: keyof SecureFormData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Validar campo em tempo real
    const validation = validateField(fieldName, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: validation.error || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    // Validar formulário completo
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setSubmitResult({
        success: false,
        message: 'Por favor, corrija os erros no formulário'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitResult({
        success: true,
        message: 'Formulário enviado com sucesso!'
      });
      
      // Limpar formulário
      setFormData({ name: '', email: '', message: '' });
      setFieldErrors({});
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Erro ao enviar formulário. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Formulário Seguro</CardTitle>
        <p className="text-sm text-muted-foreground">
          Exemplo de validação com proteção XSS e sanitização
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nome
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={fieldErrors.name ? 'border-destructive' : ''}
              placeholder="Seu nome completo"
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={fieldErrors.email ? 'border-destructive' : ''}
              placeholder="seu@email.com"
            />
            {fieldErrors.email && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Mensagem
            </label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleFieldChange('message', e.target.value)}
              className={fieldErrors.message ? 'border-destructive' : ''}
              placeholder="Sua mensagem..."
              rows={4}
            />
            {fieldErrors.message && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {fieldErrors.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>

        {submitResult && (
          <Alert className={`mt-4 ${submitResult.success ? 'border-green-200' : 'border-destructive'}`}>
            <div className="flex items-center gap-2">
              {submitResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
              <AlertDescription className={submitResult.success ? 'text-green-700' : 'text-destructive'}>
                {submitResult.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="mt-6 p-3 bg-muted rounded-md">
          <h4 className="text-sm font-medium mb-2">Proteções Ativas:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✅ Validação anti-XSS</li>
            <li>✅ Prevenção de SQL injection</li>
            <li>✅ Sanitização de HTML</li>
            <li>✅ Validação de email</li>
            <li>✅ Limitação de tamanho</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureFormExample;