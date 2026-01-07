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

  // Extract code content and language
  let codeContent = '';
  let language = '';
  let filename = '';
  
  if (children && typeof children === 'object' && 'props' in children) {
    const childProps = children.props as { children?: string; className?: string; 'data-filename'?: string };
    codeContent = childProps.children || '';
    const classNames = childProps.className || '';
    language = classNames.replace('language-', '');
    filename = childProps['data-filename'] || '';
  } else if (typeof children === 'string') {
    codeContent = children;
  }

  // Check if content looks like ASCII art
  const isAsciiArt = typeof codeContent === 'string' && codeContent.length > 0 && (
    // Box drawing characters
    codeContent.includes('\u250C') || codeContent.includes('\u2502') || codeContent.includes('\u2514') || 
    codeContent.includes('\u2500') || codeContent.includes('\u251C') || codeContent.includes('\u2510') ||
    codeContent.includes('\u2518') || codeContent.includes('\u2524') || codeContent.includes('\u252C') ||
    codeContent.includes('\u2534') || codeContent.includes('\u256D') || codeContent.includes('\u256E') ||
    codeContent.includes('\u2570') || codeContent.includes('\u256F') || codeContent.includes('\u2550') ||
    codeContent.includes('\u2551') || codeContent.includes('\u2554') || codeContent.includes('\u2557') ||
    codeContent.includes('\u255A') || codeContent.includes('\u255D') ||
    // ASCII art patterns with multiple lines
    (codeContent.split('\n').length > 3 && /[|\\\/\-_=+*#@$%^&(){}[\]]/.test(codeContent)) ||
    // Explicit language hints
    language === 'ascii' || language === 'flowchart' || language === 'diagram' || language === 'art'
  );

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // ASCII art rendering with enhanced styling
  if (isAsciiArt) {
    return (
      <figure className="my-8 group relative">
        {/* Copy button for ASCII art */}
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-md bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100 z-10"
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
        <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] overflow-hidden shadow-lg">
          {/* Header bar for ASCII diagrams */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {language || 'Diagram'}
            </span>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre 
              className="ascii-art-content font-mono text-xs md:text-sm leading-relaxed text-gray-800 dark:text-gray-100"
              style={{ 
                whiteSpace: 'pre', 
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                tabSize: 4,
              }}
            >
              {codeContent}
            </pre>
          </div>
        </div>
      </figure>
    );
  }

  // Regular code block rendering with copy button
  return (
    <div className="my-6 group relative">
      {/* Header with language and copy button */}
      {(language || filename) && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-b-0 border-gray-200 dark:border-[#262626] rounded-t-xl">
          <div className="flex items-center gap-2">
            {language && (
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {language}
              </span>
            )}
            {filename && (
              <>
                <span className="text-gray-400 dark:text-gray-600">-</span>
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                  {filename}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100 z-10"
        aria-label="Copy to clipboard"
        type="button"
        style={{ top: language || filename ? '2.75rem' : '0.5rem' }}
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
        className={`overflow-x-auto p-5 bg-[#0d1117] border border-gray-200 dark:border-[#262626] font-mono text-sm text-[#c9d1d9] shadow-lg ${
          language || filename ? 'rounded-b-xl rounded-t-none' : 'rounded-xl'
        } ${className || ''}`}
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
