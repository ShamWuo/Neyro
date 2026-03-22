'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Image as ImageIcon, Link2, ChevronDown, Check, X } from 'lucide-react';
import { useDemoStore, PARACategory } from '@/store/demo-store';
import { cn } from '@/lib/utils';
import { useToast } from '../hooks/use-toast';

function classifyInput(text: string): { category: PARACategory; reason: string; label: string; icon: string; sub: string } {
    const lower = text.toLowerCase();

    if (/finish|complete|build|launch|create|deadline|by (monday|tuesday|wednesday|thursday|friday|saturday|sunday|jan|feb|mar|next week)|due|ship|deliver/.test(lower)) {
        return { category: 'projects', label: 'Projects', icon: '📁', sub: 'Things with a finish line', reason: 'I detected a goal with a clear outcome — this has a finish line.' };
    }
    if (/health|fitness|workout|exercise|finance|budget|money|savings|relationship|family|friend|career|work|job|learning|habit|routine|weekly|monthly/.test(lower)) {
        return { category: 'areas', label: 'Areas', icon: '🔄', sub: 'Ongoing responsibilities', reason: 'This sounds like an ongoing responsibility, not a one-time task.' };
    }
    if (/article|read|research|idea|note|reference|link|book|learn|interesting|thoughts on|how to|guide|template/.test(lower)) {
        return { category: 'resources', label: 'Resources', icon: '📚', sub: 'Reference material', reason: 'This looks like reference material you\'ll want to come back to.' };
    }

    return { category: 'projects', label: 'Projects', icon: '📁', sub: 'Things with a finish line', reason: 'Most captured items end up being actionable projects.' };
}

