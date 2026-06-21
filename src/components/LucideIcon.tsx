import * as Lucide from "lucide-react";

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
  [key: string]: any;
}

export function LucideIcon({ name, className = "", size = 20, ...props }: LucideIconProps) {
  // Map string names to components
  const IconComponent = (Lucide as any)[name] || Lucide.HelpCircle;
  return <IconComponent className={className} size={size} {...props} />;
}
