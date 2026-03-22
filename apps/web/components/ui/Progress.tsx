import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    indicatorColor?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value, indicatorColor = "bg-accent", ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "relative h-1 w-full overflow-hidden rounded-full bg-[#F4F4F5]",
                className
            )}
            {...props}
        >
            <div
                className={cn("h-full w-full flex-1 transition-all rounded-full", indicatorColor)}
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </div>
    )
)
Progress.displayName = "Progress"

export { Progress }
