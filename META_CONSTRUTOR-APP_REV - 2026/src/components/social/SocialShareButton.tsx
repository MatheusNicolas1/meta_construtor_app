import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Instagram, Linkedin, Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SocialShareButtonProps {
  title: string;
  description: string;
  imageUrl?: string;
  obraId?: string;
  rdoId?: string;
  onShareSuccess?: () => void;
}

export const SocialShareButton = ({ 
  title, 
  description, 
  imageUrl,
  obraId,
  rdoId,
  onShareSuccess 
}: SocialShareButtonProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'linkedin' | null>(null);
  const [caption, setCaption] = useState(`${title}\n\n${description}\n\n#MetaConstrutor #EngenhariaCivil #Construção`);
  const [isSharing, setIsSharing] = useState(false);
  const [willEarnCredit, setWillEarnCredit] = useState(false);

  // Verificar se o usuário é Free e se ganhará crédito
  useEffect(() => {
    const checkCredits = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('user_credits')
          .select('plan_type')
          .eq('user_id', user.id)
          .single();

        setWillEarnCredit(data?.plan_type === 'free');
      } catch (error) {
        console.error('Erro ao verificar créditos:', error);
      }
    };
    checkCredits();
  }, []);

  const handlePlatformSelect = (platform: 'instagram' | 'linkedin') => {
    setSelectedPlatform(platform);
    setShowPreview(true);
  };

  const generateShareContent = () => {
    const baseUrl = window.location.origin;
    const shareUrl = obraId 
      ? `${baseUrl}/obras/${obraId}` 
      : rdoId 
      ? `${baseUrl}/rdo/${rdoId}` 
      : baseUrl;

    return {
      caption,
      url: shareUrl,
      imageUrl: imageUrl || '/placeholder.svg'
    };
  };

  const shareToInstagram = async () => {
    // Instagram não tem API pública para compartilhamento direto
    // Vamos copiar o conteúdo e abrir o Instagram Web
    const content = generateShareContent();
    
    try {
      await navigator.clipboard.writeText(`${content.caption}\n\n${content.url}`);
      
      // Abrir Instagram Web
      window.open('https://www.instagram.com/', '_blank');
      
      toast.info(
        "Conteúdo copiado! Cole no Instagram para publicar.",
        { duration: 5000 }
      );
      
      // Registrar tentativa de compartilhamento
      await recordShare('instagram', content.url);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error("Erro ao preparar compartilhamento");
    }
  };

  const shareToLinkedIn = async () => {
    const content = generateShareContent();
    
    try {
      // LinkedIn Share URL
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url)}`;
      
      // Abrir LinkedIn em nova janela
      const popup = window.open(linkedInUrl, '_blank', 'width=600,height=600');
      
      if (popup) {
        // Aguardar fechamento da janela para validar compartilhamento
        const checkClosed = setInterval(async () => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Assumir que compartilhou se fechou a janela
            await recordShare('linkedin', content.url);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error("Erro ao compartilhar no LinkedIn");
    }
  };

  const recordShare = async (platform: 'instagram' | 'linkedin', postUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      // Chamar função do Supabase para adicionar crédito
      const { data, error } = await supabase.rpc('add_credit_for_share', {
        p_user_id: user.id,
        p_post_url: postUrl,
        p_platform: platform
      });

      if (error) throw error;

      const result = data as { success: boolean; credits_balance: number; plan_type: string };

      if (result.plan_type === 'free') {
        toast.success(
          `🎉 Compartilhamento registrado! +1 crédito. Saldo: ${result.credits_balance}`,
          { duration: 5000 }
        );
      } else {
        toast.success("Compartilhamento registrado com sucesso!");
      }

      onShareSuccess?.();
      setShowPreview(false);
    } catch (error) {
      console.error('Erro ao registrar compartilhamento:', error);
      toast.error("Erro ao registrar compartilhamento");
    }
  };

  const handleShare = async () => {
    if (!selectedPlatform) return;
    
    setIsSharing(true);
    
    try {
      if (selectedPlatform === 'instagram') {
        await shareToInstagram();
      } else if (selectedPlatform === 'linkedin') {
        await shareToLinkedIn();
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handlePlatformSelect('instagram')}>
            <Instagram className="h-4 w-4 mr-2" />
            Instagram
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePlatformSelect('linkedin')}>
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlatform === 'instagram' ? (
                <>
                  <Instagram className="h-5 w-5" />
                  Compartilhar no Instagram
                </>
              ) : (
                <>
                  <Linkedin className="h-5 w-5" />
                  Compartilhar no LinkedIn
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Aviso sobre créditos */}
            {willEarnCredit && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Coins className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Ganhe +1 crédito!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Compartilhe este conteúdo e ganhe 1 crédito extra para criar mais RDOs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted border">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                Legenda
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Escreva uma legenda..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                {caption.length} caracteres
              </p>
            </div>

            {/* Informações sobre o compartilhamento */}
            <div className="p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
              {selectedPlatform === 'instagram' ? (
                <p>
                  💡 O conteúdo será copiado automaticamente. Cole no Instagram para publicar.
                </p>
              ) : (
                <p>
                  💡 Uma nova janela será aberta para você publicar no LinkedIn.
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleShare}
                disabled={isSharing}
                className="gap-2"
              >
                {isSharing ? "Compartilhando..." : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};