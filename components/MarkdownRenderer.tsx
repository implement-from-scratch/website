import { serialize } from 'next-mdx-remote/serialize';
import rehypeHighlight from 'rehype-highlight';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import dynamic from 'next/dynamic';

const MDXClient = dynamic(() => import('./MDXClient'), { ssr: false });

interface MarkdownRendererProps {
  content: string;
  repoName: string;
  branch: string;
  skipFirstHeading?: boolean;
}

export async function MarkdownRenderer({ content, repoName, branch, skipFirstHeading = false }: MarkdownRendererProps) {
  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [rehypeHighlight],
    },
    parseFrontmatter: true,
  });

  return <MDXClient source={mdxSource} repoName={repoName} branch={branch} skipFirstHeading={skipFirstHeading} />;
}
