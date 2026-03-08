'use client';

import { CheckCircle2 } from 'lucide-react';

interface StatusStepperProps {
    order: {
        orderedDate?: string | Date | null;
        assignedDate?: string | Date | null;
        completedDate?: string | Date | null;
        status: string;
        submittedDate?: string | Date | null;
        paidDate?: string | Date | null;
    };
}

const STEPS = [
    { key: 'ordered', label: 'Ordered', dateField: 'orderedDate' },
    { key: 'assigned', label: 'Assigned', dateField: 'assignedDate' },
    { key: 'completed', label: 'Completed', dateField: 'completedDate' },
    { key: 'approved', label: 'Approved', dateField: null },
    { key: 'submitted', label: 'Submitted', dateField: 'submittedDate' },
    { key: 'paid', label: 'Paid', dateField: 'paidDate' },
] as const;

export default function StatusStepper({ order }: StatusStepperProps) {
    function isStepCompleted(step: typeof STEPS[number]): boolean {
        if (step.key === 'approved') {
            return order.status.includes('Approved') || isStepCompleted(STEPS[4]) || isStepCompleted(STEPS[5]);
        }
        if (step.dateField) {
            return !!(order as any)[step.dateField];
        }
        return false;
    }

    function getStepDate(step: typeof STEPS[number]): string | null {
        if (step.dateField) {
            const val = (order as any)[step.dateField];
            if (val) return new Date(val).toLocaleDateString();
        }
        return null;
    }

    // Find the current (active) step: the first incomplete step
    const completedSteps = STEPS.map(s => isStepCompleted(s));
    let activeIndex = completedSteps.indexOf(false);
    if (activeIndex === -1) activeIndex = STEPS.length; // all complete

    return (
        <div className="status-stepper">
            {STEPS.map((step, i) => {
                const completed = completedSteps[i];
                const active = i === activeIndex;
                const date = getStepDate(step);

                return (
                    <div key={step.key} className="stepper-step-wrapper">
                        {i > 0 && (
                            <div className={`stepper-line ${completed ? 'completed' : ''}`} />
                        )}
                        <div className={`stepper-step ${completed ? 'completed' : ''} ${active ? 'active' : ''}`}>
                            <div className="stepper-circle">
                                {completed ? <CheckCircle2 size={16} /> : <span>{i + 1}</span>}
                            </div>
                            <div className="stepper-label">{step.label}</div>
                            {date && <div className="stepper-date">{date}</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
