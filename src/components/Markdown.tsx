import { Link } from "@tanstack/react-router";
import parse, {
  type DOMNode,
  type HTMLReactParserOptions,
  domToReact,
  Element,
} from "html-react-parser";
import { useEffect, useState } from "react";

import { renderMarkdown, type MarkdownResult } from "@/utils/markdown";

type MarkdownProps = {
  content: string;
  className?: string;
};

export function Markdown({ content, className }: MarkdownProps) {
  const [result, setResult] = useState<MarkdownResult | null>(null);

  useEffect(() => {
    void renderMarkdown(content).then(setResult);
  }, [content]);

  if (!result) {
    return <div className={className}>Loading...</div>;
  }

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        // Customize rendering of specific elements
        if (domNode.name === "a") {
          // Handle links
          const href = domNode.attribs.href;
          if (href?.startsWith("/")) {
            // Internal link - use your router's Link component
            return <Link to={href}>{domToReact(domNode.children as DOMNode[], options)}</Link>;
          }
        }

        if (domNode.name === "img") {
          // Add lazy loading to images
          return <img {...domNode.attribs} loading="lazy" className="rounded-lg shadow-md" />;
        }

        // In your Markdown component's replace function
        if (domNode.name === "pre") {
          const codeElement = domNode.children.find(
            (child) => child instanceof Element && child.name === "code",
          ) as Element;
          if (codeElement) {
            const className = codeElement.attribs.class || "";
            const language = className.replace("language-", "") || "text";
            const code = getText(codeElement);

            return <CodeBlock code={code} language={language} />;
          }
        }
      }
    },
  };

  return <div className={className}>{parse(result.markup, options)}</div>;
}
