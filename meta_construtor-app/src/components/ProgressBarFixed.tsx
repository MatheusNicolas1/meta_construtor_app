import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarFixedProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBarFixed({
  value,
  max = 100,
  showPercentage = true,
  variant = "default",
  size = "md",
  className
}: ProgressBarFixedProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const variantClasses = {
    default: "bg-primary",
    success: "bg-construction-green", 
    warning: "bg-construction-orange",
    error: "bg-destructive"
  };

  const sizeClasses = {
    sm: "h-2",
    md: "h-3", 
    lg: "h-4"
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showPercentage && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium text-card-foreground">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <div 
          className={cn("h-full transition-all duration-500 ease-out", variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}