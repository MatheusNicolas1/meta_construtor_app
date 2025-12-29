import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/components/auth/AuthContext';
import { hasRouteAccess, hasActionPermission } from '@/security/RBACMatrix';
import type { UserRole } from '@/types/user';

// Mock do AuthContext
const mockAuthContext = {
  isAuthenticated: true,
  user: { 
    id: '1', 
    name: 'Test User', 
    email: 'test@test.com', 
    role: 'Colaborador' as UserRole, 
    createdAt: '', 
    updatedAt: '' 
  },
  roles: ['Colaborador' as UserRole],
  attributes: {},
  mfaEnabled: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  hasRole: vi.fn(),
  hasAnyRole: vi.fn(),
  refreshSession: vi.fn(),
};

vi.mock('@/components/auth/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    canAccessRoute: (path: string) => hasRouteAccess(path, 'Colaborador'),
    canPerformAction: (action: string) => hasActionPermission(action, 'Colaborador'),
  }),
}));

vi.mock('@/components/security/AuditLogger', () => ({
  useAuditLogger: () => ({ logEvent: vi.fn() }),
}));

describe('Security System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RBAC Matrix', () => {
    it('should allow Colaborador access to permitted routes', () => {
      expect(hasRouteAccess('/home', 'Colaborador')).toBe(true);
      expect(hasRouteAccess('/obras', 'Colaborador')).toBe(true);
      expect(hasRouteAccess('/rdo', 'Colaborador')).toBe(true);
    });

    it('should deny Colaborador access to restricted routes', () => {
      expect(hasRouteAccess('/equipes', 'Colaborador')).toBe(false);
      expect(hasRouteAccess('/integracoes', 'Colaborador')).toBe(false);
      expect(hasRouteAccess('/configuracoes', 'Colaborador')).toBe(false);
    });

    it('should allow Admin access to all routes', () => {
      expect(hasRouteAccess('/integracoes', 'Administrador')).toBe(true);
      expect(hasRouteAccess('/seguranca', 'Administrador')).toBe(true);
      expect(hasRouteAccess('/configuracoes', 'Administrador')).toBe(true);
    });

    it('should validate action permissions correctly', () => {
      expect(hasActionPermission('rdo.create', 'Colaborador')).toBe(true);
      expect(hasActionPermission('rdo.approve', 'Colaborador')).toBe(false);
      expect(hasActionPermission('rdo.approve', 'Gerente')).toBe(true);
    });
  });

  describe('ProtectedRoute Component', () => {
    const TestComponent = () => <div>Protected Content</div>;

    it('should render content for authorized users', () => {
      mockAuthContext.hasAnyRole.mockReturnValue(true);
      
      const { getByText } = render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute roles={['Colaborador']}>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(getByText('Protected Content')).toBeDefined();
    });
  });
});