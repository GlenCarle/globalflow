import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        destructive:
          "border-rose-500/50 text-rose-500 dark:border-rose-500 [&>svg]:text-rose-500",
        success:
          "border-emerald-500/50 text-emerald-500 dark:border-emerald-500 [&>svg]:text-emerald-500",
        warning:
          "border-amber-500/50 text-amber-500 dark:border-amber-500 [&>svg]:text-amber-500",
        info:
          "border-blue-500/50 text-blue-500 dark:border-blue-500 [&>svg]:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef(
  ({ className, variant, icon, title, description, ...props }, ref) => {
    const Icon = getIconForVariant(variant, icon);
    
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <div className="flex flex-col gap-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && <AlertDescription>{description}</AlertDescription>}
          {props.children}
        </div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

function getIconForVariant(variant, customIcon) {
  if (customIcon) return customIcon;
  
  switch (variant) {
    case "destructive":
      return XCircle;
    case "success":
      return CheckCircle;
    case "warning":
      return AlertCircle;
    case "info":
      return Info;
    default:
      return null;
  }
}

export { Alert, AlertTitle, AlertDescription };