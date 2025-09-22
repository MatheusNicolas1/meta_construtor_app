/**
 * Validadores para CPF, CNPJ e telefone brasileiro
 */

// Validação de telefone brasileiro
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  // Remove todos os caracteres não numéricos
  const digits = phone.replace(/\D/g, '');
  
  // Permite números com +55 opcional
  const cleanedDigits = digits.startsWith('55') && digits.length > 11 
    ? digits.slice(2) 
    : digits;
  
  if (cleanedDigits.length === 0) {
    return { isValid: true }; // Campo vazio é válido (será validado como required no form)
  }
  
  // Deve ter 10 ou 11 dígitos (fixo ou celular)
  if (cleanedDigits.length < 10 || cleanedDigits.length > 11) {
    return { isValid: false, error: 'Telefone deve ter 10 ou 11 dígitos' };
  }
  
  // Primeiro dígito deve ser DDD válido (11-99)
  const ddd = parseInt(cleanedDigits.slice(0, 2));
  if (ddd < 11 || ddd > 99) {
    return { isValid: false, error: 'DDD inválido' };
  }
  
  // Para celular (11 dígitos), o primeiro dígito após DDD deve ser 9
  if (cleanedDigits.length === 11 && cleanedDigits[2] !== '9') {
    return { isValid: false, error: 'Celular deve começar com 9 após o DDD' };
  }
  
  return { isValid: true };
};

// Validação de CPF
export const validateCPF = (cpf: string): { isValid: boolean; error?: string } => {
  const digits = cpf.replace(/\D/g, '');
  
  if (digits.length === 0) {
    return { isValid: true }; // Campo vazio é válido
  }
  
  if (digits.length !== 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos' };
  }
  
  // Verifica sequências inválidas
  const invalidSequences = [
    '00000000000', '11111111111', '22222222222', '33333333333',
    '44444444444', '55555555555', '66666666666', '77777777777',
    '88888888888', '99999999999'
  ];
  
  if (invalidSequences.includes(digits)) {
    return { isValid: false, error: 'CPF inválido' };
  }
  
  // Algoritmo de validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  
  if (firstDigit !== parseInt(digits[9])) {
    return { isValid: false, error: 'CPF inválido' };
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;
  
  if (secondDigit !== parseInt(digits[10])) {
    return { isValid: false, error: 'CPF inválido' };
  }
  
  return { isValid: true };
};

// Validação de CNPJ
export const validateCNPJ = (cnpj: string): { isValid: boolean; error?: string } => {
  const digits = cnpj.replace(/\D/g, '');
  
  if (digits.length === 0) {
    return { isValid: true }; // Campo vazio é válido
  }
  
  if (digits.length !== 14) {
    return { isValid: false, error: 'CNPJ deve ter 14 dígitos' };
  }
  
  // Verifica sequências inválidas
  const invalidSequences = [
    '00000000000000', '11111111111111', '22222222222222', '33333333333333',
    '44444444444444', '55555555555555', '66666666666666', '77777777777777',
    '88888888888888', '99999999999999'
  ];
  
  if (invalidSequences.includes(digits)) {
    return { isValid: false, error: 'CNPJ inválido' };
  }
  
  // Algoritmo de validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i];
  }
  
  let firstDigit = sum % 11;
  firstDigit = firstDigit < 2 ? 0 : 11 - firstDigit;
  
  if (firstDigit !== parseInt(digits[12])) {
    return { isValid: false, error: 'CNPJ inválido' };
  }
  
  // Algoritmo de validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i];
  }
  
  let secondDigit = sum % 11;
  secondDigit = secondDigit < 2 ? 0 : 11 - secondDigit;
  
  if (secondDigit !== parseInt(digits[13])) {
    return { isValid: false, error: 'CNPJ inválido' };
  }
  
  return { isValid: true };
};

// Formatadores
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  // Remove +55 se estiver presente
  const cleanedDigits = digits.startsWith('55') && digits.length > 11 
    ? digits.slice(2) 
    : digits;
  
  if (cleanedDigits.length <= 2) return cleanedDigits;
  if (cleanedDigits.length <= 6) return `(${cleanedDigits.slice(0, 2)}) ${cleanedDigits.slice(2)}`;
  if (cleanedDigits.length <= 10) {
    return `(${cleanedDigits.slice(0, 2)}) ${cleanedDigits.slice(2, 6)}-${cleanedDigits.slice(6)}`;
  }
  
  return `(${cleanedDigits.slice(0, 2)}) ${cleanedDigits.slice(2, 7)}-${cleanedDigits.slice(7, 11)}`;
};

export const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

export const formatCNPJ = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};