/**
 * Validador de entrada sanitizado para prevenir XSS e injeções
 */

import { z } from 'zod';

// Schemas de validação seguros
export const secureStringSchema = z.string()
  .min(1, 'Campo obrigatório')
  .max(1000, 'Texto muito longo')
  .refine(
    (value) => !containsHtmlTags(value),
    'HTML não é permitido neste campo'
  )
  .refine(
    (value) => !containsSqlInjection(value),
    'Caracteres não permitidos detectados'
  );

export const secureEmailSchema = z.string()
  .email('Email inválido')
  .max(254, 'Email muito longo')
  .refine(
    (value) => !containsHtmlTags(value),
    'HTML não é permitido no email'
  );

export const secureTextAreaSchema = z.string()
  .max(5000, 'Texto muito longo')
  .refine(
    (value) => !containsScriptTags(value),
    'Scripts não são permitidos'
  );

export const secureFileNameSchema = z.string()
  .min(1, 'Nome do arquivo obrigatório')
  .max(255, 'Nome do arquivo muito longo')
  .refine(
    (value) => /^[a-zA-Z0-9._-]+$/.test(value),
    'Nome do arquivo contém caracteres inválidos'
  )
  .refine(
    (value) => !value.startsWith('.'),
    'Nome do arquivo não pode começar com ponto'
  );

// Utilitários de validação
const containsHtmlTags = (text: string): boolean => {
  const htmlRegex = /<[^>]*>/g;
  return htmlRegex.test(text);
};

const containsScriptTags = (text: string): boolean => {
  const scriptRegex = /<script[^>]*>[\s\S]*?<\/script>/gi;
  const onEventRegex = /\son\w+\s*=/gi;
  return scriptRegex.test(text) || onEventRegex.test(text);
};

const containsSqlInjection = (text: string): boolean => {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'UNION', 'SCRIPT', 'JAVASCRIPT:', 'VBSCRIPT:', 'ONLOAD',
    'ONERROR', 'ONCLICK'
  ];
  
  const upperText = text.toUpperCase();
  return sqlKeywords.some(keyword => upperText.includes(keyword));
};

// Sanitizador de saída para exibição segura
export const sanitizeForDisplay = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Sanitizador para URLs
export const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    
    // Permitir apenas protocolos seguros
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return '#';
    }
    
    return parsedUrl.toString();
  } catch {
    return '#';
  }
};

// Validador de senha forte
export const strongPasswordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .refine(
    (password) => /[a-z]/.test(password),
    'Senha deve conter pelo menos uma letra minúscula'
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    'Senha deve conter pelo menos uma letra maiúscula'
  )
  .refine(
    (password) => /\d/.test(password),
    'Senha deve conter pelo menos um número'
  )
  .refine(
    (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    'Senha deve conter pelo menos um caractere especial'
  );

// Hook para validação de formulários
export const useSecureForm = <T extends Record<string, any>>(schema: z.ZodType<T>) => {
  const validateField = (fieldName: keyof T, value: any): { isValid: boolean; error: string | null } => {
    try {
      // Validação simples usando os schemas básicos
      if (typeof value === 'string') {
        secureStringSchema.parse(value);
      }
      return { isValid: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          error: error.issues[0]?.message || 'Valor inválido' 
        };
      }
      return { isValid: false, error: 'Erro de validação' };
    }
  };

  const validateForm = (data: T): { isValid: boolean; errors: Record<string, string> } => {
    try {
      schema.parse(data);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { general: 'Erro de validação' } };
    }
  };

  return { validateField, validateForm };
};