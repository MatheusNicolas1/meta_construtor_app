import { useState, useCallback } from 'react';

export interface Equipamento {
  id: string;
  nome: string;
  categoria: string;
  modelo: string;
  status: "Disponível" | "Ativo" | "Manutenção" | "Inativo";
  obra?: string;
  tipo?: "Próprio" | "Aluguel";
}

export function useEquipamentos() {
  // Mock data - would come from API in real app
  const [equipamentos] = useState<Equipamento[]>([
    {
      id: "eq-1",
      nome: "Betoneira B-400",
      categoria: "Concreto",
      modelo: "B-400L",
      status: "Disponível",
      tipo: "Próprio"
    },
    {
      id: "eq-2", 
      nome: "Grua Torre GTR-50",
      categoria: "Elevação",
      modelo: "GTR-50T",
      status: "Disponível",
      tipo: "Aluguel"
    },
    {
      id: "eq-3",
      nome: "Compressor AR-200",
      categoria: "Pneumático", 
      modelo: "AR-200HP",
      status: "Disponível",
      tipo: "Próprio"
    },
    {
      id: "eq-4",
      nome: "Escavadeira CAT-320",
      categoria: "Terraplanagem",
      modelo: "CAT320DL",
      status: "Disponível",
      tipo: "Aluguel"
    },
    {
      id: "eq-5",
      nome: "Vibrador de Concreto VC-45",
      categoria: "Concreto",
      modelo: "VC-45mm",
      status: "Disponível",
      tipo: "Próprio"
    }
  ]);

  const searchEquipamentos = useCallback((searchTerm: string): Equipamento[] => {
    if (!searchTerm) return equipamentos;
    
    return equipamentos.filter(eq => 
      eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [equipamentos]);

  const getEquipamentoById = useCallback((id: string): Equipamento | undefined => {
    return equipamentos.find(eq => eq.id === id);
  }, [equipamentos]);

  return {
    equipamentos,
    searchEquipamentos,
    getEquipamentoById,
  };
}