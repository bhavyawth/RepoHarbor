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
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const parsedContent = normalizeAssistantMarkdown(content);

  return (
    <div className="markdown-content text-sm text-slate-800 dark:text-slate-200">
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
