import mdx from "@astrojs/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from 'astro/config';
import glsl from 'vite-plugin-glsl';
import { s, h } from "hastscript";
import { visit } from 'unist-util-visit';

const codeTitlesPlugin = () => {
  return tree => visit(tree, 'code', (node, index, parent) => {
    const nodeLang = node.lang || '';
    let language = '',
      title = '';

    if (nodeLang.includes(':')) {
      language = nodeLang.slice(0, nodeLang.search(':'));
      title = nodeLang.slice(nodeLang.search(':') + 1, nodeLang.length);
    }

    if (!title) {
      return;
    }

    const id = `code-title-${index}`;
    const titleNode = {
      type: 'html',
      value: `<div id="${id}" class="code-title">
                  ${title}
                  <button>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="2em"
                      height="2em"
                      stroke="currentColor"
                      fill="none"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </button>
                </div>
                `.trim()
    };
    tree.children.splice(index, 0, titleNode);
    node.lang = language;
  });
};



// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), tailwind({ config: { applyBaseStyles: false } }), sitemap()],
  site: `https://jakubspiewak.com`,
  legacy: {
    // TODO: maybe migrate this to MDX, but Astro.glob("*.md") - supported in this app 
    // return diffrent opbjects than Astro.glob("*.mdx") - not legacy Astro feature
    astroFlavoredMarkdown: true
  },
  vite: {
    plugins: [glsl()]
  },
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [// [rehypeHighlight, { ignoreMissing: true }],
      [rehypePrism, {
        showLineNumbers: false,
        ignoreMissing: true
      }], rehypeSlug, [rehypeAutolinkHeadings, {
        behavior: 'append',
        properties: {
          ariaHidden: true,
          tabIndex: -1,
          style: 'display: inline-flex; opacity: 0.5; margin-left: 0.2em'
        },
        content: [h('span', s('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          width: 16,
          height: 16,
          fill: 'currentColor',
          viewBox: '0 0 24 24'
        }, s('path', {
          d: 'M9.199 13.599a5.99 5.99 0 0 0 3.949 2.345 5.987 5.987 0 0 0 5.105-1.702l2.995-2.994a5.992 5.992 0 0 0 1.695-4.285 5.976 5.976 0 0 0-1.831-4.211 5.99 5.99 0 0 0-6.431-1.242 6.003 6.003 0 0 0-1.905 1.24l-1.731 1.721a.999.999 0 1 0 1.41 1.418l1.709-1.699a3.985 3.985 0 0 1 2.761-1.123 3.975 3.975 0 0 1 2.799 1.122 3.997 3.997 0 0 1 .111 5.644l-3.005 3.006a3.982 3.982 0 0 1-3.395 1.126 3.987 3.987 0 0 1-2.632-1.563A1 1 0 0 0 9.201 13.6zm5.602-3.198a5.99 5.99 0 0 0-3.949-2.345 5.987 5.987 0 0 0-5.105 1.702l-2.995 2.994a5.992 5.992 0 0 0-1.695 4.285 5.976 5.976 0 0 0 1.831 4.211 5.99 5.99 0 0 0 6.431 1.242 6.003 6.003 0 0 0 1.905-1.24l1.723-1.723a.999.999 0 1 0-1.414-1.414L9.836 19.81a3.985 3.985 0 0 1-2.761 1.123 3.975 3.975 0 0 1-2.799-1.122 3.997 3.997 0 0 1-.111-5.644l3.005-3.006a3.982 3.982 0 0 1 3.395-1.126 3.987 3.987 0 0 1 2.632 1.563 1 1 0 0 0 1.602-1.198z'
        })))]
      }]],
    remarkPlugins: [codeTitlesPlugin]
  }
});