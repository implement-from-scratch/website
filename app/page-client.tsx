'use client';

import { useState, useMemo } from 'react';
import GuideCard from '@/components/GuideCard';
import { Repository } from '@/lib/github';

interface HomePageClientProps {
  repos: Repository[];
}

export default function HomePageClient({ repos }: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filteredRepos = useMemo(() => {
    let filtered = repos;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.description?.toLowerCase().includes(query) ||
          repo.readmeTitle?.toLowerCase().includes(query) ||
          repo.readmeDescription?.toLowerCase().includes(query)
      );
    }

    if (selectedFilter) {
      filtered = filtered.filter((repo) => {
        const name = repo.name.toLowerCase();
        const desc = repo.description?.toLowerCase() || '';
        const readmeDesc = repo.readmeDescription?.toLowerCase() || '';
        const filterLower = selectedFilter.toLowerCase();
        return name.includes(filterLower) || desc.includes(filterLower) || readmeDesc.includes(filterLower);
      });
    }

    return filtered;
  }, [repos, searchQuery, selectedFilter]);

  const availableFilters = ['C', 'C++', 'Rust', 'Systems', 'Shell', 'Unix', 'Linux'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">Implementation Guides</h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          Select a guide to start implementing.
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search guides, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 md:py-3 bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-[#404040] transition-colors touch-manipulation"
            style={{ minHeight: '52px' }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filter by:</span>
          {availableFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(selectedFilter === filter ? null : filter)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                selectedFilter === filter
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-[#171717] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#262626] hover:border-gray-300 dark:hover:border-[#404040]'
              }`}
              style={{ minHeight: '36px' }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredRepos.map((repo) => (
          <GuideCard key={repo.name} repo={repo} />
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No guides found matching your search.</p>
        </div>
      )}
    </div>
  );
}
