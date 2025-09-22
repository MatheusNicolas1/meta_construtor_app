import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
  }[];
  onClearAll?: () => void;
  className?: string;
}

export function SearchFilter({ 
  searchTerm, 
  onSearchChange, 
  filters = [], 
  onClearAll,
  className = ""
}: SearchFilterProps) {
  const hasActiveFilters = searchTerm || filters.some(filter => filter.value && filter.value !== "all");

  return (
    <div className={`grid gap-4 ${filters.length > 0 ? `md:grid-cols-${Math.min(filters.length + 2, 5)}` : 'md:grid-cols-2'} ${className}`}>
      <div className="space-y-2">
        <Label>Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Digite para buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {filters.map((filter, index) => (
        <div key={index} className="space-y-2">
          <Label>{filter.label}</Label>
          <Select value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || `Todos os ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os {filter.label.toLowerCase()}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      
      {hasActiveFilters && onClearAll && (
        <div className="space-y-2 flex items-end">
          <Button 
            variant="outline" 
            onClick={onClearAll}
            className="w-full"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}