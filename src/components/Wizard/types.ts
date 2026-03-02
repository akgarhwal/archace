import React from 'react';


export type Step = 1 | 2 | 3;

export interface Node {
    id: string;
    parentId: string | null;
    name: string;
    description?: string;
    icon?: React.ElementType; // For React Icons
    iconName?: string; // For Lucide icon names
    type: 'domain' | 'technology';
}

export interface Domain extends Node {
    type: 'domain';
    parentId: null;
    iconName: string; // Domains use Lucide names
    description: string;
}

export interface Technology extends Node {
    type: 'technology';
    parentId: string; // Technologies must have a parent
    icon: React.ElementType; // Technologies use React Icons
}

export type RevisionMode = 'quiz' | 'flashcards';

export type Level = 'junior' | 'senior' | 'staff';

export type Difficulty = 'easy' | 'medium' | 'hard';

// Maps each Level × RevisionMode to a Google Sheet GID
export type SheetGidMap = Record<Level, Record<RevisionMode, string>>;

export interface WizardState {
    step: Step;
    level: Level | null;
    mode: RevisionMode | null;
}
