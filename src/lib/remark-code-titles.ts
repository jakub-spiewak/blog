import { visit } from 'unist-util-visit'

export const remarkCodeTitles = () => {
  return (tree) =>
    visit(tree, 'code', (node, index, parent) => {
      const nodeLang = (node.lang || '');
      let language = '', title = '';

      if (nodeLang.includes(':')) {
        language = nodeLang.slice(0, nodeLang.search(':'));
        title = nodeLang.slice(nodeLang.search(':') + 1, nodeLang.length);
      }

      if (!title) {
        return;
      }

      const className = 'remark-code-title'

      const titleNode = {
        type: 'html',
        value: `<div class="${className}">${title}</div>`.trim()
      };

      tree.children.splice(index, 0, titleNode);
      node.lang = language;
    });
}
