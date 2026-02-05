import Link from 'next/link';
import { Repository } from '@/lib/github';

interface GuideCardProps {
  repo: Repository;
}

export default function GuideCard({ repo }: GuideCardProps) {
  const getYear = () => {
    const match = repo.description?.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : null;
  };

  const getTags = () => {
    const tags: string[] = [];
    const name = repo.name.toLowerCase();
    const desc = (repo.description || repo.readmeDescription || '').toLowerCase();

    if (name.includes('shell') || desc.includes('shell')) tags.push('Shell');
    if (name.includes('c') && !name.includes('++')) tags.push('C');
    if (name.includes('cpp') || name.includes('c++')) tags.push('C++');
    if (name.includes('rust')) tags.push('Rust');
    if (desc.includes('unix') || desc.includes('linux')) tags.push('Unix');
    if (desc.includes('system')) tags.push('Systems');

    return tags.slice(0, 3);
  };

  const year = getYear();
  const tags = getTags();
  const displayTitle = repo.readmeTitle || repo.name;
  const displayDescription = repo.readmeDescription || repo.description;

  return (
    <Link
      href={`/${repo.name}`}
      className="group relative block p-4 sm:p-6 rounded-xl bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] hover:border-gray-300 dark:hover:border-[#404040] transition-all duration-200 hover:shadow-xl hover:shadow-black/20 h-full"
      style={{ minHeight: '140px' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {year && (
            <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">{year}</span>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, idx) => {
                const colors = [
                  'bg-green-500/20 text-green-400 border-green-500/30',
                  'bg-purple-500/20 text-purple-400 border-purple-500/30',
                  'bg-blue-500/20 text-blue-400 border-blue-500/30',
                  'bg-orange-500/20 text-orange-400 border-orange-500/30',
                  'bg-red-500/20 text-red-400 border-red-500/30',
                ];
                const colorClass = colors[idx % colors.length];
                return (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 dark:hover:bg-[#262626] rounded">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-400 dark:group-hover:text-blue-400 transition-colors">
        {displayTitle}
      </h2>

      {displayDescription && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
          {displayDescription}
        </p>
      )}
    </Link>
  );
}
