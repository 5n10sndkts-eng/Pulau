import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

interface PremiumContainerProps extends ComponentProps<"div"> {
    variant?: "glass" | "glass-dark" | "default"
}

export function PremiumContainer({
    className,
    variant = "glass",
    children,
    ...props
}: PremiumContainerProps) {
    return (
        <div
            className={cn(
                "rounded-3xl p-6 transition-all duration-300",
                variant === "glass" && "glass",
                variant === "glass-dark" && "glass-dark",
                variant === "default" && "bg-card border shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
