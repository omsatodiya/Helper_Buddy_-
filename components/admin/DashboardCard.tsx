'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  index?: number;
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  index = 0,
}: DashboardCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    
    gsap.fromTo(card, 
      { 
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: index * 0.1,
        ease: 'power3.out',
      }
    );
  }, [index]);

  return (
    <Card
      ref={cardRef}
      className={cn(
        "p-4 sm:p-6 opacity-0 transition-all hover:shadow-lg",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p className={cn(
              "text-sm flex items-center gap-1 font-medium",
              trend.isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
            )}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}%
            </p>
          )}
        </div>
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
} 