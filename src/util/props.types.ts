import type { MarkdownHeading } from "@astrojs/markdown-remark";
import type { PostMarkdownFrontmatter, PostMarkdownWithSlug } from "./types";

export interface BaseHTMLPageProps {
    title: string,
    description: string,
}

export interface PostNavigationProps {
    headings: MarkdownHeading[]
}

export interface PostInfoProps {
    tags: string[],
    next: string,
    prev: string
}

export interface PostHeaderProps {
    frontmatter: PostMarkdownFrontmatter,
    readingTime: number 
}

export interface PostTagProps {
    text: string,
    amount: number
}

export interface TagIndexProps {
    tag: string
}

export interface PostCardProps {
    frontmatter: PostMarkdownFrontmatter,
    readTime: number,
    slug: string
}

export interface PostCommentsProps {
    name: string
}

export interface PostListProps {
    posts: PostMarkdownWithSlug[],
    title: string
}