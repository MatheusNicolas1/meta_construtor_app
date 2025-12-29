import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Plus, Percent, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const AdminCoupons = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_percentage: 10,
    valid_until: '',
    usage_limit: null as number | null,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createCoupon = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('coupons')
        .insert({
          ...newCoupon,
          created_by: user.id,
          code: newCoupon.code.toUpperCase()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsCreating(false);
      setNewCoupon({
        code: '',
        discount_percentage: 10,
        valid_until: '',
        usage_limit: null,
        is_active: true
      });
      toast.success('Cupom criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar cupom: ' + error.message);
    }
  });

  const toggleCoupon = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Status do cupom atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar cupom: ' + error.message);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Coupon Form */}
      {!isCreating ? (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={() => setIsCreating(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Cupom
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Cupom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Código do Cupom</Label>
                <Input
                  id="code"
                  placeholder="DESCONTO10"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  value={newCoupon.discount_percentage}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_percentage: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">Válido Até</Label>
                <Input
                  id="valid_until"
                  type="datetime-local"
                  value={newCoupon.valid_until}
                  onChange={(e) => setNewCoupon({ ...newCoupon, valid_until: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Limite de Uso (opcional)</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  min="1"
                  placeholder="Ilimitado"
                  value={newCoupon.usage_limit || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newCoupon.is_active}
                  onCheckedChange={(checked) => setNewCoupon({ ...newCoupon, is_active: checked })}
                />
                <Label htmlFor="is_active">Cupom ativo</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => createCoupon.mutate()} disabled={!newCoupon.code || createCoupon.isPending}>
                  Criar Cupom
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coupons List */}
      <div className="grid gap-4">
        {coupons?.map((coupon) => (
          <Card key={coupon.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-mono">{coupon.code}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                      {coupon.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {coupon.valid_until && new Date(coupon.valid_until) < new Date() && (
                      <Badge variant="destructive">Expirado</Badge>
                    )}
                  </div>
                </div>
                <Switch
                  checked={coupon.is_active}
                  onCheckedChange={(checked) => toggleCoupon.mutate({ id: coupon.id, is_active: checked })}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{coupon.discount_percentage}% de desconto</p>
                  </div>
                </div>
                {coupon.valid_until && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">
                        Válido até {format(new Date(coupon.valid_until), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">
                      {coupon.times_used} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : ''} usos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {coupons?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum cupom criado ainda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCoupons;
