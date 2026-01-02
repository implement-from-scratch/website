import Link from 'next/link';
import { Chapter } from '@/lib/github';

interface TOCProps {
  chapters: Chapter[];
  repoName: string;
  currentChapter?: string;
}

export default function TOC({ chapters, repoName, currentChapter }: TOCProps) {
  if (chapters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter, index) => {
        const isActive = currentChapter === chapter.slug;
        const chapterNumber = chapter.name.match(/^(\d+)/)?.[1] || '';
        const chapterTitle = chapter.name
          .replace(/^\d+[-_]?/, '')
          .replace('.md', '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());

        return (
          <Link
            key={chapter.slug}
            href={`/${repoName}/${chapter.slug}`}
            className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
              isActive
                ? 'bg-[#1a1a1a] border-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'bg-[#171717] border-[#262626] hover:border-[#404040] hover:bg-[#1a1a1a]'
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#262626] text-gray-400 group-hover:bg-[#333333] group-hover:text-gray-300'
              }`}
            >
              {chapterNumber || index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                }`}
              >
                {chapterTitle}
              </div>
            </div>
            {isActive && (
              <div className="flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
