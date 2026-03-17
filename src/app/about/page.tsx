export default function About() {
  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-[55px] py-12 md:py-16">
      <div className="max-w-[750px]">
        <h1 className="text-[34px] md:text-[50px] font-bold text-[#231f20] leading-tight mb-8">
          About Teen Acne Solutions
        </h1>

        <div className="space-y-5 text-[17px] text-[#231f20] leading-[26px]">
          <p>
            Teen Acne Solutions is a resource for moms and teens who are looking
            for practical, evidence-based advice on managing acne.
          </p>
          <p>
            We know how frustrating breakouts can be &mdash; especially during
            the teen years when so much is already changing. Our goal is to cut
            through the noise and share tips that actually work, backed by
            dermatologist recommendations and peer-reviewed research.
          </p>
          <p>
            Whether you&apos;re a parent trying to help your teen build a
            skincare routine, or a teen looking for answers yourself, you&apos;re
            in the right place.
          </p>
        </div>

        {/* Standards section */}
        <div className="mt-12 p-8 bg-[#f7f7f7] rounded-xl">
          <h2 className="text-[24px] font-bold text-[#231f20] mb-4">
            Our Editorial Standards
          </h2>
          <div className="space-y-4 text-[17px] text-[#231f20] leading-[26px]">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-[#02838d] mt-1 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <p>
                Every article is reviewed by a board-certified dermatologist or
                qualified healthcare professional.
              </p>
            </div>
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-[#02838d] mt-1 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <p>
                We cite peer-reviewed studies and dermatologist recommendations
                wherever possible.
              </p>
            </div>
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-[#02838d] mt-1 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <p>
                We clearly distinguish between proven treatments and anecdotal
                advice.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-[#fbf5ed] border-l-4 border-[#f0533a] rounded-r-lg">
          <p className="text-sm text-[#767474] leading-relaxed">
            <strong className="text-[#231f20]">Disclaimer:</strong> The content
            on this site is for informational purposes only and is not a
            substitute for professional medical advice. Always consult a
            dermatologist for persistent or severe acne.
          </p>
        </div>
      </div>
    </div>
  );
}
