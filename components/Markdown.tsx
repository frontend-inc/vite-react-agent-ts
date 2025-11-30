import React from 'react';

interface MarkdownProps {
  content: string;
  className?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content, className = '' }) => {
  // Convert bold text (*text* or **text**)
  const convertBoldText = (text: string): string => {
    return text.replace(/\*+(.*?)\*+/g, '<strong>$1</strong>');
  };

  // Convert links [text](url)
  const convertLinks = (text: string): string => {
    return text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
    );
  };

  // Parse markdown content and extract images, headings, links, horizontal rules, and text
  const processMarkdown = (text: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    let elementKey = 0;

    // Split content into sections (images, headings, horizontal rules, and text)
    const sections: Array<{
      type: 'text' | 'image' | 'heading' | 'hr';
      content: string;
      alt?: string;
      level?: number;
    }> = [];

    // First, handle images
    let lastImageIndex = 0;
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = imageRegex.exec(text)) !== null) {
      // Add text before image
      if (match.index > lastImageIndex) {
        const textBefore = text.substring(lastImageIndex, match.index);
        processTextContent(textBefore, sections);
      }
      // Add image
      sections.push({
        type: 'image',
        content: match[2], // URL
        alt: match[1], // Alt text
      });
      lastImageIndex = imageRegex.lastIndex;
    }

    // Add remaining text
    if (lastImageIndex < text.length) {
      const remainingText = text.substring(lastImageIndex);
      processTextContent(remainingText, sections);
    } else if (lastImageIndex === 0) {
      // No images found, process all text
      processTextContent(text, sections);
    }

    // Convert sections to JSX elements
    sections.forEach((section) => {
      if (section.type === 'image') {
        elements.push(
          <div key={`img-${elementKey++}`} className="my-3 flex justify-center">
            <img
              src={section.content}
              alt={section.alt || 'Image'}
              className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
            />
          </div>
        );
      } else if (section.type === 'hr') {
        elements.push(
          <hr
            key={`hr-${elementKey++}`}
            className="my-4 border-t-2 border-gray-300"
          />
        );
      } else if (section.type === 'heading') {
        const headingClass =
          section.level === 1
            ? 'text-xl font-bold mb-2 mt-3 text-gray-900'
            : section.level === 2
              ? 'text-lg font-bold mb-2 mt-2 text-gray-900'
              : 'text-base font-bold mb-1 mt-2 text-gray-900';

        const HeadingTag = `h${section.level}` as keyof JSX.IntrinsicElements;

        elements.push(
          React.createElement(HeadingTag, {
            key: `heading-${elementKey++}`,
            className: headingClass,
            dangerouslySetInnerHTML: {
              __html: convertLinks(convertBoldText(section.content)),
            },
          })
        );
      } else {
        // Process text for bold formatting and links
        const processedText = convertLinks(convertBoldText(section.content));

        if (processedText === '\n' || processedText.trim() === '') {
          elements.push(<br key={`br-${elementKey++}`} />);
        } else {
          elements.push(
            <div
              key={`text-${elementKey++}`}
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: processedText }}
            />
          );
        }
      }
    });

    return elements;
  };

  // Helper function to process text content and extract headings and horizontal rules
  const processTextContent = (
    text: string,
    sections: Array<{
      type: 'text' | 'image' | 'heading' | 'hr';
      content: string;
      alt?: string;
      level?: number;
    }>
  ) => {
    const lines = text.split('\n');

    lines.forEach((line) => {
      // Check for horizontal rule (---)
      if (
        line.trim() === '---' ||
        line.trim() === '***' ||
        line.trim() === '___'
      ) {
        sections.push({
          type: 'hr',
          content: '',
        });
      } else {
        // Check for heading
        const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
        if (headingMatch) {
          sections.push({
            type: 'heading',
            content: headingMatch[2],
            level: headingMatch[1].length,
          });
        } else if (line.trim() !== '') {
          sections.push({
            type: 'text',
            content: line,
          });
        } else {
          // Empty line
          sections.push({
            type: 'text',
            content: '\n',
          });
        }
      }
    });
  };

  const elements = processMarkdown(content);

  return <div className={`space-y-0 ${className}`}>{elements}</div>;
};

export default Markdown;
