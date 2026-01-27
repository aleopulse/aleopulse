import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Users } from "lucide-react";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  const features = [
    {
      icon: Shield,
      title: "Privacy-First",
      description: "Your votes and data are protected by zero-knowledge proofs",
    },
    {
      icon: Zap,
      title: "Earn Rewards",
      description: "Get PULSE tokens for participating in polls and surveys",
    },
    {
      icon: Users,
      title: "Build Community",
      description: "Create engaging polls and gather authentic insights",
    },
  ];

  return (
    <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-3">
        <h1 className="text-4xl font-display font-bold tracking-tight">
          Welcome to AleoPulse
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          The privacy-preserving platform for polls, surveys, and community
          governance on Aleo
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="pt-4">
        <Button size="lg" onClick={onNext} className="gap-2">
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
