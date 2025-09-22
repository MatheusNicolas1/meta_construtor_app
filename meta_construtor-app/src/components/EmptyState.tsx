import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium text-card-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
      {action && (
        <Button 
          className="mt-4 gradient-construction border-0" 
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}