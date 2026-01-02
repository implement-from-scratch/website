'use client';

import Link from 'next/link';
import { Chapter } from '@/lib/github';

interface FlowDiagramProps {
  chapters: Chapter[];
  repoName: string;
  currentChapter?: string;
}

export default function FlowDiagram({ chapters, repoName, currentChapter }: FlowDiagramProps) {
  if (chapters.length === 0) {
    return null;
  }

  const getChapterIcon = (chapterName: string, index: number) => {
    const num = chapterName.match(/^(\d+)/)?.[1];
    if (num) {
      return (
        <div className="text-xs font-bold text-gray-300">
          {num.padStart(2, '0')}
        </div>
      );
    }
    return (
      <div className="text-xs font-bold text-gray-300">
        {(index + 1).toString().padStart(2, '0')}
      </div>
    );
  };

  const getChapterTitle = (chapterName: string) => {
    return chapterName
      .replace(/^\d+[-_]?/, '')
      .replace('.md', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getChapterCategory = (chapterName: string, index: number) => {
    const name = chapterName.toLowerCase();
    if (name.includes('introduction') || name.includes('intro')) return 'BASICS';
    if (name.includes('process') || name.includes('execution')) return 'BASICS';
    if (name.includes('parsing') || name.includes('command')) return 'BASICS';
    if (name.includes('redirection') || name.includes('io')) return 'BASICS';
    if (name.includes('pipeline')) return 'BASICS';
    if (name.includes('signal')) return 'BASICS';
    if (name.includes('repl') || name.includes('loop')) return 'BASICS';
    if (name.includes('file') || name.includes('descriptor')) return 'ADVANCED';
    if (name.includes('group') || name.includes('process')) return 'ADVANCED';
    if (name.includes('error')) return 'ADVANCED';
    if (name.includes('memory')) return 'ADVANCED';
    return index < 7 ? 'BASICS' : 'ADVANCED';
  };

  return (
    <div className="relative py-16 min-h-screen">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(#1a1a1a 1px, transparent 1px),
            linear-gradient(90deg, #1a1a1a 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      ></div>
      
      <div className="relative max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-4">
          {chapters.map((chapter, index) => {
            const isActive = currentChapter === chapter.slug;
            const category = getChapterCategory(chapter.name, index);
            const title = getChapterTitle(chapter.name);
            const isLast = index === chapters.length - 1;

            return (
              <div key={chapter.slug} className="flex flex-col items-center w-full">
                <Link
                  href={`/${repoName}/${chapter.slug}`}
                  className={`group relative w-full px-6 py-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    isActive
                      ? 'bg-[#1a1a1a] border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-[#171717] border-[#2a2a2a] hover:border-[#404040] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-[#262626] text-gray-400 group-hover:bg-[#333333] group-hover:text-gray-300'
                      }`}
                    >
                      {getChapterIcon(chapter.name, index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        {category}
                      </div>
                      <div
                        className={`text-lg font-bold transition-colors ${
                          isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {title}
                      </div>
                    </div>
                  </div>
                </Link>
                {!isLast && (
                  <div className="w-0.5 h-8 bg-[#2a2a2a] my-1"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
