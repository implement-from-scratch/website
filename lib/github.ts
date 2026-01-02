import { Octokit } from '@octokit/core';
import { parseReadme } from './readme-parser';

const ORG_NAME = 'implement-from-scratch';

const getOctokit = () => {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    return new Octokit({ auth: token });
  }
  return new Octokit();
};

const octokit = getOctokit();

export interface Repository {
  name: string;
  description: string | null;
  full_name: string;
  default_branch: string;
  readmeTitle?: string;
  readmeDescription?: string | null;
}

export interface RepoContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
}

export interface Chapter {
  name: string;
  path: string;
  slug: string;
}

export async function getOrganizationRepositories(): Promise<Repository[]> {
  try {
    const response = await octokit.request('GET /orgs/{org}/repos', {
      org: ORG_NAME,
      type: 'public',
      per_page: 100,
      sort: 'updated',
    });
    return response.data.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      full_name: repo.full_name,
      default_branch: repo.default_branch || 'main',
    }));
  } catch (error) {
    console.error('Error fetching organization repositories:', error);
    return [];
  }
}

export async function hasDocsFolder(repoName: string): Promise<boolean> {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: ORG_NAME,
      repo: repoName,
      path: 'docs',
    });
    return Array.isArray(response.data);
  } catch (error) {
    return false;
  }
}

export async function getRepositoriesWithDocs(): Promise<Repository[]> {
  const { repos: enabledRepos } = await import('@/config/repos');
  
  const allRepos = await getOrganizationRepositories();
  const reposWithDocs: Repository[] = [];

  for (const repo of allRepos) {
    if (enabledRepos.includes(repo.name) && await hasDocsFolder(repo.name)) {
      // Fetch and parse README
      try {
        const readmeContent = await getFileContent(repo.name, 'README.md', repo.default_branch);
        if (readmeContent) {
          const readmeData = parseReadme(readmeContent, repo.name);
          reposWithDocs.push({
            ...repo,
            readmeTitle: readmeData.title,
            readmeDescription: readmeData.description,
          });
        } else {
          // Fallback if README not found
          reposWithDocs.push(repo);
        }
      } catch (error) {
        console.error(`Error parsing README for ${repo.name}:`, error);
        reposWithDocs.push(repo);
      }
    }
  }

  return reposWithDocs;
}

export async function getRepoContents(repoName: string, path: string = ''): Promise<RepoContent[]> {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: ORG_NAME,
      repo: repoName,
      path: path || '.',
    });

    if (Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        download_url: item.download_url,
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching contents for ${repoName}/${path}:`, error);
    return [];
  }
}

export async function getFileContent(repoName: string, path: string, branch?: string): Promise<string | null> {
  try {
    const repo = await getRepoInfo(repoName);
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: ORG_NAME,
      repo: repoName,
      path: path,
      ref: branch || repo.default_branch,
    });

    if ('content' in response.data && response.data.type === 'file') {
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return content;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching file content for ${repoName}/${path}:`, error);
    return null;
  }
}

export async function getRepoInfo(repoName: string): Promise<Repository> {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: ORG_NAME,
      repo: repoName,
    });
    return {
      name: response.data.name,
      description: response.data.description,
      full_name: response.data.full_name,
      default_branch: response.data.default_branch || 'main',
    };
  } catch (error) {
    throw new Error(`Repository ${repoName} not found`);
  }
}

export async function getChapters(repoName: string): Promise<Chapter[]> {
  const contents = await getRepoContents(repoName, 'docs');
  const chapters: Chapter[] = [];

  for (const item of contents) {
    if (item.type === 'file' && item.name.endsWith('.md') && item.name !== 'README.md') {
      const slug = item.name.replace('.md', '');
      chapters.push({
        name: item.name,
        path: item.path,
        slug: slug,
      });
    }
  }

  return chapters.sort((a, b) => a.name.localeCompare(b.name));
}

