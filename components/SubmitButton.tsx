'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export default function SubmitButton({ children, className = 'btn btn-primary', ...props }: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className={className}
            disabled={pending}
            {...props}
        >
            {pending ? <><Loader2 size={14} className="spin" /> Saving...</> : children}
        </button>
    );
}
