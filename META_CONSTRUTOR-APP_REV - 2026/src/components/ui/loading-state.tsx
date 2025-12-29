import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({ 
  message = "Carregando...", 
  size = "md",
  className 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2 py-8", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  message = "Algo deu errado", 
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4 py-8", className)}>
      <div className="text-destructive">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-card-foreground">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="text-sm text-primary hover:underline"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}