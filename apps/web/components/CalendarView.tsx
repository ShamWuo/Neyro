'use client';

import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    startTime?: string;
    duration?: number;
    title: string;
    type?: 'focus' | 'meeting' | 'task' | 'reminder';
    isCompleted?: boolean;
}

interface CalendarViewProps {
    events: CalendarEvent[];
    onDateClick?: (date: string) => void;
    onEventClick?: (event: CalendarEvent) => void;
}

export function CalendarView({ events, onDateClick, onEventClick }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
    };
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const getEventsForDate = (date: Date): CalendarEvent[] => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(e => e.date === dateStr);
    };
    
    const days = useMemo(() => {
        const daysArray: (Date | null)[] = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            daysArray.push(null);
        }
        
        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            daysArray.push(new Date(year, month, day));
        }
        
        return daysArray;
    }, [year, month, firstDayOfWeek, daysInMonth]);
    
    return (
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="size-5 text-primary" />
                    {monthName}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="size-5 text-neutral-400" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronRight className="size-5 text-neutral-400" />
                    </button>
                </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-semibold text-neutral-500">
                        {day}
                    </div>
                ))}
                
                {/* Calendar Days */}
                {days.map((date, index) => {
                    if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }
                    
                    const dateStr = date.toISOString().split('T')[0];
                    const isToday = dateStr === todayStr;
                    const isCurrentMonth = date.getMonth() === month;
                    const dayEvents = getEventsForDate(date);
                    
                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDateClick?.(dateStr)}
                            className={cn(
                                "aspect-square p-1 rounded-lg transition-all relative",
                                isToday && "ring-2 ring-primary",
                                isCurrentMonth 
                                    ? "hover:bg-white/10" 
                                    : "opacity-30",
                                dayEvents.length > 0 && "bg-primary/10"
                            )}
                        >
                            <div className={cn(
                                "text-sm font-medium mb-1",
                                isToday ? "text-primary" : isCurrentMonth ? "text-white" : "text-neutral-600"
                            )}>
                                {date.getDate()}
                            </div>
                            {dayEvents.length > 0 && (
                                <div className="space-y-0.5">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick?.(event);
                                            }}
                                            className={cn(
                                                "text-[10px] px-1 py-0.5 rounded truncate",
                                                event.isCompleted 
                                                    ? "bg-green-500/20 text-green-400" 
                                                    : "bg-primary/20 text-primary"
                                            )}
                                            title={event.title}
                                        >
                                            {event.startTime && (
                                                <span className="mr-1">{event.startTime}</span>
                                            )}
                                            {event.title}
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-[10px] text-neutral-500 px-1">
                                            +{dayEvents.length - 2} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded bg-primary/20 border border-primary/30" />
                    <span className="text-neutral-400">Has events</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded ring-2 ring-primary" />
                    <span className="text-neutral-400">Today</span>
                </div>
            </div>
        </div>
    );
}
