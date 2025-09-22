import React, { useState } from 'react';
import { Eye, EyeOff, Mail, IdCard, Check } from 'lucide-react';

// --- TYPE DEFINITIONS ---

interface SignUpData {
  name: string;
  email: string;
  documentType: 'cpf' | 'cnpj' | '';
  document: string;
  password: string;
  confirmPassword: string;
}

interface SignUpStepsProps {
  onComplete: (data: SignUpData) => void;
}

// --- HELPER COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-construction-orange/70 focus-within:bg-construction-orange/10">
    {children}
  </div>
);

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: totalSteps }, (_, i) => (
      <div
        key={i}
        className={`h-2 w-8 rounded-full transition-colors ${
          i < currentStep ? 'bg-construction-orange' : 'bg-border'
        }`}
      />
    ))}
  </div>
);

// --- VALIDATION FUNCTIONS ---

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.length === 11 && !!/^\d{11}$/.test(cleanCPF);
};

const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  return cleanCNPJ.length === 14 && !!/^\d{14}$/.test(cleanCNPJ);
};

const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// --- STEP COMPONENTS ---

const NameStep = ({ 
  name, 
  setName, 
  onNext, 
  isValidating 
}: { 
  name: string; 
  setName: (value: string) => void; 
  onNext: () => void;
  isValidating: boolean;
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-background/95 backdrop-blur-sm p-6 rounded-2xl border-2 border-border shadow-xl">
      <div className="animate-fade-in">
        <label className="text-sm font-semibold text-foreground">Nome completo</label>
        <GlassInputWrapper>
          <div className="relative">
            <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              name="name" 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo" 
              className="w-full bg-transparent text-sm p-4 pl-10 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground" 
              required
              minLength={2}
            />
          </div>
        </GlassInputWrapper>
      </div>

      <button 
        type="submit" 
        disabled={name.trim().length < 2 || isValidating}
        className="animate-fade-in w-full rounded-2xl bg-construction-orange py-4 font-medium text-white hover:bg-construction-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isValidating ? 'Validando...' : 'Continuar'}
      </button>
    </form>
  );
};

const EmailStep = ({ 
  email, 
  setEmail, 
  onNext, 
  onBack,
  isValidating 
}: { 
  email: string; 
  setEmail: (value: string) => void; 
  onNext: () => void;
  onBack: () => void;
  isValidating: boolean;
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="animate-fade-in">
        <label className="text-sm font-medium text-muted-foreground">Endereço de email</label>
        <GlassInputWrapper>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              name="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu endereço de email" 
              className="w-full bg-transparent text-sm p-4 pl-10 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground" 
              required
            />
          </div>
        </GlassInputWrapper>
      </div>

      <button 
        type="submit" 
        disabled={!validateEmail(email) || isValidating}
        className="animate-fade-in w-full rounded-2xl bg-construction-orange py-4 font-medium text-white hover:bg-construction-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isValidating ? 'Validando...' : 'Continuar'}
      </button>
    </form>
  );
};

const DocumentStep = ({ 
  documentType, 
  setDocumentType, 
  document, 
  setDocument, 
  onNext, 
  onBack,
  isValidating 
}: { 
  documentType: 'cpf' | 'cnpj' | ''; 
  setDocumentType: (value: 'cpf' | 'cnpj') => void; 
  document: string; 
  setDocument: (value: string) => void; 
  onNext: () => void;
  onBack: () => void;
  isValidating: boolean;
}) => {
  const handleDocumentChange = (value: string) => {
    if (documentType === 'cpf') {
      setDocument(formatCPF(value));
    } else if (documentType === 'cnpj') {
      setDocument(formatCNPJ(value));
    }
  };

  const isDocumentValid = () => {
    if (documentType === 'cpf') return validateCPF(document);
    if (documentType === 'cnpj') return validateCNPJ(document);
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDocumentValid()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="animate-fade-in">
        <label className="text-sm font-medium text-muted-foreground">Tipo de documento</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDocumentType('cpf')}
            className={`p-4 rounded-2xl border transition-colors ${
              documentType === 'cpf' 
                ? 'border-construction-orange bg-construction-orange/10 text-construction-orange' 
                : 'border-border bg-foreground/5 text-foreground hover:bg-muted'
            }`}
          >
            CPF (Pessoa Física)
          </button>
          <button
            type="button"
            onClick={() => setDocumentType('cnpj')}
            className={`p-4 rounded-2xl border transition-colors ${
              documentType === 'cnpj' 
                ? 'border-construction-orange bg-construction-orange/10 text-construction-orange' 
                : 'border-border bg-foreground/5 text-foreground hover:bg-muted'
            }`}
          >
            CNPJ (Pessoa Jurídica)
          </button>
        </div>
      </div>

      {documentType && (
        <div className="animate-fade-in">
          <label className="text-sm font-medium text-muted-foreground">
            {documentType === 'cpf' ? 'CPF' : 'CNPJ'}
          </label>
          <GlassInputWrapper>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                name="document" 
                type="text" 
                value={document}
                onChange={(e) => handleDocumentChange(e.target.value)}
                placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                className="w-full bg-transparent text-sm p-4 pl-10 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground" 
                maxLength={documentType === 'cpf' ? 14 : 18}
                required
              />
            </div>
          </GlassInputWrapper>
        </div>
      )}

      <div className="flex gap-3">
        <button 
          type="button"
          onClick={onBack}
          className="animate-fade-in flex-1 rounded-2xl border border-border py-4 font-medium text-foreground hover:bg-muted transition-colors"
        >
          Voltar
        </button>
        <button 
          type="submit" 
          disabled={!isDocumentValid() || isValidating}
          className="animate-fade-in flex-1 rounded-2xl bg-construction-orange py-4 font-medium text-white hover:bg-construction-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? 'Validando...' : 'Continuar'}
        </button>
      </div>
    </form>
  );
};

