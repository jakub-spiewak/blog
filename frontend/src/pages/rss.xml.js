import rss from '@astrojs/rss';
import {markdownFiles} from '../util/file.util.astro'

export const get = () => rss({
    title: 'Jakub Śpiewak Blog',
    description: 'A humble blog closely related to the web development, microservices and so on',
    site: import.meta.env.SITE,
    items: markdownFiles.map((post) => ({
        link: `blog/${post.slug}`,
        title: post.frontmatter.title,
        pubDate: new Date(post.frontmatter.date),
        author: 'priv@jakubspiewak.com (Jakub Śpiewak)',
        customData: post.frontmatter.tags.map(t => `<category>${t}</category>`).join('')
    })),
    customData: `
        <language>en-us</language>
        <managingEditor>priv@jakubspiewak.com (Jakub Śpiewak)</managingEditor>
        <webMaster>priv@jakubspiewak.com (Jakub Śpiewak)</webMaster>
        <lastBuildDate>${new Date()}</lastBuildDate>
    `,
});