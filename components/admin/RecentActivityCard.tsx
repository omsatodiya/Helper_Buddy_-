'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
  className?: string;
}

export function RecentActivityCard({ activities, className }: RecentActivityCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const items = card.querySelectorAll('.activity-item');
    
    gsap.fromTo(card,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );

    gsap.fromTo(items,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.3,
      }
    );
  }, []);

  return (
    <Card 
      ref={cardRef} 
      className={cn(
        "opacity-0 transition-all hover:shadow-lg",
        className
      )}
    >
      <CardHeader className="p-4 sm:p-6">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="activity-item flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-md p-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.user}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {activity.timestamp}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 