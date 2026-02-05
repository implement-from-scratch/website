import { getRepoInfo, getFileContent, getChapters } from '@/lib/github';
import { parseReadme } from '@/lib/readme-parser';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface PageProps {
  params: {
    repo: string;
    chapter: string;
  };
}

export default async function ChapterPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { repo: repoName, chapter: chapterSlug } = params;

  try {
    const [repoInfo, chapters] = await Promise.all([
      getRepoInfo(repoName),
      getChapters(repoName),
    ]);

    const chapterIndex = chapters.findIndex((c) => c.slug === chapterSlug);
    const chapter = chapters[chapterIndex];

    if (!chapter) {
      notFound();
    }

    const chapterContent = await getFileContent(repoName, chapter.path);
    if (!chapterContent) {
      notFound();
    }

    // Fetch and parse README for title
    let repoTitle = repoName;
    try {
      const readmeContent = await getFileContent(repoName, 'README.md', repoInfo.default_branch);
      if (readmeContent) {
        const readmeData = parseReadme(readmeContent, repoName);
        repoTitle = readmeData.title;
      }
    } catch (error) {
      // Fallback to repo name if README fetch fails
      console.error(`Error fetching README for ${repoName}:`, error);
    }

    const chapterNumber = chapter.name.match(/^(\d+)/)?.[1] || '';
    const chapterTitle = chapter.name
      .replace(/^\d+[-_]?/, '')
      .replace('.md', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
    const nextChapter = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

    const getChapterDisplayName = (chapterName: string): string => {
      return chapterName
        .replace(/^\d+[-_]?/, '')
        .replace('.md', '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Build breadcrumb items
    const breadcrumbItems = [
      { label: repoTitle, href: `/${repoName}` },
      { label: chapterTitle, href: `/${repoName}/${chapterSlug}` },
    ];

    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Progress indicator */}
        <ProgressIndicator
          totalChapters={chapters.length}
          currentChapterIndex={chapterIndex}
          repoName={repoName}
        />

        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Chapter header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {chapterNumber && (
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/25">
                {chapterNumber}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {chapterTitle}
            </h1>
          </div>
        </div>

        {/* Main content */}
        <article id="main-content" className="mb-12">
          <MarkdownRenderer
            content={chapterContent}
            repoName={repoName}
            branch={repoInfo.default_branch}
            skipFirstHeading={true}
          />
        </article>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-8 border-t border-gray-200 dark:border-[#262626]">
          {prevChapter ? (
            <Link
              href={`/${repoName}/${prevChapter.slug}`}
              className="group flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3 rounded-lg bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-[#262626] hover:border-gray-300 dark:hover:border-[#404040] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all order-2 sm:order-1"
              style={{ minHeight: '60px' }}
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Previous</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-400 transition-colors truncate">
                  {getChapterDisplayName(prevChapter.name)}
                </div>
              </div>
            </Link>
          ) : (
            <div className="order-2 sm:order-1"></div>
          )}

          {nextChapter ? (
            <Link
              href={`/${repoName}/${nextChapter.slug}`}
              className="group flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-3 rounded-lg bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-[#262626] hover:border-gray-300 dark:hover:border-[#404040] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all order-1 sm:order-2"
              style={{ minHeight: '60px' }}
            >
              <div className="flex-1 min-w-0 text-right">
                <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Next</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-400 transition-colors truncate">
                  {getChapterDisplayName(nextChapter.name)}
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="order-1 sm:order-2"></div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateStaticParams() {
  const { getRepositoriesWithDocs } = await import('@/lib/github');
  const repos = await getRepositoriesWithDocs();
  const params: { repo: string; chapter: string }[] = [];

  for (const repo of repos) {
    const { getChapters } = await import('@/lib/github');
    const chapters = await getChapters(repo.name);
    for (const chapter of chapters) {
      params.push({
        repo: repo.name,
        chapter: chapter.slug,
      });
    }
  }

  return params;
}
