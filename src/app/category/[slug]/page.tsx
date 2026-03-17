import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";
import { notFound } from "next/navigation";

const categoryMap: Record<string, string> = {
  guides: "Guides",
  "acne-treatments": "Acne Treatments",
  "dealing-with-acne": "Dealing with Acne",
  "types-of-acne": "Types of Acne",
  parents: "Parents",
};

export function generateStaticParams() {
  return Object.keys(categoryMap).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = categoryMap[slug];
  if (!name) return { title: "Not Found" };
  return {
    title: `${name} | Teen Acne Solutions`,
    description: `Browse all ${name.toLowerCase()} articles on Teen Acne Solutions.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryName = categoryMap[slug];
  if (!categoryName) notFound();

  const allPosts = getAllPosts();
  const posts = allPosts.filter(
    (p) => p.category.toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-[55px] py-12 md:py-16">
      <Link
        href="/"
        className="text-sm font-semibold text-[#02838d] hover:text-[#08565c] transition-colors"
      >
        &larr; All Articles
      </Link>
      <h1 className="text-[34px] md:text-[46px] font-bold text-[#231f20] leading-tight mt-4 mb-3">
        {categoryName}
      </h1>
      <p className="text-[17px] text-[#767474] mb-10">
        Browse all articles about {categoryName.toLowerCase()}.
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#767474] text-lg mb-4">
            No articles in this category yet.
          </p>
          <Link
            href="/"
            className="text-[#02838d] font-semibold hover:text-[#08565c]"
          >
            Browse all articles &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-10 md:gap-y-10">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex gap-5 items-start"
            >
              <div className="flex-shrink-0 w-[100px] md:w-[121px] aspect-[4/3] rounded-xl md:rounded-2xl bg-gradient-to-br from-[#02838d]/20 to-[#02838d]/5 flex items-center justify-center group-hover:opacity-80 transition-opacity">
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
              <div className="flex-1 min-w-0">
                <span className="text-[15px] font-semibold text-[#02838d] capitalize">
                  {post.category}
                </span>
                <h3 className="text-[18px] font-bold text-[#231f20] leading-[26px] mt-1 line-clamp-2 group-hover:text-[#08565c] transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-[#767474] mt-1.5 line-clamp-2">
                  {post.excerpt}
                </p>
                {post.reviewedBy && (
                  <div className="mt-2">
                    <span className="medical-badge">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Medically reviewed
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
