// Importar componente otimizado
import OptimizedLayout from "./OptimizedLayout";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <OptimizedLayout>{children}</OptimizedLayout>;
};

export default Layout;