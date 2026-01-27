import { cn } from "@/lib/utils";
import { POLL_STATUS } from "@/types/poll";
import { Check, Play, Gift, Lock, Flag } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PollLifecycleStepperProps {
  currentStatus: number;
  className?: string;
  compact?: boolean;
}

const steps = [
  {
    status: POLL_STATUS.ACTIVE,
    label: "Active",
    icon: Play,
    tooltip: "Poll is accepting votes. Participants can vote during this phase.",
    color: "text-green-500",
    bgColor: "bg-green-500",
    borderColor: "border-green-500",
  },
  {
    status: POLL_STATUS.CLAIMING,
    label: "Claiming",
    icon: Gift,
    tooltip: "Voting closed. Participants can now claim their rewards.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-500",
  },
  {
    status: POLL_STATUS.CLOSED,
    label: "Closed",
    icon: Lock,
    tooltip: "Claims stopped. Grace period before finalization.",
    color: "text-slate-500",
    bgColor: "bg-slate-500",
    borderColor: "border-slate-500",
  },
  {
    status: POLL_STATUS.FINALIZED,
    label: "Finalized",
    icon: Flag,
    tooltip: "Poll complete. All unclaimed rewards sent to treasury.",
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    borderColor: "border-blue-500",
  },
];

export function PollLifecycleStepper({
  currentStatus,
  className,
  compact = false,
}: PollLifecycleStepperProps) {
  const currentIndex = steps.findIndex((s) => s.status === currentStatus);

  if (compact) {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-1", className)}>
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;

            return (
              <Tooltip key={step.status}>
                <TooltipTrigger>
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      isCompleted && `${step.bgColor} text-white`,
                      isCurrent && `${step.borderColor} border-2 ${step.color}`,
                      !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-semibold">{step.label}</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    {step.tooltip}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("relative", className)}>
        {/* Progress Line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-10" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500 -z-10"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;

            return (
              <Tooltip key={step.status}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center cursor-default">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        isCompleted && `${step.bgColor} border-transparent text-white`,
                        isCurrent && `${step.borderColor} bg-background ${step.color}`,
                        !isCompleted && !isCurrent && "border-muted bg-background text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-xs font-medium transition-colors",
                        isCurrent && step.color,
                        isCompleted && "text-foreground",
                        !isCompleted && !isCurrent && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-semibold">{step.label}</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    {step.tooltip}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
