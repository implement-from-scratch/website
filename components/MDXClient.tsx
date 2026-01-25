'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

interface MDXClientProps {
  source: MDXRemoteSerializeResult;
  repoName: string;
  branch: string;
  skipFirstHeading?: boolean;
}

// Component for rendering code blocks with ASCII art support and copy functionality
function CodeBlock({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // Extract raw code content for copying
  const getRawCode = () => {
    if (preRef.current) {
      return preRef.current.innerText || '';
    }
    return '';
  };

  const handleCopy = async (): Promise<void> => {
    const code = getRawCode();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // rehype-pretty-code passes language via data-language
  const language = (props as any)['data-language'] || '';
  const filename = (props as any)['data-rehype-pretty-code-title'] || '';

  // For Mermaid diagrams, rehype-mermaid transforms them into img or svg
  // If children is an object and looks like Mermaid output, we just render it
  if (className === 'mermaid') {
    return (
      <div className="mermaid-container my-8 overflow-x-auto flex justify-center bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {children}
      </div>
    );
  }

  // Detect if this is a rehype-pretty-code block
  const isPrettyCode = typeof (props as any)['data-language'] !== 'undefined';

  return (
    <div className={`group relative ${isPrettyCode ? 'my-0' : 'my-6'}`}>
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-md bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-sm border border-gray-700/50"
        aria-label="Copy to clipboard"
        type="button"
      >
        {copied ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      <pre
        ref={preRef}
        className={`${className || ''}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}


export default function MDXClient({ source, repoName, branch, skipFirstHeading = false }: MDXClientProps) {
  const firstHeadingSkipped = useRef(false);

  const components = {
    img: ({ src, alt, ...props }: any) => {
      if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('#')) {
        let imagePath = src;
        if (!imagePath.startsWith('docs/')) {
          imagePath = `docs/${imagePath}`;
        }
        const rawUrl = `https://raw.githubusercontent.com/implement-from-scratch/${repoName}/${branch}/${imagePath}`;
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={rawUrl} alt={alt} {...props} className="max-w-full rounded my-4" />;
      }
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt} {...props} className="max-w-full rounded my-4" />;
    },
    a: ({ href, children, ...props }: any) => {
      if (href && !href.startsWith('http') && !href.startsWith('/') && !href.startsWith('#')) {
        const rawUrl = `https://raw.githubusercontent.com/implement-from-scratch/${repoName}/${branch}/${href}`;
        return (
          <a href={rawUrl} className="text-blue-600 dark:text-blue-400 hover:underline" {...props}>
            {children}
          </a>
        );
      }
      return (
        <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" {...props}>
          {children}
        </a>
      );
    },
    code: ({ className, children, ...props }: any) => {
      // Check if this is a block code element processed by rehype-pretty-code
      // It typically adds 'data-language' or 'data-theme' to the code element
      const isBlock = typeof props['data-language'] !== 'undefined' || typeof props['data-theme'] !== 'undefined';

      if (isBlock) {
        return <code className={className} {...props}>{children}</code>;
      }

      return (
        <code
          className={`font-mono text-sm ${className || ''} bg-[#171717] text-[#e5e5e5] px-1.5 py-0.5 rounded border border-[#262626]`}
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: CodeBlock,
    h1: ({ children, ...props }: any) => {
      return (
        <h1 className="mdx-h1 text-4xl font-bold mt-12 mb-6 first:mt-0 text-gray-900 dark:text-white" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: any) => (
      <h2 className="text-3xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#262626] pb-2" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900 dark:text-white" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 className="text-xl font-semibold mt-6 mb-2 text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </h4>
    ),
    p: ({ children, ...props }: any) => (
      <p className="mb-5 leading-7 text-gray-700 dark:text-gray-300 text-base" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-outside mb-5 space-y-2 ml-6 text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-outside mb-5 space-y-2 ml-6 text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="mb-2 leading-7" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote
        className="border-l-4 border-blue-500/50 pl-6 italic my-6 text-gray-400 bg-[#171717] py-4 rounded-r-lg"
        {...props}
      >
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-6 rounded-lg border border-[#262626]">
        <table
          className="min-w-full border-collapse"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }: any) => (
      <th
        className="border-b border-[#262626] px-4 py-3 bg-[#171717] font-semibold text-left text-white"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border-b border-[#262626] px-4 py-3 text-gray-300" {...props}>
        {children}
      </td>
    ),
    hr: ({ ...props }: any) => (
      <hr className="my-8 border-[#262626]" {...props} />
    ),
    // Handle KaTeX error elements gracefully
    span: ({ className, children, ...props }: any) => {
      // KaTeX error spans have specific classes
      if (className?.includes('katex-error')) {
        return (
          <span className={`${className} bg-red-900/20 border border-red-500/50 rounded px-2 py-1 text-red-400 text-sm`} {...props}>
            {children}
          </span>
        );
      }
      return <span className={className} {...props}>{children}</span>;
    },
  };

  return (
    <div className={`max-w-none ${skipFirstHeading ? 'skip-first-heading' : ''}`}>
      <MDXRemote {...source} components={components} />
    </div>
  );
}
