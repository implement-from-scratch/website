'use client';

import React, { useEffect, useState } from 'react';

interface ProgressIndicatorProps {
    totalChapters: number;
    currentChapterIndex: number;
    repoName: string;
}

const STORAGE_KEY_PREFIX = 'progress_';

/**
 * Progress indicator component showing chapter completion status.
 * Uses localStorage to persist progress across sessions.
 */
export function ProgressIndicator({
    totalChapters,
    currentChapterIndex,
    repoName
}: ProgressIndicatorProps): React.JSX.Element {
    const [completedChapters, setCompletedChapters] = useState<number[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    const storageKey = `${STORAGE_KEY_PREFIX}${repoName}`;

    // Load progress from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored) as unknown;
                if (Array.isArray(parsed) && parsed.every((item): item is number => typeof item === 'number')) {
                    setCompletedChapters(parsed);
                }
            }
        } catch (err) {
            console.error('Failed to load progress from localStorage:', err);
        }
        setIsHydrated(true);
    }, [storageKey]);

    // Mark current chapter as visited (completed) when viewing
    useEffect(() => {
        if (!isHydrated) return;

        const newCompleted = [...new Set([...completedChapters, currentChapterIndex])];
        if (newCompleted.length !== completedChapters.length) {
            setCompletedChapters(newCompleted);
            try {
                localStorage.setItem(storageKey, JSON.stringify(newCompleted));
            } catch (err) {
                console.error('Failed to save progress to localStorage:', err);
            }
        }
    }, [currentChapterIndex, completedChapters, storageKey, isHydrated]);

    const completedCount = currentChapterIndex + 1;
    const progressPercent = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;

    return (
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 -mx-4 md:-mx-8 mb-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <svg
                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        Progress
                    </span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {isHydrated ? completedCount : '-'} / {totalChapters}
                    </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: isHydrated ? `${progressPercent}%` : '0%' }}
                        role="progressbar"
                        aria-valuenow={completedCount}
                        aria-valuemin={0}
                        aria-valuemax={totalChapters}
                        aria-label={`${completedCount} of ${totalChapters} chapters completed`}
                    />
                </div>

                {/* Chapter dots visualization */}
                <div className="flex items-center gap-1 mt-2 overflow-x-auto py-1">
                    {Array.from({ length: totalChapters }, (_, i) => {
                        const isCompleted = isHydrated && completedChapters.includes(i);
                        const isCurrent = i === currentChapterIndex;

                        return (
                            <div
                                key={i}
                                className={`flex-shrink-0 w-2 h-2 rounded-full transition-all duration-300 ${isCurrent
                                    ? 'bg-blue-500 ring-2 ring-blue-300 dark:ring-blue-700 ring-offset-1 ring-offset-white dark:ring-offset-gray-900'
                                    : isCompleted
                                        ? 'bg-green-500 dark:bg-green-400'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                title={`Chapter ${i + 1}${isCurrent ? ' (current)' : isCompleted ? ' (completed)' : ''}`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default ProgressIndicator;
