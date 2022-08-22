import { MarkdownInstance } from "astro"

export interface PostMarkdownFrontmatter {
    title: string,
    tags: string[],
    date: string,
    modifyDate?: string,
    summary: string
}

export type PostMarkdown = MarkdownInstance<PostMarkdownFrontmatter>

export interface PostMarkdownWithSlug extends PostMarkdown {
    slug: string
}