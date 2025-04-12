
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RDOAnalysisResult {
  analysis: string;
  rdoData: any;
}

export function useRDOAnalysis() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeRDO = async (rdoId: string, question?: string): Promise<RDOAnalysisResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-rdo', {
        body: { rdoId, question },
      });
      
      if (error) throw new Error(error.message);
      
      return {
        analysis: data.analysis,
        rdoData: data.rdoData
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: ({ rdoId, question }: { rdoId: string, question?: string }) => 
      analyzeRDO(rdoId, question),
    onError: (err: any) => {
      toast.error(`Erro ao analisar o RDO: ${err.message}`);
    }
  });

  // Function to get analytics data for an obra
  const getObraAnalytics = async (obraId: string) => {
    try {
      const { data, error } = await supabase
        .from('obra_analytics')
        .select('*')
        .eq('obra_id', obraId)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (err: any) {
      console.error("Error fetching obra analytics:", err);
      return null;
    }
  };

  // Hook to fetch analytics data for an obra
  const useObraAnalytics = (obraId: string) => {
    return useQuery({
      queryKey: ['obra-analytics', obraId],
      queryFn: () => getObraAnalytics(obraId),
      enabled: !!obraId
    });
  };

  // Simulated WhatsApp message (for testing before we have the actual WhatsApp integration)
  const simulateWhatsAppMessage = async (rdoId: string, question: string) => {
    try {
      return await analyzeRDO(rdoId, question);
    } catch (err) {
      console.error("Error simulating WhatsApp message:", err);
      throw err;
    }
  };

  return {
    loading: loading || mutation.isPending,
    error,
    analyzeRDO: (rdoId: string, question?: string) => 
      mutation.mutate({ rdoId, question }),
    analysisResult: mutation.data,
    useObraAnalytics,
    simulateWhatsAppMessage
  };
}
