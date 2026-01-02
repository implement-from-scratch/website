import Link from 'next/link';
import { RoadmapGroup } from '@/lib/github';

interface RoadmapProps {
  groups: RoadmapGroup[];
  repoName: string;
}

export default function Roadmap({ groups, repoName }: RoadmapProps) {
  if (groups.length === 0) {
    return null;
  }

  const getGroupColor = (index: number) => {
    const colors = [
      'bg-green-500/20 border-green-500/50 text-green-400',
      'bg-blue-500/20 border-blue-500/50 text-blue-400',
      'bg-purple-500/20 border-purple-500/50 text-purple-400',
      'bg-orange-500/20 border-orange-500/50 text-orange-400',
    ];
    return colors[index % colors.length];
  };

  const getChapterNumber = (chapterName: string) => {
    const match = chapterName.match(/^(\d+)/);
    return match ? match[1] : '';
  };

  const getChapterTitle = (chapterName: string) => {
    return chapterName
      .replace(/^\d+[-_]?/, '')
      .replace('.md', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Roadmap</h2>
      
      {/* Desktop: Horizontal layout */}
      <div className="hidden md:flex items-start gap-6 overflow-x-auto pb-6">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex-shrink-0 min-w-[280px]">
            {/* Group Card */}
            <div
              className={`relative p-6 rounded-xl border-2 ${getGroupColor(groupIndex)} bg-gray-800 dark:bg-[#1a1a1a] transition-transform hover:scale-105`}
            >
              <h3 className="text-xl font-bold mb-4">{group.groupTitle}</h3>
              
              {/* Chapters List */}
              <div className="space-y-3">
                {group.chapters.map((chapter, chapterIndex) => (
                  <Link
                    key={chapter.slug}
                    href={`/${repoName}/${chapter.slug}`}
                    className="block group"
                  >
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50 dark:bg-[#0a0a0a] border border-gray-700 dark:border-[#333333] hover:border-gray-600 dark:hover:border-[#404040] transition-all">
                      <span className="flex-shrink-0 text-xs font-mono text-gray-400 dark:text-gray-500">
                        {getChapterNumber(chapter.name) || chapterIndex + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-200 dark:text-gray-300 group-hover:text-white transition-colors mb-1">
                          {getChapterTitle(chapter.name)}
                        </div>
                        {chapter.description && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
                            {chapter.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Arrow connector to next group */}
            {groupIndex < groups.length - 1 && (
              <div className="relative flex items-center justify-center w-12 h-full -mt-6">
                <svg
                  className="w-12 h-12 text-gray-600 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 w-24 h-0.5 bg-gray-600 dark:bg-gray-500 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Vertical layout */}
      <div className="md:hidden space-y-8">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="relative">
            {/* Group Card */}
            <div
              className={`relative p-6 rounded-xl border-2 ${getGroupColor(groupIndex)} bg-gray-800 dark:bg-[#1a1a1a] transition-transform hover:scale-105`}
            >
              <h3 className="text-xl font-bold mb-4">{group.groupTitle}</h3>
              
              {/* Chapters List */}
              <div className="space-y-3">
                {group.chapters.map((chapter, chapterIndex) => (
                  <Link
                    key={chapter.slug}
                    href={`/${repoName}/${chapter.slug}`}
                    className="block group"
                  >
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50 dark:bg-[#0a0a0a] border border-gray-700 dark:border-[#333333] hover:border-gray-600 dark:hover:border-[#404040] transition-all">
                      <span className="flex-shrink-0 text-xs font-mono text-gray-400 dark:text-gray-500">
                        {getChapterNumber(chapter.name) || chapterIndex + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-200 dark:text-gray-300 group-hover:text-white transition-colors mb-1">
                          {getChapterTitle(chapter.name)}
                        </div>
                        {chapter.description && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
                            {chapter.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Vertical connector line */}
            {groupIndex < groups.length - 1 && (
              <div className="relative flex flex-col items-center mt-4 mb-4">
                <div className="w-0.5 h-8 bg-gray-600 dark:bg-gray-500"></div>
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <div className="w-0.5 h-8 bg-gray-600 dark:bg-gray-500"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
