"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-6">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold mt-6">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold mt-4">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-bold mt-4">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-bold mt-4">{children}</h6>
          ),
          ul: ({ children }) => <ul className="list-disc ml-6">{children}</ul>,
          ol: ({ children }) => (
            <ol className="list-decimal ml-6">{children}</ol>
          ),
          li: ({ children }) => <li className="mt-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-2 ml-2">
              {children}
            </blockquote>
          ),
          p: ({ children }) => (
            <p className="mt-2 first:mt-0 whitespace-pre-wrap">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            if (!src) return null;
            return (
              <img
                src={src}
                alt={alt}
                className="rounded-lg max-h-96 object-cover my-2"
              />
            );
          },
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
