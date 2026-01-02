import { Octokit } from '@octokit/core';

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
      reposWithDocs.push(repo);
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
