'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Inbox,
    Clock,
    Calendar,
    TrendingUp,
    Sparkles,
    CheckSquare,
    AlertCircle,
    Zap,
    Target,
    BarChart3,
    Brain,
    Search,
    Filter,
    SortAsc,
    Edit2,
    Link2,
    Plus,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { useTodayList } from '@/hooks/useTodayList';
import { 
    InboxTodoItem, 
    InboxChecklistItem, 
    InboxProgressItem, 
    InboxReminderItem 
} from '@/components/InboxItemTypes';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import { generateOptimalSchedule, ScheduleItem } from '@/services/scheduleService';

type FilterType = 'all' | 'todo' | 'reminder' | 'checklist' | 'progress';
type SortType = 'priority' | 'dueDate' | 'created' | 'alphabetical';
type PriorityType = 'low' | 'medium' | 'high' | 'urgent';

export default function InboxPage() {
    // @ts-ignore
    const inbox = useNeyroStore((state: any) => state.inbox || []);
    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);
    // @ts-ignore
    const areas = useNeyroStore((state: any) => state.areas || []);
    // @ts-ignore
    const resources = useNeyroStore((state: any) => state.resources || []);
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    // @ts-ignore
    const updateInboxItem = useNeyroStore((state: any) => state.updateInboxItem);
    // @ts-ignore
    const deleteInboxItem = useNeyroStore((state: any) => state.deleteInboxItem);
    // @ts-ignore
    const classifyItem = useNeyroStore((state: any) => state.classifyItem);

    const { todayActions, addToToday } = useTodayList();
    const [timeInsights, setTimeInsights] = useState<any>(null);
    const [aiSchedule, setAiSchedule] = useState<any>(null);
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [sortType, setSortType] = useState<SortType>('priority');
    const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [showLinkModal, setShowLinkModal] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    // Filter actionable items (not completed)
    const actionableItems = useMemo(() => {
        return inbox.filter((item: any) => {
            if (item.isCompleted) return false;
            if (item.type === 'todo' || item.type === 'reminder' || item.type === 'checklist' || item.type === 'progress') {
                return true;
            }
            return false;
        });
    }, [inbox]);

    // Apply filters and search
    const filteredAndSortedItems = useMemo(() => {
        let filtered = actionableItems;

        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter((item: any) => item.type === filterType);
        }

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((item: any) => 
                item.content?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        const sorted = [...filtered].sort((a: any, b: any) => {
            switch (sortType) {
                case 'priority':
                    const priorityOrder: any = { urgent: 4, high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
                case 'dueDate':
                    if (a.dueDate && b.dueDate) {
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    }
                    if (a.dueDate) return -1;
                    if (b.dueDate) return 1;
                    return 0;
                case 'created':
                    return b.createdAt - a.createdAt;
                case 'alphabetical':
                    return (a.content || '').localeCompare(b.content || '');
                default:
                    return 0;
            }
        });

        return sorted;
    }, [actionableItems, filterType, searchQuery, sortType]);

    // Calculate time insights
    const generateTimeInsights = useCallback(() => {
        const todos = actionableItems.filter((item: any) => item.type === 'todo' || !item.type);
        const reminders = actionableItems.filter((item: any) => item.type === 'reminder');
        const checklists = actionableItems.filter((item: any) => item.type === 'checklist');
        
        // Estimate time based on items
        let totalEstimatedMinutes = 0;
        const urgentCount = actionableItems.filter((item: any) => item.priority === 'urgent' || item.priority === 'high').length;
        const dueToday = reminders.filter((item: any) => {
            if (!item.dueDate) return false;
            const due = new Date(item.dueDate);
            const today = new Date();
            return due.toDateString() === today.toDateString();
        }).length;

        // Rough estimates: 15min per todo, 30min per reminder, 45min per checklist
        totalEstimatedMinutes = (todos.length * 15) + (reminders.length * 30) + (checklists.length * 45);

        setTimeInsights({
            totalItems: actionableItems.length,
            totalEstimatedMinutes,
            totalEstimatedHours: Math.round((totalEstimatedMinutes / 60) * 10) / 10,
            urgentCount,
            dueToday,
            todosCount: todos.length,
            remindersCount: reminders.length,
            checklistsCount: checklists.length,
        });
    }, [actionableItems]);

    useEffect(() => {
        generateTimeInsights();
    }, [generateTimeInsights]);

    // Generate AI schedule with actual AI
    const generateAISchedule = async () => {
        setIsGeneratingSchedule(true);
        try {
            const scheduleItems: ScheduleItem[] = actionableItems.map((item: any) => ({
                id: item.id,
                content: item.content,
                type: item.type || 'todo',
                priority: item.priority || 'medium',
                dueDate: item.dueDate,
                dueTime: item.dueTime,
                estimatedMinutes: item.type === 'checklist' ? 45 : item.type === 'reminder' ? 30 : 15
            }));

            const schedule = await generateOptimalSchedule(scheduleItems, 8, '09:00');
            setAiSchedule(schedule);
            toast.success("AI schedule generated!");
        } catch (error) {
            console.error('Failed to generate schedule:', error);
            toast.error("Failed to generate schedule");
        } finally {
            setIsGeneratingSchedule(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item.id);
        setEditContent(item.content);
    };

    const handleSaveEdit = async (itemId: string) => {
        await updateInboxItem(itemId, { content: editContent });
        setEditingItem(null);
        setEditContent('');
        toast.success("Item updated");
    };

    const handleLinkToPara = async (itemId: string, type: 'project' | 'area' | 'resource', targetId?: string) => {
        await updateInboxItem(itemId, {
            projectId: type === 'project' ? targetId : null,
            areaId: type === 'area' ? targetId : null,
            resourceId: type === 'resource' ? targetId : null,
        });
        setShowLinkModal(null);
        toast.success(`Linked to ${type}`);
    };

    const handleAddToToday = async (item: any) => {
        await addToToday({
            id: item.id,
            title: item.content,
            priority: (item.priority || 'medium') as 'high' | 'medium' | 'low',
            timeEstimate: 30,
            energyLevel: 'medium' as const,
            sourceType: 'inbox' as const,
            sourceId: item.id,
            dueDate: item.dueDate || undefined,
        });
        toast.success("Added to Today list");
    };

    return (
        <div className="flex flex-col h-full bg-[#fff8ec]">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#ffdea5]">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#461704] tracking-tight flex items-center gap-3 mb-2">
                            <Inbox className="text-[#ff6b00] size-8" />
                            Inbox
                        </h1>
                        <p className="text-[#82330c] text-sm">
                            Your clarity center: See what to do, understand your time, and get AI-powered schedules
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-3 mt-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#82330c]" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-[#ffdea5] rounded-lg text-[#461704] placeholder-[#a13c0b]/60 focus:outline-none focus:border-[#ff6b00]/50"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as FilterType)}
                        className="px-4 py-2 bg-white border border-[#ffdea5] rounded-lg text-[#461704] focus:outline-none focus:border-[#ff6b00]/50"
                    >
                        <option value="all">All Types</option>
                        <option value="todo">Todos</option>
                        <option value="reminder">Reminders</option>
                        <option value="checklist">Checklists</option>
                        <option value="progress">Progress</option>
                    </select>
                    <select
                        value={sortType}
                        onChange={(e) => setSortType(e.target.value as SortType)}
                        className="px-4 py-2 bg-white border border-[#ffdea5] rounded-lg text-[#461704] focus:outline-none focus:border-[#ff6b00]/50"
                    >
                        <option value="priority">Priority</option>
                        <option value="dueDate">Due Date</option>
                        <option value="created">Newest</option>
                        <option value="alphabetical">A-Z</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    {/* Left Column: Time Insights */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Time Insights Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-[#ffdea5] rounded-xl p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="text-[#ff6b00] size-5" />
                                <h2 className="text-xl font-bold text-[#461704]">Time Insights</h2>
                            </div>
                            
                            {timeInsights ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#82330c]">Total Items</span>
                                        <span className="text-[#461704] font-bold text-lg">{timeInsights.totalItems}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#82330c]">Estimated Time</span>
                                        <span className="text-[#461704] font-bold text-lg">
                                            {timeInsights.totalEstimatedHours}h
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#82330c]">Urgent</span>
                                        <span className="text-red-600 font-bold">{timeInsights.urgentCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#82330c]">Due Today</span>
                                        <span className="text-[#ff6b00] font-bold">{timeInsights.dueToday}</span>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-[#ffdea5]">
                                        <div className="text-xs text-[#a13c0b] mb-2">Breakdown</div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#82330c]">Todos</span>
                                                <span className="text-[#461704]">{timeInsights.todosCount}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#82330c]">Reminders</span>
                                                <span className="text-[#461704]">{timeInsights.remindersCount}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#82330c]">Checklists</span>
                                                <span className="text-[#461704]">{timeInsights.checklistsCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[#82330c] text-sm">Calculating insights...</div>
                            )}
                        </motion.div>

                        {/* AI Schedule Generator */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white border border-[#ffdea5] rounded-xl p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Brain className="text-[#ff6b00] size-5" />
                                <h2 className="text-xl font-bold text-[#461704]">AI Schedule</h2>
                            </div>
                            
                            <Button
                                onClick={generateAISchedule}
                                disabled={isGeneratingSchedule || actionableItems.length === 0}
                                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 mb-4 disabled:opacity-20"
                            >
                                {isGeneratingSchedule ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-4 mr-2" />
                                        Generate Optimal Schedule
                                    </>
                                )}
                            </Button>
                            
                            {isGeneratingSchedule && (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-4 bg-[#ffdea5]/30 rounded w-3/4" />
                                    <div className="h-4 bg-[#ffdea5]/30 rounded w-1/2" />
                                    <div className="h-4 bg-[#ffdea5]/30 rounded w-2/3" />
                                </div>
                            )}

                            {aiSchedule && (
                                <div className="space-y-4 mt-4">
                                    <div className="flex items-center justify-between text-xs text-[#82330c] mb-2">
                                        <span>Efficiency: {Math.round(aiSchedule.efficiency * 100)}%</span>
                                        <span>{Math.round(aiSchedule.totalEstimatedMinutes / 60)}h estimated</span>
                                    </div>
                                    <div className="text-xs text-[#82330c] mb-3 p-2 bg-[#ffdea5]/20 rounded">
                                        AI-optimized schedule based on priority, due dates, and task types. Click blocks to expand and add items to Today.
                                    </div>
                                    {aiSchedule.blocks.map((block: any) => (
                                        <div key={block.period}>
                                            <button
                                                onClick={() => setExpandedSchedule(expandedSchedule === block.period ? null : block.period)}
                                                className="w-full flex items-center justify-between text-xs font-semibold text-[#82330c] uppercase tracking-wider mb-2 hover:text-[#461704] transition-colors"
                                            >
                                                <span>
                                                    {block.period.charAt(0).toUpperCase() + block.period.slice(1)} ({block.items.length}) - {block.startTime} to {block.endTime}
                                                </span>
                                                {expandedSchedule === block.period ? (
                                                    <ChevronUp className="size-4" />
                                                ) : (
                                                    <ChevronDown className="size-4" />
                                                )}
                                            </button>
                                            <AnimatePresence>
                                                {expandedSchedule === block.period && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-2"
                                                    >
                                                        {block.items.map((item: any) => {
                                                            const fullItem = actionableItems.find((i: any) => i.id === item.id);
                                                            return (
                                                                <div key={item.id} className="text-sm text-[#461704] bg-[#ffdea5]/20 rounded-lg p-3 flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <div className="font-medium">{item.content?.substring(0, 50)}{item.content?.length > 50 ? '...' : ''}</div>
                                                                        <div className="text-xs text-[#82330c] mt-1">
                                                                            {item.estimatedMinutes}min • {item.priority}
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        onClick={() => fullItem && handleAddToToday(fullItem)}
                                                                        variant="ghost"
                                                                        className="ml-2 text-xs"
                                                                        size="sm"
                                                                    >
                                                                        Add to Today
                                                                    </Button>
                                                                </div>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column: Task List */}
                    <div className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#461704] flex items-center gap-2">
                                <Target className="text-[#ff6b00] size-5" />
                                What To Do ({filteredAndSortedItems.length})
                            </h2>
                            {filteredAndSortedItems.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={async () => {
                                            const selected = filteredAndSortedItems.slice(0, 5); // Select first 5
                                            for (const item of selected) {
                                                await updateInboxItem(item.id, { isCompleted: true, completedAt: Date.now() });
                                            }
                                            toast.success(`Completed ${selected.length} items`);
                                        }}
                                        variant="ghost"
                                        className="text-xs"
                                        size="sm"
                                    >
                                        Bulk Complete
                                    </Button>
                                </div>
                            )}
                        </div>

                        {filteredAndSortedItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-[#82330c] gap-4 bg-white border border-[#ffdea5] rounded-xl">
                                <Inbox className="size-16 opacity-30 text-[#ffc56d]" />
                                <p className="text-xl font-medium text-[#461704]">No items found</p>
                                <p className="text-sm">
                                    {searchQuery ? 'Try a different search term' : 'Add tasks, reminders, or checklists to see them here.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAndSortedItems.map((item: any, index: number) => {
                                    const itemType = item.type || 'todo';
                                    const isEditing = editingItem === item.id;
                                    
                                    return (
                                        <div key={item.id} className="relative group">
                                            {/* Action buttons on hover */}
                                            <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1.5 rounded hover:bg-[#ffdea5]/30 text-[#82330c] hover:text-[#461704] transition-colors bg-white/80"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => setShowLinkModal(item.id)}
                                                    className="p-1.5 rounded hover:bg-[#ffdea5]/30 text-[#82330c] hover:text-[#461704] transition-colors bg-white/80"
                                                    title="Link to PARA"
                                                >
                                                    <Link2 className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAddToToday(item)}
                                                    className="p-1.5 rounded hover:bg-[#ffdea5]/30 text-[#82330c] hover:text-[#461704] transition-colors bg-white/80"
                                                    title="Add to Today"
                                                >
                                                    <Plus className="size-4" />
                                                </button>
                                            </div>

                                            {isEditing ? (
                                                <div className="bg-white border-2 border-[#ff6b00]/30 rounded-xl p-4">
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="w-full bg-white border border-[#ffdea5] rounded-lg p-3 text-[#461704] focus:outline-none focus:border-[#ff6b00]/50 mb-3"
                                                        rows={3}
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleSaveEdit(item.id)}
                                                            className="flex-1 bg-[#ff6b00]/10 hover:bg-[#ff6b00]/20 text-[#ff6b00]"
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                setEditingItem(null);
                                                                setEditContent('');
                                                            }}
                                                            variant="ghost"
                                                            className="flex-1"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {itemType === 'todo' && (
                                                        <InboxTodoItem
                                                            item={item}
                                                            onToggle={async () => {
                                                                await updateInboxItem(item.id, { 
                                                                    isCompleted: !item.isCompleted,
                                                                    completedAt: !item.isCompleted ? Date.now() : null
                                                                });
                                                            }}
                                                            onUpdate={async (updates) => {
                                                                await updateInboxItem(item.id, updates);
                                                            }}
                                                            onDelete={async () => {
                                                                await deleteInboxItem(item.id);
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    {itemType === 'checklist' && (
                                                        <InboxChecklistItem
                                                            item={item}
                                                            onUpdate={async (updates) => {
                                                                await updateInboxItem(item.id, updates);
                                                            }}
                                                            onDelete={async () => {
                                                                await deleteInboxItem(item.id);
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    {itemType === 'progress' && (
                                                        <InboxProgressItem
                                                            item={item}
                                                            onUpdate={async (updates) => {
                                                                await updateInboxItem(item.id, updates);
                                                            }}
                                                            onDelete={async () => {
                                                                await deleteInboxItem(item.id);
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    {itemType === 'reminder' && (
                                                        <InboxReminderItem
                                                            item={item}
                                                            onToggle={async () => {
                                                                await updateInboxItem(item.id, { 
                                                                    isCompleted: !item.isCompleted,
                                                                    completedAt: !item.isCompleted ? Date.now() : null
                                                                });
                                                            }}
                                                            onUpdate={async (updates) => {
                                                                await updateInboxItem(item.id, updates);
                                                            }}
                                                            onDelete={async () => {
                                                                await deleteInboxItem(item.id);
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Link to PARA Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-[#ffdea5] rounded-2xl p-6 max-w-md w-full"
                    >
                        <h3 className="text-xl font-bold text-[#461704] mb-4">Link to PARA</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm font-semibold text-[#82330c] mb-2">Projects</div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {activeProjects.map((project: any) => (
                                        <button
                                            key={project.id}
                                            onClick={() => handleLinkToPara(showLinkModal, 'project', project.id)}
                                            className="w-full text-left px-3 py-2 rounded-lg bg-[#ffdea5]/20 hover:bg-[#ffdea5]/30 text-[#461704] transition-colors"
                                        >
                                            {project.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-[#82330c] mb-2">Areas</div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {areas.map((area: any) => (
                                        <button
                                            key={area.id}
                                            onClick={() => handleLinkToPara(showLinkModal, 'area', area.id)}
                                            className="w-full text-left px-3 py-2 rounded-lg bg-[#ffdea5]/20 hover:bg-[#ffdea5]/30 text-[#461704] transition-colors"
                                        >
                                            {area.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-[#82330c] mb-2">Resources</div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {resources.slice(0, 10).map((resource: any) => (
                                        <button
                                            key={resource.id}
                                            onClick={() => handleLinkToPara(showLinkModal, 'resource', resource.id)}
                                            className="w-full text-left px-3 py-2 rounded-lg bg-[#ffdea5]/20 hover:bg-[#ffdea5]/30 text-[#461704] transition-colors"
                                        >
                                            {resource.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowLinkModal(null)}
                            variant="ghost"
                            className="w-full mt-4"
                        >
                            Cancel
                        </Button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