export function getRawFileUrl(repoName: string, path: string, branch: string): string {
  return `https://raw.githubusercontent.com/${ORG_NAME}/${repoName}/${branch}/${path}`;
}

/**
 * Fetches the main README.md from the repository root (raw content)
 */
export async function getMainReadme(repoName: string): Promise<string | null> {
  try {
    const repo = await getRepoInfo(repoName);
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: ORG_NAME,
      repo: repoName,
      path: 'README.md',
      ref: repo.default_branch,
      headers: {
        accept: 'application/vnd.github.raw',
      },
    });

    if (typeof response.data === 'string') {
      return response.data;
    }

    // Fallback to base64 decoding if raw not available
    if ('content' in response.data && response.data.type === 'file') {
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return content;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching main README for ${repoName}:`, error);
    return null;
  }
}

/**
 * Fetches raw file content from repository
 */
export async function getRawFileContent(repoName: string, path: string): Promise<string | null> {
  try {
    const repo = await getRepoInfo(repoName);
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: ORG_NAME,
      repo: repoName,
      path: path,
      ref: repo.default_branch,
      headers: {
        accept: 'application/vnd.github.raw',
      },
    });

    if (typeof response.data === 'string') {
      return response.data;
    }

    // Fallback to base64 decoding
    if ('content' in response.data && response.data.type === 'file') {
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return content;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching raw file ${path} for ${repoName}:`, error);
    return null;
  }
}

export interface RoadmapGroup {
  groupTitle: string;
  chapters: Array<{
    name: string;
    slug: string;
    description: string;
  }>;
}

export interface RoadmapTreeNode {
  id: string;
  label: string;
  type: 'root' | 'part' | 'chapter';
  slug?: string;
  description?: string;
  children?: RoadmapTreeNode[];
}

/**
 * Parses docs/README.md to extract roadmap tree structure
 */