export function QuickCaptureModal() {
    const isOpen = useDemoStore(state => state.isCaptureOpen);
    const setCaptureOpen = useDemoStore(state => state.setCaptureOpen);
    const onClose = () => setCaptureOpen(false);

    const [content, setContent] = useState('');
    const [isReading, setIsReading] = useState(false);
    const [classification, setClassification] = useState<ReturnType<typeof classifyInput> | null>(null);
    const [isModifying, setIsModifying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [animationState, setAnimationState] = useState<'idle' | 'confirming' | 'flying'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addCapture = useDemoStore(state => state.addCapture);
    const { toast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [prevIsOpenInternal, setPrevIsOpenInternal] = useState(isOpen);
    if (isOpen !== prevIsOpenInternal) {
        setPrevIsOpenInternal(isOpen);
        if (!isOpen) {
            setContent('');
            setClassification(null);
            setIsReading(false);
            setAnimationState('idle');
            setIsModifying(false);
        }
    }

    // Auto-focus on open
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Typing debounce logic
    useEffect(() => {
        const words = content.trim().split(/\s+/).length;
        const hasUrl = /https?:\/\/[^\s]+/.test(content);

        if (words < 3 && !hasUrl) {
            const clearTimer = setTimeout(() => {
                setClassification(null);
                setIsReading(false);
            }, 0);
            return () => clearTimeout(clearTimer);
        }

        const timer = setTimeout(() => {
            setIsReading(false);
            if (hasUrl) {
                setClassification({
                    category: 'resources',
                    label: 'Resources',
                    icon: '📚',
                    sub: 'Reference material',
                    reason: 'I detected a URL — this looks like a resource to save.'
                });
            } else {
                setClassification(classifyInput(content));
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [content]);

    const handleVoiceToggle = () => {
        if (!isRecording) {
            setIsRecording(true);
            toast({ title: "Recording...", description: "Listening to your thoughts (Demo)" });
            // Simulate voice-to-text
            setTimeout(() => {
                setContent(prev => prev + (prev ? " " : "") + "Draft slide for the investor deck regarding traction.");
                setIsRecording(false);
                toast({ title: "Voice Captured", description: "Converted audio to text." });
            }, 3000);
        } else {
            setIsRecording(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setContent(prev => prev + (prev ? " " : "") + `[Attached Photo: ${file.name}]`);
            toast({ title: "Photo Attached", description: `${file.name} ready for classification.` });
        }
    };

    const handleConfirm = () => {
        if (!classification || animationState !== 'idle') return;

        setAnimationState('confirming');

        // Add to store
        addCapture({
            content,
            category: classification.label
        });

        // Trigger animations - Faster sequence
        setTimeout(() => {
            setAnimationState('flying');

            setTimeout(() => {
                toast({
                    title: `Added to ${classification.label} ✓`,
                    description: content.length > 50 ? content.substring(0, 50) + '...' : content,
                    variant: 'default',
                    className: 'border-l-[3px] border-l-teal'
                });

                // Simulate Demo Intelligence Notification
                if (classification.category === 'projects') {
                    setTimeout(() => {
                        toast({
                            title: `💡 Smart Connection`,
                            description: `This connects to 'Investor Pitch Deck' from 3 days ago.`,
                            variant: 'default',
                            className: 'border-l-[3px] border-l-accent'
                        });
                    }, 400);
                }

                onClose();
            }, 300);
        }, 150);
    };

    const categories = [
        { id: 'projects', label: 'Projects', icon: '📁', sub: 'Things with a finish line', reason: 'Manually categorized as a project.' },
        { id: 'areas', label: 'Areas', icon: '🔄', sub: 'Ongoing responsibilities', reason: 'Manually categorized as an area.' },
        { id: 'resources', label: 'Resources', icon: '📚', sub: 'Reference material', reason: 'Manually categorized as reference material.' },
    ];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (classification) handleConfirm();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen && animationState === 'idle') return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-zinc-900/25 backdrop-blur-[2px] z-50"
                        onClick={() => animationState === 'idle' && onClose()}
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={
                                animationState === 'idle' ? { opacity: 1, scale: 1, y: 0 } :
                                    animationState === 'confirming' ? { scale: 0.9, opacity: 0.8 } :
                                        { scale: 0.1, x: -300, y: -200, opacity: 0 }
                            }
                            transition={{
                                type: animationState === 'idle' ? 'spring' : 'tween',
                                duration: animationState === 'flying' ? 0.4 : 0.2,
                                ease: animationState === 'flying' ? 'easeIn' : 'easeOut'
                            }}
                            className={cn(
                                "bg-card border border-border rounded-modal shadow-modal w-full max-w-[480px] overflow-hidden pointer-events-auto",
                                animationState !== 'idle' && "pointer-events-none"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-4 flex items-center justify-between pointer-events-auto">
                                <span className="font-medium text-primary flex items-center gap-2 text-[13px]">
                                    <div className="w-2 h-2 rounded-full bg-accent" />
                                    Capture
                                </span>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-hover text-text-muted hover:text-primary rounded-button transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Main Input */}
                            <div className="px-4 pb-3">
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={(e) => {
                                        setContent(e.target.value);
                                        if (e.target.value.trim().length > 0) {
                                            setIsReading(true);
                                            setClassification(null);
                                        }
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type, paste, or speak..."
                                    className="w-full bg-transparent resize-none text-primary focus:outline-none min-h-[80px] text-[15px] leading-relaxed placeholder:text-text-placeholder"
                                />

                                {/* Quick Media Actions */}
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <button 
                                        onClick={handleVoiceToggle}
                                        className={cn(
                                            "px-2.5 py-1.5 border rounded-button transition-colors flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.02em]",
                                            isRecording 
                                                ? "bg-red-500/10 border-red-500/50 text-red-500 animate-pulse" 
                                                : "border-border text-text-muted hover:text-primary hover:bg-hover"
                                        )}
                                    >
                                        <Mic size={12} className={isRecording ? "animate-bounce" : ""} /> {isRecording ? "Recording..." : "Voice"}
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileSelect} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-2.5 py-1.5 border border-border rounded-button text-text-muted hover:text-primary hover:bg-hover transition-colors flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.02em]"
                                    >
                                        <ImageIcon size={12} /> Photo
                                    </button>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.readText().then(text => {
                                                if (text.startsWith('http')) {
                                                    setContent(text);
                                                    toast({ title: "Link Pasted", description: "URL detected and added to capture." });
                                                } else {
                                                    toast({ title: "Nothing to paste", description: "Clipboard doesn't contain a valid URL." });
                                                }
                                            });
                                        }}
                                        className="px-2.5 py-1.5 border border-border rounded-button text-text-muted hover:text-primary hover:bg-hover transition-colors flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.02em]"
                                    >
                                        <Link2 size={12} /> Link
                                    </button>
                                </div>
                            </div>

                            {/* AI Reading Indicator & Classification */}
                            <AnimatePresence mode="wait">
                                {isReading && (
                                    <motion.div
                                        key="reading"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-4 pb-4 flex items-center pointer-events-none"
                                    >
                                        <div className="flex items-center gap-2 text-text-muted text-[12px] font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                            Reading context...
                                        </div>
                                    </motion.div>
                                )}

                                {!isReading && classification && (
                                    <motion.div
                                        key="classification"
                                        initial={{ opacity: 0, y: 10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-4 pb-4"
                                    >
                                        <hr className="border-border mb-4 -mx-4" />
                                        
                                        {!isModifying ? (
                                            <div className="bg-card border border-border rounded-card p-3 shadow-sm flex items-start gap-3">
                                                <span className="text-xl mt-0.5">{classification.icon}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">
                                                            {classification.label}
                                                        </span>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsModifying(true);
                                                            }}
                                                            className="text-[11px] text-accent hover:text-accent-dark font-medium transition-colors flex items-center gap-1"
                                                        >
                                                            Modify <ChevronDown size={12} />
                                                        </button>
                                                    </div>
                                                    <div className="text-[13px] text-primary font-medium mb-1">
                                                        {classification.sub}
                                                    </div>
                                                    <div className="text-[12px] text-secondary leading-relaxed">
                                                        {classification.reason}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between mb-1 px-1">
                                                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">Switch Category</span>
                                                    <button onClick={() => setIsModifying(false)} className="text-[11px] text-text-muted hover:text-primary">Cancel</button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {categories.map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => {
                                                                setClassification({
                                                                    category: cat.id as PARACategory,
                                                                    label: cat.label,
                                                                    icon: cat.icon,
                                                                    sub: cat.sub,
                                                                    reason: cat.reason
                                                                });
                                                                setIsModifying(false);
                                                            }}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-card text-left transition-all border",
                                                                classification.category === cat.id 
                                                                    ? "bg-accent/5 border-accent text-accent" 
                                                                    : "bg-card border-border hover:border-accent/50 text-primary"
                                                            )}
                                                        >
                                                            <span className="text-lg">{cat.icon}</span>
                                                            <div className="flex-1">
                                                                <div className="text-[12px] font-bold">{cat.label}</div>
                                                                <div className="text-[10px] opacity-70">{cat.sub}</div>
                                                            </div>
                                                            {classification.category === cat.id && <Check size={14} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={handleConfirm}
                                                className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-accent hover:bg-accent-dark transition-colors rounded-button shadow-sm"
                                            >
                                                <Check size={14} /> Confirm
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Footer */}
                            <div className="bg-subtle text-center py-2.5 border-t border-border mt-auto">
                                <span className="text-[11px] text-text-muted">
                                    <kbd className="font-mono text-text-secondary bg-card border border-border rounded px-1.5 py-0.5 text-[9px] shadow-sm ml-1">Cmd</kbd> + <kbd className="font-mono text-text-secondary bg-card border border-border rounded px-1.5 py-0.5 text-[9px] shadow-sm">Enter</kbd> to confirm · <kbd className="font-mono text-text-secondary bg-card border border-border rounded px-1.5 py-0.5 text-[9px] shadow-sm ml-1">Esc</kbd> to close
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
