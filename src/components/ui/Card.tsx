import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-3xl border border-stone-200 bg-white text-stone-950 shadow-sm overflow-hidden transition-all hover:shadow-md group flex flex-col", className)} {...props} />
))
Card.displayName = "Card"

const CardImageWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative overflow-hidden", className)} {...props} />
))
CardImageWrapper.displayName = "CardImageWrapper"

const CardImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(({ className, ...props }, ref) => (
  <img ref={ref} className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", className)} referrerPolicy="no-referrer" {...props} />
))
CardImage.displayName = "CardImage"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-bold leading-tight tracking-tight text-stone-900 transition-colors", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-stone-600 leading-relaxed", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 flex-grow flex flex-col", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0 mt-auto", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardImageWrapper, CardImage }