const PasswordStep = ({ 
  password, 
  setPassword, 
  confirmPassword, 
  setConfirmPassword, 
  onComplete, 
  onBack 
}: { 
  password: string; 
  setPassword: (value: string) => void; 
  confirmPassword: string; 
  setConfirmPassword: (value: string) => void; 
  onComplete: () => void;
  onBack: () => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordValid && doPasswordsMatch) {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted-foreground">Senha</label>
          {password.length > 0 && (
            <div className={`text-xs ${isPasswordValid ? 'text-green-500' : 'text-red-500'}`}>
              {isPasswordValid ? '✓ Senha válida' : '✗ Mínimo 8 caracteres'}
            </div>
          )}
        </div>
        <GlassInputWrapper>
          <div className="relative">
            <input 
              name="password" 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha segura (mín. 8 caracteres)" 
              className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground" 
              required
              minLength={8}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute inset-y-0 right-3 flex items-center"
            >
              {showPassword ? 
                <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : 
                <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              }
            </button>
          </div>
        </GlassInputWrapper>
      </div>

      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted-foreground">Confirmar senha</label>
          {confirmPassword.length > 0 && (
            <div className={`text-xs ${doPasswordsMatch ? 'text-green-500' : 'text-red-500'}`}>
              {doPasswordsMatch ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
            </div>
          )}
        </div>
        <GlassInputWrapper>
          <div className="relative">
            <input 
              name="confirmPassword" 
              type={showConfirmPassword ? 'text' : 'password'} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha" 
              className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground" 
              required
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="absolute inset-y-0 right-3 flex items-center"
            >
              {showConfirmPassword ? 
                <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : 
                <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              }
            </button>
          </div>
        </GlassInputWrapper>
      </div>

      <div className="animate-fade-in">
        <label className="flex items-start gap-3 cursor-pointer text-sm">
          <input 
            type="checkbox" 
            name="terms" 
            required
            className="mt-1 h-4 w-4 rounded border border-border bg-transparent text-construction-orange focus:ring-2 focus:ring-construction-orange/20" 
          />
          <span className="text-foreground/90">
            Concordo com os <a href="#" className="text-construction-orange hover:underline">Termos de Uso</a> e <a href="#" className="text-construction-orange hover:underline">Política de Privacidade</a>
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button 
          type="button"
          onClick={onBack}
          className="animate-fade-in flex-1 rounded-2xl border border-border py-4 font-medium text-foreground hover:bg-muted transition-colors"
        >
          Voltar
        </button>
        <button 
          type="submit" 
          disabled={!isPasswordValid || !doPasswordsMatch}
          className="animate-fade-in flex-1 rounded-2xl bg-construction-orange py-4 font-medium text-white hover:bg-construction-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Criar conta
        </button>
      </div>
    </form>
  );
};

// --- MAIN COMPONENT ---

export const SignUpSteps: React.FC<SignUpStepsProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [formData, setFormData] = useState<SignUpData>({
    name: '',
    email: '',
    documentType: '',
    document: '',
    password: '',
    confirmPassword: ''
  });

  const handleNameNext = async () => {
    setIsValidating(true);
    // Simulate name validation
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsValidating(false);
    setCurrentStep(2);
  };

  const handleEmailNext = async () => {
    setIsValidating(true);
    // Simulate email validation API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsValidating(false);
    setCurrentStep(3);
  };

  const handleDocumentNext = async () => {
    setIsValidating(true);
    // Simulate document validation API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsValidating(false);
    setCurrentStep(4);
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  return (
    <div className="space-y-6 relative z-20 bg-background/95 backdrop-blur-sm p-8 rounded-2xl border-2 border-border shadow-2xl">
      <StepIndicator currentStep={currentStep} totalSteps={4} />
      
      {currentStep === 1 && (
        <NameStep
          name={formData.name}
          setName={(name) => setFormData(prev => ({ ...prev, name }))}
          onNext={handleNameNext}
          isValidating={isValidating}
        />
      )}

      {currentStep === 2 && (
        <EmailStep
          email={formData.email}
          setEmail={(email) => setFormData(prev => ({ ...prev, email }))}
          onNext={handleEmailNext}
          onBack={() => setCurrentStep(1)}
          isValidating={isValidating}
        />
      )}

      {currentStep === 3 && (
        <DocumentStep
          documentType={formData.documentType as 'cpf' | 'cnpj' | ''}
          setDocumentType={(documentType) => setFormData(prev => ({ ...prev, documentType, document: '' }))}
          document={formData.document}
          setDocument={(document) => setFormData(prev => ({ ...prev, document }))}
          onNext={handleDocumentNext}
          onBack={() => setCurrentStep(2)}
          isValidating={isValidating}
        />
      )}

      {currentStep === 4 && (
        <PasswordStep
          password={formData.password}
          setPassword={(password) => setFormData(prev => ({ ...prev, password }))}
          confirmPassword={formData.confirmPassword}
          setConfirmPassword={(confirmPassword) => setFormData(prev => ({ ...prev, confirmPassword }))}
          onComplete={handleComplete}
          onBack={() => setCurrentStep(3)}
        />
      )}
    </div>
  );
};