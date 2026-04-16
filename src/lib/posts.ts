import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
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
  keyTakeaways?: string[];
  sources?: { title: string; url?: string }[];
  featuredImage?: string;
  quickLinks?: string[];
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
    keyTakeaways: data.keyTakeaways as string[] | undefined,
    sources: data.sources as { title: string; url?: string }[] | undefined,
    featuredImage: data.featuredImage as string | undefined,
    quickLinks: data.quickLinks as string[] | undefined,
  };
}

export function getAllPosts(): Omit<Post, "content">[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory);
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const posts = fileNames
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);
      return parsePostData(slug, data);
    })
    .filter((post) => post.date <= today); // Hide future-dated posts
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(remarkGfm).use(html, { sanitize: false }).process(content);
  const htmlContent = processedContent.toString().replace(
    /<(h[23])>(.*?)<\/\1>/g,
    (_, tag, text) => {
      const id = text.replace(/<[^>]*>/g, "").toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      return `<${tag} id="${id}">${text}</${tag}>`;
    }
  );
  return {
    ...parsePostData(slug, data),
    content: htmlContent,
  };
}

export function getRelatedPosts(
  currentSlug: string,
  category: string,
  limit = 5
): Omit<Post, "content">[] {
  const all = getAllPosts();
  const sameCategory = all.filter(
    (p) => p.slug !== currentSlug && p.category === category
  );
  const others = all.filter(
    (p) => p.slug !== currentSlug && p.category !== category
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
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
