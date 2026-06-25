import * as React from "react"
import { cn } from "../../lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "w-full px-4 py-3 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5E34]/20 transition-colors resize-none",
          error ? "border-red-500 focus:border-red-500" : "border-stone-200 focus:border-[#8B5E34]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
