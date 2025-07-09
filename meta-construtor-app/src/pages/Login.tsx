import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle, Play } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    cargo: '',
    telefone: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, {
          nome: formData.nome,
          cargo: formData.cargo,
          telefone: formData.telefone
        });

        if (error) {
          console.error('Erro no cadastro:', error);
          
          if (error.message?.includes('User already registered')) {
            setError('Este email já está cadastrado. Tente fazer login ou use outro email.');
          } else if (error.message?.includes('Password should be at least')) {
            setError('A senha deve ter pelo menos 6 caracteres.');
          } else if (error.message?.includes('Invalid email')) {
            setError('Email inválido. Verifique o formato do email.');
          } else {
            setError('Erro ao criar conta: ' + (error.message || 'Tente novamente.'));
          }
        } else {
          navigate('/dashboard');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          console.error('Erro no login:', error);
          
          if (error.message?.includes('Invalid login credentials')) {
            setError('Email ou senha incorretos. Verifique suas credenciais.');
          } else if (error.message?.includes('Email not confirmed')) {
            setError('Email não confirmado. Verifique sua caixa de entrada.');
          } else if (error.message?.includes('Too many requests')) {
            setError('Muitas tentativas de login. Aguarde alguns minutos e tente novamente.');
          } else {
            setError('Erro no login: ' + (error.message || 'Tente novamente.'));
          }
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      nome: '',
      cargo: '',
      telefone: ''
    });
    setError('');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleDemoAccess = () => {
    // Simular login para modo demo
    localStorage.setItem('demo-mode', 'true');
    localStorage.setItem('demo-user', JSON.stringify({
      id: 'demo-user',
      email: 'demo@metaconstrutor.com',
      nome: 'Usuário Demo',
      cargo: 'Demonstração',
      nivel_acesso: 'diretor'
    }));
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Logo size="lg" className="mb-2" />
          <p className="text-muted-foreground">
            {isSignUp ? 'Crie sua conta' : 'Entre na sua conta'}
          </p>
        </div>

        {/* Card de Login/Cadastro */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-center">
              {isSignUp ? 'Criar Conta' : 'Fazer Login'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input
                      id="nome"
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        type="text"
                        value={formData.cargo}
                        onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                        placeholder="Ex: Engenheiro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={isSignUp ? 'Mínimo 6 caracteres' : '••••••••'}
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? 'Criando conta...' : 'Entrando...'}
                  </>
                ) : (
                  isSignUp ? 'Criar Conta' : 'Fazer Login'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={toggleMode}
                className="text-muted-foreground hover:text-foreground"
              >
                {isSignUp 
                  ? 'Já tem uma conta? Faça login' 
                  : 'Não tem conta? Cadastre-se grátis'
                }
              </Button>
            </div>

            {/* Dados de acesso de teste */}
            {!isSignUp && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>📝 Opção 1 - Criar conta nova:</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clique em "Não tem conta? Cadastre-se grátis"<br />
                    Use qualquer email válido e senha com 6+ caracteres
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                    <strong>🚀 Opção 2 - Acesso rápido (Demo):</strong>
                  </p>
                  <Button 
                    onClick={handleDemoAccess}
                    variant="outline" 
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Entrar no Modo Demo
                  </Button>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Acesso instantâneo para testar todas as funcionalidades
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
} 