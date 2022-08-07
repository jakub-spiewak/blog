import type { MarkdownHeading } from "@astrojs/markdown-remark";
import type { PostMarkdownFrontmatter } from "./types";

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