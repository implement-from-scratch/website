import { serialize } from 'next-mdx-remote/serialize';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeMermaid from 'rehype-mermaid';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';

const MDXClient = dynamic(() => import('./MDXClient'), { ssr: false });

interface MarkdownRendererProps {
  content: string;
  repoName: string;
  branch: string;
  skipFirstHeading?: boolean;
}

export async function MarkdownRenderer({ content, repoName, branch, skipFirstHeading = false }: MarkdownRendererProps) {
  try {
    // Pre-process content to fix common LaTeX issues
    let processedContent = content;

    // Protect code blocks from processing (except Mermaid which we want rehype-mermaid to find)
    const codeBlockRegex = /```(?!mermaid)[\s\S]*?```/g;
    const codeBlocks: string[] = [];
    let blockIndex = 0;

    processedContent = processedContent.replace(codeBlockRegex, (match: string) => {
      const placeholder = `__CODE_BLOCK_${blockIndex}__`;
      codeBlocks[blockIndex] = match;
      blockIndex++;
      return placeholder;
    });

    // Process math blocks - handle both inline ($) and display ($$) math
    // First handle display math ($$...$$)
    processedContent = processedContent.replace(
      /\$\$([\s\S]*?)\$\$/g,
      (match: string, mathContent: string) => {
        // Clean up the math content - normalize whitespace but preserve structure
        let cleaned = mathContent
          .replace(/\n\s*/g, ' ') // Replace newlines with spaces
          .replace(/\s+/g, ' ') // Normalize multiple spaces
          .trim();

        // Fix cases environment - ensure proper formatting
        cleaned = cleaned.replace(/\\begin\{cases\}(.*?)\\end\{cases\}/gs, (_casesMatch: string, casesContent: string) => {
          let normalized = casesContent
            .trim()
            .replace(/\s*\\\\\s*/g, ' \\\\ ')
            .replace(/\s*&\s*/g, ' & ')
            .replace(/\s{2,}/g, ' ')
            .trim();
          return `\\begin{cases} ${normalized} \\end{cases}`;
        });

        return `$$${cleaned}$$`;
      }
    );

    // Also handle inline math ($...$) - simpler processing
    processedContent = processedContent.replace(
      /\$([^$\n]+?)\$/g,
      (match: string, mathContent: string) => {
        const cleaned = mathContent.trim().replace(/\s+/g, ' ');
        return `$${cleaned}$`;
      }
    );

    // Restore code blocks
    codeBlocks.forEach((block: string, index: number) => {
      processedContent = processedContent.replace(`__CODE_BLOCK_${index}__`, block);
    });

    const mdxSource = await serialize(processedContent, {
      mdxOptions: {
        remarkPlugins: [remarkMath, remarkGfm],
        rehypePlugins: [
          [
            rehypeKatex,
            {
              throwOnError: false,
              errorColor: '#cc0000',
              strict: false,
            },
          ],
          [
            rehypeMermaid,
            {
              strategy: 'img-svg',
              mermaidConfig: {
                theme: 'base',
                themeVariables: {
                  primaryColor: '#3b82f6',
                  primaryTextColor: '#fff',
                  primaryBorderColor: '#2563eb',
                  lineColor: '#60a5fa',
                  secondaryColor: '#1e40af',
                  tertiaryColor: '#1d4ed8',
                },
              },
            },
          ],
          [
            rehypePrettyCode,
            {
              theme: {
                dark: 'github-dark',
                light: 'github-light',
              },
              keepBackground: true,
              onVisitLine(node: any) {
                // Prevent lines from collapsing in `display: grid` mode, and allow empty lines to be copy/pasted
                if (node.children.length === 0) {
                  node.children = [{ type: 'text', value: ' ' }];
                }
              },
              onVisitHighlightedLine(node: any) {
                node.properties.className.push('line--highlighted');
              },
              onVisitHighlightedWord(node: any) {
                node.properties.className = ['word--highlighted'];
              },
            },
          ],
        ],
        format: 'md',
      },
      parseFrontmatter: true,
    });

    return <MDXClient source={mdxSource} repoName={repoName} branch={branch} skipFirstHeading={skipFirstHeading} />;
  } catch (error: any) {
    console.error('Error rendering markdown for', repoName, ':', error);

    // Try to extract the problematic line if available
    const errorMessage = error?.message || String(error);
    const lineMatch = errorMessage.match(/line (\d+)/i);

    // Fallback: render as plain text with basic formatting
    return (
      <div className="prose prose-invert max-w-none">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
          <p className="text-red-400 font-semibold mb-2">
            Error rendering markdown content
          </p>
          <p className="text-red-300 text-sm">
            {errorMessage}
            {lineMatch && ` (around line ${lineMatch[1]})`}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <pre className="whitespace-pre-wrap text-gray-300 text-sm overflow-x-auto">
            {content}
          </pre>
        </div>
      </div>
    );
  }
}
