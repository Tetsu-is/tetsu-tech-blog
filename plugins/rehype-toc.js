import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';

/**
 * Rehype plugin to generate a table of contents (TOC) from headings.
 * This plugin extracts h2 and h3 headings and inserts a TOC at the beginning of the content.
 */
export function rehypeToc() {
  return (tree) => {
    const headings = [];

    // First pass: collect all headings
    visit(tree, 'element', (node) => {
      // Collect h2 and h3 headings
      if (node.tagName === 'h2' || node.tagName === 'h3') {
        const text = toString(node);

        // Generate ID from heading text if not already present
        let id = node.properties?.id;
        if (!id) {
          // Use encodeURIComponent to preserve Japanese and other non-ASCII characters
          id = text
            .trim()
            .replace(/\s+/g, '-')      // Replace spaces with hyphens
            .replace(/[<>:"\/\\|?*]/g, '') // Remove invalid characters for URLs
            .toLowerCase();

          // Set the ID on the heading element
          if (!node.properties) {
            node.properties = {};
          }
          node.properties.id = id;
        }

        headings.push({
          level: node.tagName === 'h2' ? 2 : 3,
          text,
          id,
        });
      }
    });

    // Only generate TOC if there are headings
    if (headings.length === 0) {
      return;
    }

    // Find the first content element index to insert TOC before it
    let firstContentIndex = tree.children.findIndex((child) => {
      return child.type === 'element' &&
        ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'pre', 'div'].includes(child.tagName);
    });

    // Build TOC HTML structure
    const tocItems = headings.map((heading) => {
      return {
        type: 'element',
        tagName: 'li',
        properties: {
          className: [`toc-item-${heading.level}`],
        },
        children: [
          {
            type: 'element',
            tagName: 'a',
            properties: {
              href: `#${heading.id}`,
            },
            children: [
              {
                type: 'text',
                value: heading.text,
              },
            ],
          },
        ],
      };
    });

    const tocNode = {
      type: 'element',
      tagName: 'nav',
      properties: {
        className: ['table-of-contents'],
        ariaLabel: 'Table of contents',
      },
      children: [
        {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['toc-header'],
          },
          children: [
            {
              type: 'text',
              value: '目次',
            },
          ],
        },
        {
          type: 'element',
          tagName: 'ul',
          properties: {
            className: ['toc-list'],
          },
          children: tocItems,
        },
      ],
    };

    // Insert TOC at the beginning of content
    if (firstContentIndex !== -1) {
      tree.children.splice(firstContentIndex, 0, tocNode);
    } else {
      // Fallback: insert at the beginning if no content found
      tree.children.unshift(tocNode);
    }
  };
}
