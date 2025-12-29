import { toast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";

export const toastEnhanced = {
  success: (message: string, description?: string) => {
    toast({
      title: message,
      description,
      className: "border-construction-green bg-construction-green/10",
      action: <CheckCircle className="h-4 w-4 text-construction-green" />
    });
  },

  error: (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: "destructive",
      action: <XCircle className="h-4 w-4" />
    });
  },

  warning: (message: string, description?: string) => {
    toast({
      title: message,
      description,
      className: "border-construction-orange bg-construction-orange/10",
      action: <AlertCircle className="h-4 w-4 text-construction-orange" />
    });
  },

  info: (message: string, description?: string) => {
    toast({
      title: message,
      description,
      className: "border-construction-blue bg-construction-blue/10",
      action: <Info className="h-4 w-4 text-construction-blue" />
    });
  }
};