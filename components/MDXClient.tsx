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

// Component for rendering code blocks with ASCII art support
function CodeBlock({ children, className, ...props }: any) {
  const [svgContent] = useState<string | null>(null);

  // Extract code content
  let codeContent = '';
  let language = '';
  
  if (children && typeof children === 'object' && children.props) {
    codeContent = children.props.children || '';
    language = children.props.className?.replace('language-', '') || '';
  } else if (typeof children === 'string') {
    codeContent = children;
  }

  // Check if content looks like ASCII art
  const isAsciiArt = typeof codeContent === 'string' && codeContent.length > 0 && (
    codeContent.includes('┌') || codeContent.includes('│') || codeContent.includes('└') || 
    codeContent.includes('─') || codeContent.includes('├') || codeContent.includes('┐') ||
    codeContent.includes('┘') || codeContent.includes('┤') || codeContent.includes('┬') ||
    codeContent.includes('┴') || codeContent.includes('╭') || codeContent.includes('╮') ||
    codeContent.includes('╰') || codeContent.includes('╯') || codeContent.includes('═') ||
    codeContent.includes('║') || codeContent.includes('╔') || codeContent.includes('╗') ||
    codeContent.includes('╚') || codeContent.includes('╝') ||
    (codeContent.split('\n').length > 3 && /[|\\\/\-_=+*#@$%^&(){}[\]]/.test(codeContent)) ||
    language === 'ascii' || language === 'flowchart' || language === 'diagram'
  );

  // Note: ASCII-to-SVG conversion temporarily disabled due to aasvg compatibility issues
  // ASCII art will be rendered as preformatted code blocks which preserves layout
  // TODO: Re-enable when aasvg is compatible with Next.js client-side bundling

  // If SVG conversion succeeded, return SVG
  if (svgContent) {
    return (
      <div 
        className="my-6 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  // Otherwise, return regular pre block
  return (
    <pre
      className={`overflow-x-auto p-5 rounded-xl bg-[#0d1117] border border-[#262626] my-6 font-mono text-sm text-[#c9d1d9] shadow-lg ${
        isAsciiArt ? 'whitespace-pre' : ''
      } ${className || ''}`}
      style={isAsciiArt ? { whiteSpace: 'pre', fontFamily: 'monospace' } : undefined}
      {...props}
    >
      {children}
    </pre>
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
  };

  return (
    <div className={`max-w-none ${skipFirstHeading ? 'skip-first-heading' : ''}`}>
      <MDXRemote {...source} components={components} />
    </div>
  );
}
