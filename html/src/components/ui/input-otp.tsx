import * as React from "react"
import { HashIcon as DashIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
  )
)
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center", className)} {...props} />
  )
)
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        className={cn(
          "w-10 h-12 text-center text-2xl font-bold rounded-md border border-input bg-background transition-all",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "absolute inset-0 opacity-0"
        )}
        {...props}
      />
      <div
        className={cn(
          "w-10 h-12 flex items-center justify-center text-2xl font-bold rounded-md border border-input bg-background/10 backdrop-blur-sm",
          "transition-all peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          className
        )}
      >
        {props.value ? (
          <span className="text-primary animate-in fade-in-75 zoom-in-75">{props.value}</span>
        ) : (
          <DashIcon className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
    </div>
  )
)
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <DashIcon className="w-4 h-4 text-muted-foreground" />
    </div>
  )
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }