import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: "up" | "down" | "neutral";
    variant?: "default" | "success" | "warning" | "primary";
}

const MetricCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    variant = "default",
}: MetricCardProps) => {
    const variantStyles = {
        default: "border-border/40",
        success: "border-success/20 bg-success/5",
        warning: "border-warning/20 bg-warning/5",
        primary: "border-primary/20 bg-primary/5",
    };

    return (
        <Card
            className={cn(
                "p-6 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/40",
                variantStyles[variant]
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="flex items-baseline space-x-2">
                        <p className="text-3xl font-bold tracking-tight">{value}</p>
                        {trend && (
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    trend === "up" && "text-success",
                                    trend === "down" && "text-destructive",
                                    trend === "neutral" && "text-muted-foreground"
                                )}
                            >
                                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
                <div
                    className={cn(
                        "rounded-full p-3",
                        variant === "success" && "bg-success/10",
                        variant === "warning" && "bg-warning/10",
                        variant === "primary" && "bg-primary/10",
                        variant === "default" && "bg-muted"
                    )}
                >
                    <Icon
                        className={cn(
                            "h-5 w-5",
                            variant === "success" && "text-success",
                            variant === "warning" && "text-warning",
                            variant === "primary" && "text-primary",
                            variant === "default" && "text-foreground"
                        )}
                    />
                </div>
            </div>
        </Card>
    );
};

export default MetricCard
