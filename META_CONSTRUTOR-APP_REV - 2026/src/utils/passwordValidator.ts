/**
 * Validador de senha com requisitos de força
 */

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Muito fraca' | 'Fraca' | 'Média' | 'Forte' | 'Muito forte';
  checks: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    minLength: password.length >= 10,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  let score = 0;
  let label: PasswordStrength['label'] = 'Muito fraca';

  if (passedChecks === 5) {
    score = 4;
    label = 'Muito forte';
  } else if (passedChecks === 4) {
    score = 3;
    label = 'Forte';
  } else if (passedChecks === 3) {
    score = 2;
    label = 'Média';
  } else if (passedChecks >= 1) {
    score = 1;
    label = 'Fraca';
  }

  return { score, label, checks };
};

export const isPasswordValid = (password: string): boolean => {
  const strength = validatePasswordStrength(password);
  return Object.values(strength.checks).every(check => check);
};
