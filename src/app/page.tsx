import Link from "next/link";
import Image from "next/image";
import { getAllPosts, formatDate } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div>
      {/* Hero section */}
      <section
        className="py-16 md:py-24"
        style={{
          background:
            "linear-gradient(180deg, #1D7B83 0%, #5EB0B9 62%, #EBDCC0 100%)",
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5 md:px-[55px]">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3">
            Evidence-Based Skincare
          </p>
          <h1 className="text-4xl md:text-[50px] font-bold text-white leading-tight mb-4">
            Teen Acne Solutions
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
            Practical, medically reviewed tips for moms and teens navigating
            acne together. From skincare routines to lifestyle changes &mdash;
            everything you need for clearer, healthier skin.
          </p>
        </div>
      </section>

      {/* Articles section */}
      <section className="max-w-[1100px] mx-auto px-5 md:px-[55px] py-12 md:py-16">
        <h2 className="text-[28px] md:text-[38px] font-bold text-[#231f20] mb-8 md:mb-10">
          Latest Articles
        </h2>

        {posts.length === 0 ? (
          <p className="text-[#767474]">New posts coming soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-10 md:gap-y-10">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex gap-5 items-start"
              >
                {/* Thumbnail */}
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
        )}
      </section>
    </div>
  );
}
