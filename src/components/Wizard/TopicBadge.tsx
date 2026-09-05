import React from 'react';

export const TopicBadge: React.FC<{ section?: string }> = ({ section }) => {
    if (!section) return null;
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-stone-100 text-stone-700 border border-stone-200">
            {section}
        </span>
    );
};
