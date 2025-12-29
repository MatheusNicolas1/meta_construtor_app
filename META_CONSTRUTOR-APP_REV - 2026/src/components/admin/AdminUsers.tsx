import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Search, Download, Filter } from "lucide-react";
import { format, differenceInDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inactiveDaysFilter, setInactiveDaysFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const itemsPerPage = 10;

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      // Buscar informações adicionais de cada usuário
      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          // Roles
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);
          
          // Créditos
          const { data: creditsData } = await supabase
            .from('user_credits')
            .select('credits_balance')
            .eq('user_id', profile.id)
            .single();

          // Último acesso e dias ativos
          const { data: lastActivity } = await supabase
            .from('user_activity')
            .select('created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Contar dias únicos de acesso
          const { data: uniqueDays } = await supabase
            .from('user_activity')
            .select('created_at')
            .eq('user_id', profile.id);

          const activeDays = uniqueDays 
            ? new Set(uniqueDays.map(a => format(new Date(a.created_at), 'yyyy-MM-dd'))).size 
            : 0;

          return {
            ...profile,
            roles: rolesData?.map(r => r.role) || [],
            credits: creditsData?.credits_balance || 0,
            last_access: lastActivity?.created_at,
            active_days: activeDays,
            days_since_signup: differenceInDays(new Date(), new Date(profile.created_at))
          };
        })
      );

      return usersWithData;
    }
  });

  const filteredUsers = useMemo(() => {
    return users?.filter(user => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.company?.toLowerCase().includes(searchLower);
      
      const matchesPlan = planFilter === "all" || user.plan_type === planFilter;
      const matchesRole = roleFilter === "all" || user.roles.some(role => role === roleFilter);
      
      const daysSinceLastAccess = user.last_access 
        ? differenceInDays(new Date(), new Date(user.last_access))
        : 999;
      
      const matchesInactive = 
        inactiveDaysFilter === "all" ||
        (inactiveDaysFilter === "7" && daysSinceLastAccess >= 7) ||
        (inactiveDaysFilter === "30" && daysSinceLastAccess >= 30) ||
        (inactiveDaysFilter === "90" && daysSinceLastAccess >= 90);
      
      const userCreatedAt = new Date(user.created_at);
      const matchesDateFrom = !dateFrom || userCreatedAt >= dateFrom;
      const matchesDateTo = !dateTo || userCreatedAt <= dateTo;
      
      return matchesSearch && matchesPlan && matchesRole && matchesInactive && matchesDateFrom && matchesDateTo;
    });
  }, [users, search, planFilter, roleFilter, inactiveDaysFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const exportToCSV = () => {
    if (!filteredUsers || filteredUsers.length === 0) return;
    
    const headers = [
      "Nome",
      "Email",
      "Telefone",
      "Empresa",
      "Plano",
      "Roles",
      "Créditos",
      "Último Acesso",
      "Dias Ativos",
      "Data de Cadastro",
      "Dias desde Cadastro"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.phone || ''}"`,
        `"${user.company || ''}"`,
        user.plan_type,
        `"${user.roles.join(', ')}"`,
        user.credits,
        user.last_access ? format(new Date(user.last_access), "dd/MM/yyyy HH:mm") : "Nunca",
        user.active_days,
        format(new Date(user.created_at), "dd/MM/yyyy"),
        user.days_since_signup
      ].join(","))
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `usuarios_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setPlanFilter("all");
    setRoleFilter("all");
    setInactiveDaysFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearch("");
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as roles</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Gerente">Gerente</SelectItem>
                <SelectItem value="Colaborador">Colaborador</SelectItem>
              </SelectContent>
            </Select>

            <Select value={inactiveDaysFilter} onValueChange={setInactiveDaysFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar inativos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="7">Inativos há 7+ dias</SelectItem>
                <SelectItem value="30">Inativos há 30+ dias</SelectItem>
                <SelectItem value="90">Inativos há 90+ dias</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(!dateFrom && "text-muted-foreground")}>
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Data início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(!dateTo && "text-muted-foreground")}>
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "Data fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {(planFilter !== "all" || roleFilter !== "all" || inactiveDaysFilter !== "all" || dateFrom || dateTo || search) && (
            <Button onClick={clearFilters} variant="ghost" size="sm">
              Limpar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados ({filteredUsers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Créditos</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="text-right">Dias Ativos</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.name?.substring(0, 2).toUpperCase() || 'US'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        {user.company && (
                          <p className="text-xs text-muted-foreground">{user.company}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.plan_type === 'free' ? 'secondary' : 'default'}>
                      {user.plan_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">{user.credits}</span>
                  </TableCell>
                  <TableCell>
                    {user.last_access ? (
                      <span className="text-sm">
                        {format(new Date(user.last_access), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Nunca</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">{user.active_days}</span>
                    <span className="text-xs text-muted-foreground"> dias</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                      <p className="text-xs text-muted-foreground">
                        há {user.days_since_signup} dias
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {paginatedUsers?.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <PaginationEllipsis key={page} />;
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers?.length || 0)} de {filteredUsers?.length || 0} usuários
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUsers;
