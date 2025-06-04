"use client";

import { useMemo, FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostContentProps {
  readonly content: string;
}

export const PostContent: FC<PostContentProps> = ({ content }) => {
  const components = useMemo(
    () => ({
      h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
        const { children, ...rest } = props;
        return (
          <h1 className="text-3xl font-bold mt-8" {...rest}>
            {children}
          </h1>
        );
      },
      h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
        const { children, ...rest } = props;
        return (
          <h2 className="text-2xl font-bold mt-6" {...rest}>
            {children}
          </h2>
        );
      },
      h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
        const { children, ...rest } = props;
        return (
          <h3 className="text-xl font-bold mt-6" {...rest}>
            {children}
          </h3>
        );
      },
      h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
        const { children, ...rest } = props;
        return (
          <h4 className="text-lg font-bold mt-4" {...rest}>
            {children}
          </h4>
        );
      },
      h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
        const { children, ...rest } = props;
        return (
          <h5 className="text-base font-bold mt-4" {...rest}>
            {children}
          </h5>
        );
      },
      h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
        const { children, ...rest } = props;
        return (
          <h6 className="text-sm font-bold mt-4" {...rest}>
            {children}
          </h6>
        );
      },
      ul: (props: React.HTMLAttributes<HTMLUListElement>) => {
        const { children, ...rest } = props;
        return (
          <ul className="list-disc ml-6" {...rest}>
            {children}
          </ul>
        );
      },
      ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => {
        const { children, ...rest } = props;
        return (
          <ol className="list-decimal ml-6" {...rest}>
            {children}
          </ol>
        );
      },
      li: (props: React.LiHTMLAttributes<HTMLLIElement>) => {
        const { children, ...rest } = props;
        return (
          <li className="mt-1" {...rest}>
            {children}
          </li>
        );
      },
      blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => {
        const { children, ...rest } = props;
        return (
          <blockquote className="border-l-4 border-primary pl-2 ml-2" {...rest}>
            {children}
          </blockquote>
        );
      },
      p: (props: React.HTMLAttributes<HTMLParagraphElement>) => {
        const { children, ...rest } = props;
        return (
          <p className="mt-2 first:mt-0 whitespace-pre-wrap" {...rest}>
            {children}
          </p>
        );
      },
      a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
        const { href, children, ...rest } = props;
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            {...rest}
          >
            {children}
          </a>
        );
      },
      img: (props: { src?: string; alt?: string }) => {
        const { src, alt } = props;
        if (!src) return null;
        return (
          <img
            src={src}
            alt={alt}
            className="rounded-lg max-h-96 object-cover my-2"
          />
        );
      },
      code: (props: React.HTMLAttributes<HTMLElement>) => {
        const { children, ...rest } = props;
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...rest}>
            {children}
          </code>
        );
      },
      pre: (props: React.HTMLAttributes<HTMLElement>) => {
        const { children, ...rest } = props;
        return (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto" {...rest}>
            {children}
          </pre>
        );
      },
    }),
    []
  );

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      {/* @ts-ignore */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
