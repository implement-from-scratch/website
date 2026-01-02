import { getRepoInfo, getFileContent, getChapters } from '@/lib/github';
import { parseReadme } from '@/lib/readme-parser';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface PageProps {
  params: {
    repo: string;
    chapter: string;
  };
}

export default async function ChapterPage({ params }: PageProps) {
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

    const getChapterDisplayName = (chapterName: string) => {
      return chapterName
        .replace(/^\d+[-_]?/, '')
        .replace('.md', '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/${repoName}`}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {repoTitle}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            {chapterNumber && (
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500 text-white font-bold text-lg">
                {chapterNumber}
              </span>
            )}
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">{chapterTitle}</h1>
          </div>
        </div>

        <article className="mb-12">
          <MarkdownRenderer
            content={chapterContent}
            repoName={repoName}
            branch={repoInfo.default_branch}
            skipFirstHeading={true}
          />
        </article>

        <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-[#262626]">
          {prevChapter ? (
            <Link
              href={`/${repoName}/${prevChapter.slug}`}
              className="group flex items-center gap-3 px-6 py-3 rounded-lg bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-[#262626] hover:border-gray-300 dark:hover:border-[#404040] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Previous</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-400 transition-colors">
                  {getChapterDisplayName(prevChapter.name)}
                </div>
              </div>
            </Link>
          ) : (
            <div></div>
          )}

          {nextChapter ? (
            <Link
              href={`/${repoName}/${nextChapter.slug}`}
              className="group flex items-center gap-3 px-6 py-3 rounded-lg bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-[#262626] hover:border-gray-300 dark:hover:border-[#404040] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all"
            >
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Next</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-400 transition-colors">
                  {getChapterDisplayName(nextChapter.name)}
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div></div>
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
