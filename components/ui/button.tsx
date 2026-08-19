import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
    const variants = {
      default: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-zinc-800 bg-transparent hover:bg-zinc-800 text-zinc-100",
    }
    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-base",
    }

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"