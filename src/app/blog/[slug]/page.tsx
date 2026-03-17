import {
  getPostBySlug,
  getAllSlugs,
  getRelatedPosts,
  formatDate,
} from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";
import SourcesHistoryTabs from "@/components/SourcesHistoryTabs";

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

  const relatedPosts = getRelatedPosts(slug, post.category);

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-[55px] py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main content column */}
        <article className="flex-1 min-w-0 max-w-[750px]">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="text-sm font-semibold text-[#02838d] hover:text-[#08565c] transition-colors"
          >
            &larr; All Articles
          </Link>

          {/* Title */}
          <h1 className="text-[34px] md:text-[46px] font-bold text-[#231f20] leading-[1.08] mt-6 mb-5">
            {post.title}
          </h1>

          {/* Mobile author/reviewer bar */}
          {post.reviewedBy && (
            <div className="lg:hidden flex items-center gap-3 mb-6 pb-6 border-b border-[#dcdbdb]">
              <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#02838d] to-[#08565c] flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0">
                {post.reviewedBy
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="text-[13px] leading-[18px] text-[#767474]">
                <p>
                  <span className="font-semibold text-[#231f20]">
                    Medically reviewed
                  </span>{" "}
                  by{" "}
                  <span className="font-semibold text-[#231f20] underline">
                    {post.reviewedBy}
                    {post.reviewerCredentials &&
                      `, ${post.reviewerCredentials}`}
                  </span>
                </p>
                <p className="mt-0.5">
                  Written by {post.author} &mdash; Updated{" "}
                  {formatDate(post.updatedDate || post.date)}
                </p>
              </div>
            </div>
          )}

          {/* Quick links */}
          {post.quickLinks && post.quickLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-1 gap-y-2 mb-6 text-[15px]">
              {post.quickLinks.map((link, i) => (
                <span key={link} className="flex items-center">
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-[#02838d] font-semibold hover:text-[#08565c] transition-colors"
                  >
                    {link}
                  </a>
                  {i < post.quickLinks!.length - 1 && (
                    <span className="text-[#dcdbdb] mx-2">|</span>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Key Takeaways */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div className="bg-[#fbf5ed] rounded-xl p-6 md:p-8 mb-10">
              <h2 className="text-[22px] font-bold text-[#231f20] mb-4">
                Key takeaways
              </h2>
              <ul className="space-y-3">
                {post.keyTakeaways.map((item, i) => (
                  <li key={i} className="flex gap-3 text-[16px] leading-[24px]">
                    <span className="mt-[7px] w-[7px] h-[7px] rounded-full bg-[#02838d] flex-shrink-0" />
                    <span
                      className="text-[#231f20]"
                      dangerouslySetInnerHTML={{
                        __html: item.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong>$1</strong>'
                        ),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article content */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-[#231f20] prose-headings:font-bold prose-p:text-[#231f20] prose-strong:text-[#231f20]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* How we reviewed this article */}
          <div className="mt-16 border-t border-[#dcdbdb] pt-8">
            <h3 className="text-[22px] font-bold text-[#231f20] mb-4">
              How we reviewed this article:
            </h3>

            <SourcesHistoryTabs
              sources={post.sources}
              writtenDate={formatDate(post.updatedDate || post.date)}
              reviewedDate={post.reviewedBy ? formatDate(post.date) : undefined}
              author={post.author}
              reviewedBy={post.reviewedBy}
              reviewerCredentials={post.reviewerCredentials}
            />
          </div>

          {/* Read This Next */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 border-t border-[#dcdbdb] pt-8">
              <h3 className="text-[22px] font-bold uppercase tracking-wide text-[#231f20] mb-8">
                Read This Next
              </h3>
              <div className="space-y-8">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group flex gap-5 items-start"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="flex-shrink-0 w-[120px] md:w-[160px] aspect-[4/3] rounded-xl bg-gradient-to-br from-[#02838d]/20 to-[#02838d]/5 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                      <svg
                        className="w-8 h-8 text-[#02838d]/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.476.884 6.084 2.334m0-14.292a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6.084 2.334"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[20px] font-bold text-[#231f20] leading-[26px] group-hover:text-[#08565c] transition-colors">
                        {related.title}
                      </h4>
                      {related.reviewedBy && (
                        <div className="flex items-center gap-2.5 mt-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#02838d] to-[#08565c] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                            {related.reviewedBy
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <span className="text-[13px] text-[#767474]">
                            Medically reviewed by{" "}
                            <span className="underline">
                              {related.reviewedBy}
                              {related.reviewerCredentials &&
                                `, ${related.reviewerCredentials}`}
                            </span>
                          </span>
                        </div>
                      )}
                      <p className="text-[15px] text-[#767474] mt-2 line-clamp-2">
                        {related.excerpt}
                      </p>
                      <span className="inline-block mt-3 text-[14px] font-bold uppercase tracking-wide text-[#231f20] group-hover:text-[#02838d]">
                        Read More &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-[300px] flex-shrink-0">
          {/* Reviewer card */}
          {post.reviewedBy && (
            <div className="sticky top-[90px]">
              <div className="flex gap-3 items-start mb-8">
                <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#02838d] to-[#08565c] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {post.reviewedBy
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="text-[14px] leading-[20px]">
                  <p>
                    <span className="underline font-semibold">
                      Medically reviewed
                    </span>{" "}
                    by{" "}
                    <span className="underline font-semibold">
                      {post.reviewedBy}
                      {post.reviewerCredentials &&
                        `, ${post.reviewerCredentials}`}
                    </span>{" "}
                    &mdash; Written by {post.author} &mdash;{" "}
                    <span className="underline">
                      Updated on{" "}
                      {formatDate(post.updatedDate || post.date)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Related Stories */}
              {relatedPosts.length > 0 && (
                <div>
                  <div className="border-t-[3px] border-[#231f20] pt-4 mb-5">
                    <h3 className="text-[18px] font-bold lowercase text-[#231f20]">
                      related stories
                    </h3>
                  </div>
                  <div className="space-y-5">
                    {relatedPosts.slice(0, 4).map((related) => (
                      <Link
                        key={related.slug}
                        href={`/blog/${related.slug}`}
                        className="group flex gap-3 items-start"
                      >
                        <div className="flex-shrink-0 w-[80px] aspect-square rounded-lg bg-gradient-to-br from-[#02838d]/20 to-[#02838d]/5 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                          <svg
                            className="w-5 h-5 text-[#02838d]/40"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.476.884 6.084 2.334m0-14.292a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6.084 2.334"
                            />
                          </svg>
                        </div>
                        <p className="text-[15px] font-bold text-[#231f20] leading-[20px] group-hover:text-[#08565c] transition-colors">
                          {related.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
