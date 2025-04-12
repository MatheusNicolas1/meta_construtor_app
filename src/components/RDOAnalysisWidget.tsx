
import React, { useState } from 'react';
import { useRDOAnalysis } from '@/hooks/useRDOAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface RDOAnalysisWidgetProps {
  rdoId: string;
  className?: string;
}

export function RDOAnalysisWidget({ rdoId, className }: RDOAnalysisWidgetProps) {
  const { analyzeRDO, loading, analysisResult } = useRDOAnalysis();
  const { resolvedTheme } = useTheme();
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const handleAnalyzeRDO = () => {
    analyzeRDO(rdoId);
    setIsAnalyzed(true);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Análise do RDO</span>
          {!isAnalyzed && (
            <Button 
              onClick={handleAnalyzeRDO} 
              variant="default" 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                'Analisar RDO'
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
            <p className="text-sm text-muted-foreground">
              Analisando dados do RDO com IA...
            </p>
          </div>
        )}
        
        {!loading && isAnalyzed && analysisResult && (
          <div className={cn(
            "prose max-w-none",
            resolvedTheme === "dark" ? "prose-invert" : ""
          )}>
            <div 
              className="text-sm whitespace-pre-line" 
              style={{ 
                whiteSpace: 'pre-line',
                lineHeight: '1.6'
              }}
            >
              {analysisResult.analysis}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Análise gerada pela IA com base nos dados do RDO.</p>
            </div>
          </div>
        )}
        
        {!loading && isAnalyzed && !analysisResult && (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Não foi possível gerar uma análise para este RDO.
            </p>
            <Button 
              onClick={handleAnalyzeRDO}
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Tentar Novamente
            </Button>
          </div>
        )}
        
        {!loading && !isAnalyzed && (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Clique no botão "Analisar RDO" para gerar uma análise do relatório com IA.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
