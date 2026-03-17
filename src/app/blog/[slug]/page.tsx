import { getPostBySlug, getAllSlugs, formatDate } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} | Teen Acne Solutions`,
    description: post.excerpt,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-[55px] py-8 md:py-12">
      <article className="max-w-[750px]">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="text-sm font-semibold text-[#02838d] hover:text-[#08565c] transition-colors"
        >
          &larr; All Articles
        </Link>

        {/* Category */}
        <div className="mt-6 mb-3">
          <span className="text-[15px] font-semibold text-[#02838d] capitalize">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[34px] md:text-[50px] font-bold text-[#231f20] leading-[1.08] mb-6">
          {post.title}
        </h1>

        {/* Author / Reviewer bar */}
        <div className="border-y border-[#dcdbdb] py-5 mb-10 space-y-3">
          {/* Author line */}
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] md:w-[50px] md:h-[50px] rounded-full bg-gradient-to-br from-[#02838d] to-[#08565c] flex items-center justify-center text-white font-bold text-sm">
              {post.author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-[15px]">
                <span className="text-[#767474]">Written by </span>
                <span className="font-semibold text-[#231f20]">
                  {post.author}
                </span>
              </p>
              {post.authorTitle && (
                <p className="text-[13px] text-[#767474]">
                  {post.authorTitle}
                </p>
              )}
            </div>
          </div>

          {/* Reviewer line */}
          {post.reviewedBy && (
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] md:w-[50px] md:h-[50px] rounded-full bg-gradient-to-br from-[#db1f88] to-[#9b1561] flex items-center justify-center text-white font-bold text-sm">
                {post.reviewedBy
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-[15px]">
                  <span className="text-[#767474]">Medically reviewed by </span>
                  <span className="font-semibold text-[#231f20]">
                    {post.reviewedBy}
                  </span>
                  {post.reviewerCredentials && (
                    <span className="text-[#767474]">
                      , {post.reviewerCredentials}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Date line */}
          <p className="text-[13px] text-[#767474] italic">
            {post.updatedDate
              ? `Updated on ${formatDate(post.updatedDate)}`
              : `Published on ${formatDate(post.date)}`}
            {post.updatedDate &&
              ` — Originally published ${formatDate(post.date)}`}
          </p>
        </div>

        {/* Article content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-[#231f20] prose-headings:font-bold prose-p:text-[#231f20] prose-strong:text-[#231f20]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Medical disclaimer */}
        <div className="mt-12 p-6 bg-[#fbf5ed] border-l-4 border-[#f0533a] rounded-r-lg">
          <p className="text-[13px] font-bold uppercase tracking-wide text-[#767474] mb-2">
            Medical disclaimer
          </p>
          <p className="text-sm text-[#767474] leading-relaxed">
            This article is for informational purposes only and is not a
            substitute for professional medical advice, diagnosis, or treatment.
            Always seek the advice of a dermatologist or other qualified
            healthcare provider with any questions about a medical condition.
          </p>
        </div>
      </article>
    </div>
  );
}
