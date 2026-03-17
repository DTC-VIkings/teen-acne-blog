import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  updatedDate?: string;
  excerpt: string;
  category: string;
  author: string;
  authorTitle?: string;
  reviewedBy?: string;
  reviewerCredentials?: string;
  content: string;
}

function parsePostData(
  slug: string,
  data: Record<string, unknown>
): Omit<Post, "content"> {
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    updatedDate: data.updatedDate as string | undefined,
    excerpt: data.excerpt as string,
    category: (data.category as string) || "Tips",
    author: (data.author as string) || "Teen Acne Solutions Team",
    authorTitle: data.authorTitle as string | undefined,
    reviewedBy: data.reviewedBy as string | undefined,
    reviewerCredentials: data.reviewerCredentials as string | undefined,
  };
}

export function getAllPosts(): Omit<Post, "content">[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((name) => name.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);
      return parsePostData(slug, data);
    });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  return {
    ...parsePostData(slug, data),
    content: processedContent.toString(),
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
