import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50 active:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#8B5E34] text-white shadow-lg shadow-[#8B5E34]/20 hover:bg-[#764f2c] hover:-translate-y-0.5",
        destructive:
          "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 hover:-translate-y-0.5",
        outline:
          "border-2 border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900",
        secondary:
          "bg-stone-100 text-stone-900 hover:bg-stone-200",
        ghost: "hover:bg-stone-100 hover:text-stone-900",
        "ghost-primary": "text-stone-400 hover:text-[#8B5E34] hover:bg-[#8B5E34]/10",
        "ghost-destructive": "text-stone-400 hover:text-red-500 hover:bg-red-50",
        link: "text-[#8B5E34] underline-offset-4 hover:underline",
        success: "bg-green-600 text-white shadow-lg shadow-green-600/20 hover:bg-green-700 hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-6 py-2 min-w-[120px]",
        sm: "h-9 rounded-lg px-3 text-sm min-w-[80px]",
        lg: "h-11 rounded-xl px-8 text-lg min-w-[140px]",
        icon: "h-10 w-10 min-w-[40px] rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
