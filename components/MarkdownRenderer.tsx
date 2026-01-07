import { serialize } from 'next-mdx-remote/serialize';
import rehypeHighlight from 'rehype-highlight';
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
    
    // Protect code blocks from processing
    const codeBlockRegex = /```[\s\S]*?```/g;
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
        // KaTeX cases environment syntax: \begin{cases} ... \\ ... \end{cases}
        // The & character is used for alignment in cases environment
        cleaned = cleaned.replace(/\\begin\{cases\}(.*?)\\end\{cases\}/gs, (_casesMatch: string, casesContent: string) => {
          // Clean up cases content - preserve structure but normalize whitespace
          let normalized = casesContent
            .trim()
            // Normalize line breaks - ensure \\ is properly spaced
            .replace(/\s*\\\\\s*/g, ' \\\\ ')
            // Normalize & alignment characters - ensure proper spacing
            .replace(/\s*&\s*/g, ' & ')
            // Remove extra whitespace but keep single spaces
            .replace(/\s{2,}/g, ' ')
            .trim();
          
          // Ensure there's a space after \begin{cases} and before \end{cases}
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
        // remarkMath must come before remarkGfm to parse math expressions first
        // This prevents GFM from interpreting underscores in math as markdown formatting
        remarkPlugins: [remarkMath, remarkGfm],
        rehypePlugins: [
          [
            rehypeKatex,
            {
              // KaTeX options for better error handling
              throwOnError: false, // Don't throw on parse errors, render error message instead
              errorColor: '#cc0000',
              strict: false, // Be more lenient with LaTeX
            },
          ],
          rehypeHighlight,
        ],
        format: 'md', // Use 'md' format to be more lenient with markdown parsing
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
