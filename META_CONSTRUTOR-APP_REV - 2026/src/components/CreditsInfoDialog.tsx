import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Share2, FileText, Instagram, Linkedin, HelpCircle } from "lucide-react";

export const CreditsInfoDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Como funciona o Sistema de Créditos?
          </DialogTitle>
          <DialogDescription>
            Sistema de gamificação para usuários do Plano Free
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Visão Geral */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">📊 Visão Geral</h3>
            <p className="text-sm text-muted-foreground">
              O sistema de créditos foi criado para incentivar o compartilhamento de suas obras e RDOs nas redes sociais,
              aumentando a visibilidade do seu trabalho enquanto você ganha benefícios!
            </p>
          </div>

          {/* Créditos Iniciais */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Créditos Iniciais</h4>
                <p className="text-sm text-muted-foreground">
                  Você começa com <strong className="text-foreground">7 créditos gratuitos</strong> ao criar sua conta. A plataforma é 100% gratuita!
                </p>
              </div>
            </div>
          </Card>

          {/* Como Usar */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Como usar seus créditos
            </h3>
            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Criação de RDO:</strong> -1 crédito por novo relatório
                </p>
                <p className="text-xs text-muted-foreground">
                  Cada vez que você criar um novo RDO (Relatório Diário de Obra), será consumido 1 crédito.
                </p>
              </div>
            </Card>
          </div>

          {/* Como Ganhar */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Como ganhar mais créditos
            </h3>
            <Card className="p-4 bg-green-500/5 border-green-500/20">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Instagram className="h-5 w-5 text-pink-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Instagram</h4>
                    <p className="text-xs text-muted-foreground">
                      Compartilhe suas obras ou RDOs no Instagram e ganhe <strong className="text-foreground">+1 crédito</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Linkedin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">LinkedIn</h4>
                    <p className="text-xs text-muted-foreground">
                      Compartilhe no LinkedIn e ganhe <strong className="text-foreground">+1 crédito</strong>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Planos Premium */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">✨ Créditos Ilimitados</h4>
              <p className="text-xs text-muted-foreground">
                Usuários dos planos <strong className="text-foreground">Premium</strong> têm créditos ilimitados e podem criar quantos RDOs quiserem!
              </p>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                Ver Planos Premium
              </Button>
            </div>
          </Card>

          {/* Dicas */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
            <h4 className="font-semibold text-sm">💡 Dicas</h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Compartilhe regularmente para manter seus créditos sempre positivos</li>
              <li>Use hashtags relevantes para aumentar o alcance dos seus posts</li>
              <li>O sistema valida automaticamente seus compartilhamentos</li>
              <li>Seu histórico de compartilhamentos fica salvo no sistema</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