export async function parseDocsReadmeForRoadmapTree(repoName: string, repoTitle: string): Promise<RoadmapTreeNode> {
  try {
    const docsReadmeContent = await getFileContent(repoName, 'docs/README.md');
    if (!docsReadmeContent) {
      // Fallback to flat tree
      return await getFlatRoadmapTree(repoName, repoTitle);
    }

    const { remark } = await import('remark');
    const { default: remarkParse } = await import('remark-parse');
    const processor = remark().use(remarkParse);
    const tree = processor.parse(docsReadmeContent);

    const chapters = await getChapters(repoName);
    const rootNode: RoadmapTreeNode = {
      id: 'root',
      label: repoTitle,
      type: 'root',
      children: [],
    };

    let currentPart: RoadmapTreeNode | null = null;

    // Traverse the AST to find headings and lists
    const traverse = (node: any) => {
      if (node.type === 'heading') {
        const level = node.depth;
        const title = node.children
          .filter((child: any) => child.type === 'text' || child.type === 'strong' || child.type === 'emphasis')
          .map((child: any) => {
            if (child.type === 'text') return child.value;
            if (child.children) return child.children.map((c: any) => c.value).join('');
            return '';
          })
          .join('')
          .trim();

        // Look for headings like "### Part 1: ...", "## Part 1: ...", or "Part 1: ..."
        // Also handle "Part I", "Part II", etc.
        const partMatch = /part\s+([\dIVX]+)[:\s]*/i.exec(title);
        if ((level === 2 || level === 3) && partMatch) {
          if (currentPart && rootNode.children) {
            rootNode.children.push(currentPart);
          }
          const partNumber = (rootNode.children?.length || 0) + 1;
          currentPart = {
            id: `part-${partNumber}`,
            label: title,
            type: 'part',
            children: [],
          };
        }
      } else if (node.type === 'list' && currentPart) {
        // Process ordered or unordered lists
        node.children.forEach((listItem: any) => {
          const linkNode = findLinkNode(listItem);
          if (linkNode) {
            const linkText = linkNode.children
              .filter((child: any) => child.type === 'text')
              .map((child: any) => child.value)
              .join('');
            const href = linkNode.url;

            // Extract chapter slug from href
            const chapterSlug = href
              .replace(/^\.\//, '')
              .replace(/\.md$/, '')
              .replace(/^docs\//, '');

            const chapter = chapters.find((c) => c.slug === chapterSlug);
            if (chapter && currentPart && currentPart.children) {
              currentPart.children.push({
                id: `chapter-${chapter.slug}`,
                label: chapter.name.replace(/^\d+[-_]?/, '').replace('.md', '').replace(/_/g, ' '),
                type: 'chapter',
                slug: chapter.slug,
                description: linkText,
              });
            }
          }
        });
      }

      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(tree);

    // Add the last part if it exists
    if (currentPart && rootNode.children) {
      rootNode.children.push(currentPart);
    }

    // If no parts found, fallback to flat tree
    if (!rootNode.children || rootNode.children.length === 0) {
      return await getFlatRoadmapTree(repoName, repoTitle);
    }

    // Ensure all parts have children arrays
    rootNode.children.forEach((part) => {
      if (!part.children) {
        part.children = [];
      }
    });

    // Fetch all chapter descriptions
    const fetchDescriptions = async (node: RoadmapTreeNode) => {
      if (node.type === 'chapter' && node.slug) {
        const chapterInfo = chapters.find((c) => c.slug === node.slug);
        if (chapterInfo) {
          const description = await getChapterDescription(repoName, chapterInfo.path);
          if (description) {
            node.description = description;
          }
        }
      }
      if (node.children) {
        await Promise.all(node.children.map(fetchDescriptions));
      }
    };

    await fetchDescriptions(rootNode);

    return rootNode;
  } catch (error) {
    console.error(`Error parsing docs README for roadmap tree:`, error);
    return await getFlatRoadmapTree(repoName, repoTitle);
  }
}

/**
 * Fallback: Create a flat roadmap tree from chapter list
 */
async function getFlatRoadmapTree(repoName: string, repoTitle: string): Promise<RoadmapTreeNode> {
  const chapters = await getChapters(repoName);
  const chaptersWithDescriptions = await Promise.all(
    chapters.map(async (chapter) => {
      const description = await getChapterDescription(repoName, chapter.path);
      return {
        id: `chapter-${chapter.slug}`,
        label: chapter.name.replace(/^\d+[-_]?/, '').replace('.md', '').replace(/_/g, ' '),
        type: 'chapter' as const,
        slug: chapter.slug,
        description: description || chapter.name.replace(/^\d+[-_]?/, '').replace('.md', ''),
      };
    })
  );

  return {
    id: 'root',
    label: repoTitle,
    type: 'root',
    children: chaptersWithDescriptions,
  };
}

/**
 * Parses docs/README.md to extract roadmap groupings (legacy, for backward compatibility)
 */
export async function parseDocsReadmeForRoadmap(repoName: string): Promise<RoadmapGroup[]> {
  try {
    const docsReadmeContent = await getFileContent(repoName, 'docs/README.md');
    if (!docsReadmeContent) {
      // Fallback to flat chapter list
      return await getFlatRoadmap(repoName);
    }

    const { remark } = await import('remark');
    const { default: remarkParse } = await import('remark-parse');
    const processor = remark().use(remarkParse);
    const tree = processor.parse(docsReadmeContent);

    const groups: RoadmapGroup[] = [];
    let currentGroup: RoadmapGroup | null = null;
    const chapters = await getChapters(repoName);
    const chapterSlugs: string[] = [];

    // Traverse the AST to find headings and lists
    const traverse = (node: any) => {
      if (node.type === 'heading') {
        const level = node.depth;
        const title = node.children
          .filter((child: any) => child.type === 'text')
          .map((child: any) => child.value)
          .join('');

        // Look for headings like "## Part 1: ..." or "## Part 2: ..."
        if (level === 2 && /part\s+\d+/i.test(title)) {
          if (currentGroup) {
            groups.push(currentGroup);
          }
          currentGroup = {
            groupTitle: title,
            chapters: [],
          };
        }
      } else if (node.type === 'list' && currentGroup) {
        // Process ordered or unordered lists
        node.children.forEach((listItem: any) => {
          const linkNode = findLinkNode(listItem);
          if (linkNode) {
            const linkText = linkNode.children
              .filter((child: any) => child.type === 'text')
              .map((child: any) => child.value)
              .join('');
            const href = linkNode.url;

            // Extract chapter slug from href (e.g., "./01_introduction.md" -> "01_introduction")
            const chapterSlug = href
              .replace(/^\.\//, '')
              .replace(/\.md$/, '')
              .replace(/^docs\//, '');

            const chapter = chapters.find((c) => c.slug === chapterSlug);
            if (chapter) {
              chapterSlugs.push(chapterSlug);
              currentGroup!.chapters.push({
                name: chapter.name,
                slug: chapter.slug,
                description: linkText, // Will be updated with actual description
              });
            }
          }
        });
      }

      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(tree);

    if (currentGroup) {
      groups.push(currentGroup);
    }

    // If no groups found, fallback to flat list
    if (groups.length === 0) {
      return await getFlatRoadmap(repoName);
    }

    // Fetch all chapter descriptions
    await Promise.all(
      groups.flatMap((group) =>
        group.chapters.map(async (chapter) => {
          const chapterInfo = chapters.find((c) => c.slug === chapter.slug);
          if (chapterInfo) {
            const description = await getChapterDescription(repoName, chapterInfo.path);
            if (description) {
              chapter.description = description;
            }
          }
        })
      )
    );

    return groups;
  } catch (error) {
    console.error(`Error parsing docs README for roadmap:`, error);
    return await getFlatRoadmap(repoName);
  }
}

/**
 * Helper to find link node in AST
 */
function findLinkNode(node: any): any {
  if (node.type === 'link') {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findLinkNode(child);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Fallback: Create a flat roadmap from chapter list
 */
async function getFlatRoadmap(repoName: string): Promise<RoadmapGroup[]> {
  const chapters = await getChapters(repoName);
  const chaptersWithDescriptions = await Promise.all(
    chapters.map(async (chapter) => {
      const description = await getChapterDescription(repoName, chapter.path);
      return {
        name: chapter.name,
        slug: chapter.slug,
        description: description || chapter.name.replace(/^\d+[-_]?/, '').replace('.md', ''),
      };
    })
  );

  return [
    {
      groupTitle: 'Chapters',
      chapters: chaptersWithDescriptions,
    },
  ];
}

/**
 * Extracts a short description from a chapter file (first paragraph or heading)
 */
async function getChapterDescription(repoName: string, chapterPath: string): Promise<string | null> {
  try {
    const content = await getFileContent(repoName, chapterPath);
    if (!content) return null;

    const lines = content.split('\n').filter((line) => line.trim());
    
    // Skip frontmatter if present
    let startIndex = 0;
    if (lines[0]?.startsWith('---')) {
      const endIndex = lines.findIndex((line, idx) => idx > 0 && line.startsWith('---'));
      if (endIndex > 0) {
        startIndex = endIndex + 1;
      }
    }

    // Look for first heading
    for (let i = startIndex; i < Math.min(startIndex + 10, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('#') && line.length > 1) {
        const heading = line.replace(/^#+\s+/, '').trim();
        if (heading.length > 0 && heading.length < 100) {
          return heading;
        }
      }
    }

    // Look for first paragraph
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length > 0 && !line.startsWith('#') && !line.startsWith('```') && !line.startsWith('[')) {
        const paragraph = line
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links
          .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
          .replace(/\*([^*]+)\*/g, '$1') // Remove italic
          .trim();
        
        if (paragraph.length > 20 && paragraph.length < 150) {
          return paragraph;
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error getting chapter description for ${chapterPath}:`, error);
    return null;
  }
}
