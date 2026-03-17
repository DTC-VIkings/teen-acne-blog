import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";

const categoryData: Record<
  string,
  { name: string; description: string; gradient: string }
> = {
  guides: {
    name: "Guides",
    description:
      "Step-by-step skincare guides and routines to help your teen build healthy habits.",
    gradient: "linear-gradient(135deg, #1D7B83 0%, #2BA4A0 40%, #A8D8C8 100%)",
  },
  "acne-treatments": {
    name: "Acne Treatments",
    description:
      "From over-the-counter to prescription — everything you need to know about treating acne effectively.",
    gradient: "linear-gradient(135deg, #0B4F6C 0%, #3A7CA5 45%, #81C3D7 100%)",
  },
  "dealing-with-acne": {
    name: "Dealing with Acne",
    description:
      "Lifestyle tips, diet advice, and practical strategies for managing breakouts day to day.",
    gradient: "linear-gradient(135deg, #2D6A4F 0%, #52B788 50%, #B7E4C7 100%)",
  },
  "types-of-acne": {
    name: "Types of Acne",
    description:
      "Understanding the different types of acne — from whiteheads and blackheads to cystic and hormonal breakouts.",
    gradient: "linear-gradient(135deg, #6B3FA0 0%, #9B72CF 45%, #D4B8E8 100%)",
  },
  parents: {
    name: "Parents",
    description:
      "A guide for moms and dads helping their teens navigate acne with confidence and compassion.",
    gradient: "linear-gradient(135deg, #C26A3B 0%, #E8A87C 50%, #F5DEB3 100%)",
  },
};

export function generateStaticParams() {
  return Object.keys(categoryData).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categoryData[slug];
  if (!cat) return { title: "Not Found" };
  return {
    title: `${cat.name} | Teen Acne Solutions`,
    description: cat.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categoryData[slug];
  if (!cat) notFound();

  const allPosts = getAllPosts();
  const posts = allPosts.filter(
    (p) => p.category.toLowerCase() === cat.name.toLowerCase()
  );

  return (
    <div>
      {/* Hero header */}
      <section
        className="py-14 md:py-20"
        style={{ background: cat.gradient }}
      >
        <div className="max-w-[1100px] mx-auto px-5 md:px-[55px]">
          <Link
            href="/"
            className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
          >
            &larr; All Articles
          </Link>
          <h1 className="text-[36px] md:text-[50px] font-bold text-white leading-tight mt-4 mb-3">
            {cat.name}
          </h1>
          <p className="text-[17px] md:text-[19px] text-white/85 max-w-2xl leading-relaxed">
            {cat.description}
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="max-w-[1100px] mx-auto px-5 md:px-[55px] py-12 md:py-16">
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
          <>
            <p className="text-[14px] font-bold uppercase tracking-wide text-[#767474] mb-8">
              {posts.length} {posts.length === 1 ? "article" : "articles"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-10 md:gap-y-10">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex gap-5 items-start"
                >
                  <div className="flex-shrink-0 w-[100px] md:w-[121px] aspect-[4/3] rounded-xl md:rounded-2xl bg-gradient-to-br from-[#02838d]/20 to-[#02838d]/5 overflow-hidden group-hover:opacity-80 transition-opacity">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        width={242}
                        height={182}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
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
                    )}
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
          </>
        )}
      </section>
    </div>
  );
}
