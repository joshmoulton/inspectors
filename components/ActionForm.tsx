'use client';

import { useActionState, useEffect, createContext, useContext } from 'react';
import { toast } from 'sonner';

export type FormErrors = Record<string, string>;
export type ActionState = { errors?: FormErrors };

const FormErrorsContext = createContext<FormErrors>({});

export function useFormErrors() {
    return useContext(FormErrorsContext);
}

interface ActionFormProps {
    action: (state: ActionState, formData: FormData) => Promise<ActionState>;
    id?: string;
    className?: string;
    children: React.ReactNode;
}

export default function ActionForm({ action, id, className, children }: ActionFormProps) {
    const [state, formAction] = useActionState(action, { errors: {} });

    useEffect(() => {
        if (state.errors && Object.keys(state.errors).length > 0) {
            toast.error('Please fix the highlighted fields');
        }
    }, [state]);

    return (
        <FormErrorsContext.Provider value={state.errors || {}}>
            <form id={id} action={formAction} className={className}>
                {children}
            </form>
        </FormErrorsContext.Provider>
    );
}
