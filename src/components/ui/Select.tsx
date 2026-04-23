import * as React from "react"
import { cn } from "../../lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "w-full px-4 py-3 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5E34]/20 transition-colors appearance-none",
            error ? "border-red-500 focus:border-red-500" : "border-stone-200 focus:border-[#8B5E34]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
