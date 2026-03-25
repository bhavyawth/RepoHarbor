import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

function normalizeAssistantMarkdown(input: string) {
  const normalizedLineEndings = input.replace(/\r\n/g, '\n');
  return normalizedLineEndings.replace(
    /"""([a-zA-Z0-9_-]+)?\n([\s\S]*?)"""/g,
    (_match, language = '', content = '') => `\`\`\`${language}\n${String(content).trimEnd()}\n\`\`\``
  );
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return '';
}

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const parsedContent = normalizeAssistantMarkdown(content);

  return (
    <div
      className={[
        'markdown-content prose prose-slate max-w-none text-sm dark:prose-invert',
        'prose-headings:scroll-mt-20 prose-headings:mt-3 prose-headings:mb-1.5 prose-headings:font-semibold prose-headings:tracking-tight',
        'prose-p:my-2 prose-p:leading-7 prose-p:whitespace-pre-wrap',
        'prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6',
        'prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6',
        'prose-li:my-1 prose-li:marker:text-slate-500 dark:prose-li:marker:text-slate-400',
        'prose-strong:text-slate-900 dark:prose-strong:text-slate-100',
        'prose-a:text-sky-700 prose-a:underline-offset-2 hover:prose-a:text-sky-600 dark:prose-a:text-sky-300 dark:hover:prose-a:text-sky-200',
        'prose-blockquote:border-slate-300 prose-blockquote:text-slate-600 dark:prose-blockquote:border-slate-700 dark:prose-blockquote:text-slate-300',
        'prose-hr:border-slate-200 dark:prose-hr:border-slate-800',
        className ?? '',
      ].join(' ')}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => {
            const codeNode = React.Children.toArray(children)[0] as
              | React.ReactElement<{ className?: string; children?: React.ReactNode }>
              | undefined;
            const className = codeNode?.props?.className ?? '';
            const languageMatch = /language-([\w-]+)/.exec(className);
            const language = languageMatch?.[1];
            const code = getNodeText(codeNode?.props?.children);

            return <CodeBlock code={code.replace(/\n$/, '')} language={language} />;
          },
          code: ({ className, children, ...props }) => {
            const isInline = !className || !/language-/.test(className);
            if (!isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded-md bg-slate-200 px-1.5 py-0.5 font-mono text-[0.86em] text-slate-900 dark:bg-slate-800 dark:text-slate-100" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {parsedContent}
      </ReactMarkdown>
    </div>
  );
}
