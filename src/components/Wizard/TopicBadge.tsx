import React from 'react';

export const TopicBadge: React.FC<{ section?: string }> = ({ section }) => {
    if (!section) return null;
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-700/10 text-emerald-900 border border-emerald-700/15">
            {section}
        </span>
    );
};
