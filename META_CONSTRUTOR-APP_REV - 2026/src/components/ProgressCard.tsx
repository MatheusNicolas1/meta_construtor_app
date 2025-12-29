import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeColor } from "@/utils/formatters";

interface ProgressCardProps {
  title: string;
  description?: string;
  progress: number;
  status?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ProgressCard({ 
  title, 
  description, 
  progress, 
  status,
  children,
  className = "" 
}: ProgressCardProps) {
  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-card-foreground">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {status && (
            <Badge className={getStatusBadgeColor(status)}>
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium text-construction-green">{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-construction-green h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}