"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle2,
  Quote,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpandable } from "@/hooks/use-expandable";
import { useNavigate } from "react-router-dom";

interface FeatureExpandableCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  benefits: Array<{ title: string; completed: boolean }>;
  stats: {
    improvement: number;
    users: string;
    satisfaction: number;
  };
  testimonial: {
    name: string;
    role: string;
    quote: string;
  };
}

export function FeatureExpandableCard({
  icon: Icon,
  title,
  description,
  href,
  benefits,
  stats,
  testimonial,
}: FeatureExpandableCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleExpand();
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Scroll to demo section instead of navigating to internal pages
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Card
      className="w-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-border bg-card h-full flex flex-col"
      onClick={handleCardClick}
    >
      <CardHeader className="space-y-1 p-6">
        <div className="space-y-4">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
        <div className="space-y-4 flex-1">
          {/* Improvement Badge */}
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            >
              +{stats.improvement}% melhoria
            </Badge>
          </div>

          <motion.div
            style={{ height: animatedHeight }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div ref={contentRef}>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 pt-4"
                  >
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {stats.users}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Usuários
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {stats.satisfaction}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Satisfação
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Principais benefícios
                      </h4>
                      <div className="space-y-2">
                        {benefits.map((benefit, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground flex items-center">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                              {benefit.title}
                            </span>
                            {benefit.completed && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <Quote className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground italic">
                          "{testimonial.quote}"
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full" 
                      onClick={handleNavigate}
                    >
                      Explorar Funcionalidade
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}