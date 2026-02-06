import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl"
  };

  return (
    <div className={cn("flex items-center font-bold", className)}>
      <span className={cn(textSizeClasses[size], "text-[#1E3A5F] dark:text-white")}>Meta</span>
      <span className={cn(textSizeClasses[size], "text-construction-orange")}>Construtor</span>
    </div>
  );
};

export default Logo;