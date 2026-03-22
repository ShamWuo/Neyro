// Mock use-toast hook for demo purposes
import { useState } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState<any[]>([]);

    const toast = (props: any) => {
        // In a real app this would add to global toast context
        // For demo, we just log it since Shadcn's Toaster might not be fully wired up 
        // or we can just rely on basic alerts if needed.
        console.log("TOAST:", props.title, props.description);
    };

    return { toast, toasts };
}
