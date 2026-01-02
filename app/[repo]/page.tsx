import { getRepoInfo, getChapters, getFileContent } from '@/lib/github';
import { parseReadme } from '@/lib/readme-parser';
import FlowDiagram from '@/components/FlowDiagram';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface PageProps {
  params: {
    repo: string;
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { repo: repoName } = params;

  try {
    const [repoInfo, chapters] = await Promise.all([
      getRepoInfo(repoName),
      getChapters(repoName),
    ]);

    // Fetch and parse README for title and description
    let readmeTitle = repoInfo.name;
    let readmeDescription = repoInfo.description;
    
    try {
      const readmeContent = await getFileContent(repoName, 'README.md', repoInfo.default_branch);
      if (readmeContent) {
        const readmeData = parseReadme(readmeContent, repoName);
        readmeTitle = readmeData.title;
        readmeDescription = readmeData.description || repoInfo.description;
      }
    } catch (error) {
      // Fallback to repo name and description if README fetch fails
      console.error(`Error fetching README for ${repoName}:`, error);
    }

    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to guides
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">{readmeTitle}</h1>
          {readmeDescription && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {readmeDescription}
            </p>
          )}
        </div>

        <FlowDiagram chapters={chapters} repoName={repoName} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateStaticParams() {
  const { getRepositoriesWithDocs } = await import('@/lib/github');
  const repos = await getRepositoriesWithDocs();
  return repos.map((repo) => ({
    repo: repo.name,
  }));
}
