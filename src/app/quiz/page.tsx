"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────
type StepType =
  | "single"
  | "single-image"
  | "multi"
  | "multi-image"
  | "input"
  | "date-input"
  | "interstitial"
  | "diagnosis"
  | "timeline"
  | "result";

interface Option {
  label: string;
  image?: string;
}

interface Step {
  type: StepType;
  eyebrow?: string;
  question?: string;
  subtitle?: string;
  options?: Option[];
  inputPlaceholder?: string;
  inputType?: string;
  content?: React.ReactNode;
}

// ── Quiz Data ───────────────────────────────────────────────────────
const steps: Step[] = [
  // 0 - Gender
  {
    type: "single",
    eyebrow: "LET'S FIND YOUR TEEN'S PERFECT ROUTINE",
    question: "Who is this quiz for?",
    options: [
      { label: "My son" },
      { label: "My daughter" },
      { label: "Myself (I'm a teen)" },
      { label: "Myself (I'm an adult)" },
    ],
  },
  // 1 - Age group
  {
    type: "single",
    question: "What age group?",
    subtitle: "This helps us personalize the acne plan",
    options: [
      { label: "10 – 13" },
      { label: "14 – 17" },
      { label: "18 – 24" },
      { label: "25+" },
    ],
  },
  // 2 - Skin severity visual
  {
    type: "single",
    question: "Which best describes the current skin?",
    subtitle: "Select the closest match",
    options: [
      { label: "Occasional spots" },
      { label: "Regular breakouts" },
      { label: "Severe acne & redness" },
      { label: "Cystic & painful" },
    ],
  },
  // 3 - Dream skin
  {
    type: "single",
    question: "What does dream skin look like?",
    options: [
      { label: "Clear & smooth" },
      { label: "Glowing & healthy" },
      { label: "Even-toned & calm" },
      { label: "Scar-free & confident" },
    ],
  },
  // 4 - Main concerns (multi)
  {
    type: "multi",
    eyebrow: "SELECT ALL THAT APPLY",
    question: "What are the main skin concerns?",
    subtitle: "Choose as many as you like",
    options: [
      { label: "Teen breakouts" },
      { label: "Persistent acne" },
      { label: "Inflamed & red skin" },
      { label: "Hormonal / cystic acne" },
      { label: "Dark marks & scars" },
      { label: "Confidence issues" },
    ],
  },
  // 5 - Severity daily
  {
    type: "single",
    question: "How severe is the acne on most days?",
    options: [
      { label: "Mild — a few spots here and there" },
      { label: "Moderate — regular breakouts that are bothersome" },
      { label: "Severe — painful, inflamed acne that affects daily life" },
    ],
  },
  // 6 - Skin tone
  {
    type: "single",
    question: "What best describes the skin tone?",
    subtitle: "This helps us understand how the skin may scar",
    options: [
      { label: "Fair" },
      { label: "Light" },
      { label: "Medium" },
      { label: "Dark" },
      { label: "Very Dark" },
      { label: "Not sure" },
    ],
  },
  // 7 - Sensitivity
  {
    type: "single",
    question: "Is the skin sensitive or easily irritated?",
    options: [
      { label: "Yes, very sensitive" },
      { label: "No, not really" },
      { label: "Not sure" },
    ],
  },
  // 8 - Interstitial 1
  {
    type: "interstitial",
  },
  // 9 - Exact age
  {
    type: "input",
    question: "What is the exact age?",
    subtitle: "This helps us fine-tune the personalized plan",
    inputPlaceholder: "Enter age",
    inputType: "number",
  },
  // 10 - Diagnosis
  {
    type: "diagnosis",
  },
  // 11 - What have you tried
  {
    type: "multi",
    eyebrow: "WE UNDERSTAND YOUR FRUSTRATION",
    question: "What has already been tried?",
    subtitle: "Select all that apply",
    options: [
      { label: "Over-the-counter products (Clearasil, Clean & Clear, etc.)" },
      { label: "Retinol / Retinoids" },
      { label: "Prescription medication (Accutane, antibiotics)" },
      { label: "Natural remedies (tea tree, aloe vera)" },
      { label: "Nothing yet — just starting the journey" },
    ],
  },
  // 12 - Interstitial 2
  {
    type: "interstitial",
  },
  // 13 - Time commitment
  {
    type: "single",
    question: "How much time can be dedicated to skincare daily?",
    options: [
      { label: "Less than 2 minutes" },
      { label: "2 – 5 minutes" },
      { label: "5 – 10 minutes" },
      { label: "As long as it takes!" },
    ],
  },
  // 14 - Confidence
  {
    type: "single",
    question: "How does acne affect confidence?",
    options: [
      { label: "It doesn't really bother me" },
      { label: "I'm somewhat self-conscious about it" },
      { label: "It significantly impacts my confidence" },
      { label: "I avoid social situations because of it" },
    ],
  },
  // 15 - Motivation
  {
    type: "single",
    question: "How motivated are you to finally clear skin?",
    options: [
      { label: "Somewhat interested" },
      { label: "Pretty motivated" },
      { label: "Very motivated — ready to commit" },
      { label: "Extremely motivated — I'll do whatever it takes" },
    ],
  },
  // 16 - Product priorities (multi)
  {
    type: "multi",
    eyebrow: "ALMOST DONE!",
    question: "What's most important in a skincare product?",
    subtitle: "Select all that apply",
    options: [
      { label: "100% natural ingredients" },
      { label: "Fast results (visible within days)" },
      { label: "No harsh chemicals" },
      { label: "Works for sensitive skin" },
      { label: "Clinically tested" },
      { label: "Money-back guarantee" },
    ],
  },
  // 17 - Timeline results
  {
    type: "timeline",
  },
  // 18 - Final recommendation
  {
    type: "result",
  },
];

// ── Component ───────────────────────────────────────────────────────
export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const step = steps[current];
  const progress = Math.round((current / (steps.length - 1)) * 100);

  const advance = useCallback(
    (answer?: string) => {
      if (answer !== undefined) {
        setAnswers((prev) => ({ ...prev, [current]: answer }));
      }
      setMultiSelected([]);
      setInputValue("");
      setCurrent((prev) => Math.min(prev + 1, steps.length - 1));
    },
    [current]
  );

  const handleMultiContinue = useCallback(() => {
    if (multiSelected.length === 0) return;
    setAnswers((prev) => ({ ...prev, [current]: multiSelected }));
    setMultiSelected([]);
    setCurrent((prev) => prev + 1);
  }, [current, multiSelected]);

  const handleInputContinue = useCallback(() => {
    if (!inputValue.trim()) return;
    setAnswers((prev) => ({ ...prev, [current]: inputValue }));
    setInputValue("");
    setCurrent((prev) => prev + 1);
  }, [current, inputValue]);

  const toggleMulti = (label: string) => {
    setMultiSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  // Compute personalized data
  const severityText =
    answers[5] && typeof answers[5] === "string"
      ? answers[5].includes("Severe")
        ? "Severe"
        : answers[5].includes("Moderate")
        ? "Moderate"
        : "Mild"
      : "Moderate";

  const concernText =
    answers[4] && Array.isArray(answers[4])
      ? (answers[4] as string[])[0]
      : "Teen Breakouts";

  const ageText = answers[9] || "15";

  // ── Render Helpers ──────────────────────────────────────────────
  const renderInterstitial1 = () => (
    <div className="text-center max-w-xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-[#231f20] mb-4">
        You're not alone — and there is a solution.
      </h2>
      <p className="text-[#767474] text-base leading-relaxed mb-6">
        Over <strong className="text-[#231f20]">12,000 teens and parents</strong>{" "}
        have used our guides to find the right acne routine. Most teens see real
        improvement within <strong className="text-[#231f20]">30 days</strong>{" "}
        when they follow an evidence-based approach.
      </p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-left">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#02838d] flex items-center justify-center text-white text-sm font-bold shrink-0">
            JM
          </div>
          <div>
            <p className="font-semibold text-[#231f20] text-sm">Jessica M.</p>
            <p className="text-xs text-[#767474]">Mom of a 15-year-old</p>
          </div>
        </div>
        <p className="text-[#231f20] text-sm italic leading-relaxed">
          &ldquo;My daughter tried everything from the drugstore for two years.
          Once we followed the routine suggested here, her skin cleared up in
          about five weeks. I wish we'd found this sooner.&rdquo;
        </p>
        <div className="flex gap-0.5 mt-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-amber-400 text-lg">★</span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 text-sm text-[#767474]">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#02838d]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Evidence-based
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#02838d]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          12,000+ helped
        </span>
      </div>
      <button
        onClick={() => advance()}
        className="mt-8 w-full bg-[#02838d] hover:bg-[#026a73] text-white font-bold text-base py-4 rounded-lg transition-colors"
      >
        CONTINUE
      </button>
    </div>
  );

  const renderInterstitial2 = () => (
    <div className="text-center max-w-xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-[#231f20] mb-4">
        Why most acne products fail teens
      </h2>
      <p className="text-[#767474] text-base leading-relaxed mb-4">
        Most products only treat <strong className="text-[#231f20]">surface symptoms</strong>{" "}
        while ignoring the root cause. They use harsh chemicals that dry out skin,
        disrupt natural oil balance, and often make acne{" "}
        <strong className="text-[#231f20]">worse</strong> over time.
      </p>
      <p className="text-[#767474] text-base leading-relaxed mb-6">
        Our research shows that{" "}
        <strong className="text-[#231f20]">
          a complete system — not a single product
        </strong>{" "}
        — delivers the best results for teen skin. That's why we recommend
        routines with clean, natural ingredients that work{" "}
        <em>with</em> your skin's biology.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          {
            initials: "RM",
            quote:
              "After years of drugstore products, we finally found something that actually works.",
          },
          {
            initials: "KD",
            quote:
              "My son's confidence came back within the first month. Wish we'd started sooner.",
          },
          {
            initials: "TL",
            quote:
              "The difference between a random cleanser and a proper routine is night and day.",
          },
        ].map((t) => (
          <div
            key={t.initials}
            className="bg-white rounded-lg p-4 border border-gray-200 text-left"
          >
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <p className="text-[#231f20] text-sm italic leading-relaxed">
              &ldquo;{t.quote}&rdquo;
            </p>
            <p className="text-xs text-[#767474] mt-2 font-semibold">
              — Verified Parent
            </p>
          </div>
        ))}
      </div>
      <button
        onClick={() => advance()}
        className="mt-4 w-full bg-[#02838d] hover:bg-[#026a73] text-white font-bold text-base py-4 rounded-lg transition-colors"
      >
        CONTINUE
      </button>
    </div>
  );

  const renderDiagnosis = () => {
    const severityPercent =
      severityText === "Severe" ? 80 : severityText === "Moderate" ? 55 : 30;
    return (
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#231f20] mb-6">
          Your Acne Profile
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-left mb-6">
          <span className="inline-block text-xs font-bold text-white bg-red-500 px-2.5 py-1 rounded-full mb-3">
            {severityText === "Severe"
              ? "HIGH"
              : severityText === "Moderate"
              ? "MODERATE"
              : "LOW"}
          </span>
          <p className="font-semibold text-[#231f20] mb-2">Acne Severity Level</p>
          <div className="w-full h-3 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 relative mb-1">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-400 rounded-full shadow"
              style={{ left: `${severityPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#767474] mb-4">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
            <span>Critical</span>
          </div>
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded text-sm text-[#231f20] leading-relaxed">
            Your{" "}
            <strong>{concernText}</strong> combined with your skin profile
            indicates {severityText} acne severity. Without proper treatment,
            breakouts can worsen and leave lasting scars.
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-6">
          {[
            ["Severity Level", severityText, severityText !== "Mild"],
            ["Problem Areas", concernText, false],
            [
              "Inflammation Risk",
              severityText === "Mild" ? "Low" : severityText,
              severityText !== "Mild",
            ],
            ["Recovery Potential", "High", false],
          ].map(([label, value, isOrange]) => (
            <div key={label as string} className="flex justify-between px-5 py-3 text-sm">
              <span className="text-[#767474]">{label as string}</span>
              <span
                className={`font-semibold ${
                  isOrange ? "text-orange-500" : "text-[#231f20]"
                }`}
              >
                {value as string}
              </span>
            </div>
          ))}
        </div>
        <p className="text-sm text-[#767474] mb-4">
          Acne is not permanent & can be treated — click &apos;Continue&apos; to
          discover how.
        </p>
        <button
          onClick={() => advance()}
          className="w-full bg-[#02838d] hover:bg-[#026a73] text-white font-bold text-base py-4 rounded-lg transition-colors"
        >
          CONTINUE
        </button>
      </div>
    );
  };

  const renderTimeline = () => {
    const today = new Date();
    const day30 = new Date(today);
    day30.setDate(day30.getDate() + 30);
    const day60 = new Date(today);
    day60.setDate(day60.getDate() + 60);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    return (
      <div className="text-center max-w-lg mx-auto">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full mb-4">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          ANALYSIS COMPLETE
        </span>
        <p className="text-sm text-[#767474] mb-1">Based on your answers:</p>
        <h2 className="text-2xl md:text-3xl font-bold text-[#02838d] mb-6">
          Clear skin is possible within 60 days!
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-left mb-6">
          <p className="text-sm text-[#767474] mb-4 flex items-center gap-2">
            <span className="text-lg">📋</span> Here&apos;s what to expect with the right
            routine:
          </p>
          {[
            {
              day: "DAY 3",
              color: "bg-orange-400",
              text: (
                <>
                  First visible results (reduced redness, fewer new breakouts)
                </>
              ),
            },
            {
              day: "DAY 30",
              color: "bg-orange-500",
              text: (
                <>
                  Significant improvement by{" "}
                  <strong className="text-[#02838d]">{fmt(day30)}</strong>
                </>
              ),
            },
            {
              day: "DAY 60",
              color: "bg-green-500",
              text: (
                <>
                  Clear, acne-free skin by{" "}
                  <strong className="text-[#02838d]">{fmt(day60)}</strong>
                </>
              ),
            },
          ].map((item) => (
            <div key={item.day} className="flex items-start gap-3 mb-4 last:mb-0">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <div className="w-0.5 h-8 bg-gray-200 last:hidden" />
              </div>
              <div>
                <span className="text-xs font-bold text-orange-500">
                  {item.day}
                </span>
                <p className="text-sm text-[#231f20]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 text-xs text-[#767474] mb-6">
          <span>🛡️ 60-Day Guarantee</span>
          <span>💚 12,000+ Teens Helped</span>
        </div>
        <button
          onClick={() => advance()}
          className="w-full bg-[#02838d] hover:bg-[#026a73] text-white font-bold text-base py-4 rounded-lg transition-colors"
        >
          SEE YOUR CLEAR SKIN PLAN
        </button>
      </div>
    );
  };

  const renderResult = () => (
    <div className="text-center max-w-xl mx-auto">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full mb-4">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        PERSONALIZED FOR YOU
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-[#231f20] mb-2">
        Your Personalized Recommendation
      </h2>
      <p className="text-sm text-[#767474] mb-6">
        Based on your{" "}
        <strong className="text-[#02838d]">{severityText}</strong> acne with{" "}
        <strong className="text-[#02838d]">{concernText}</strong> concerns, we
        recommend the following approach:
      </p>

      {/* Top Pick */}
      <div className="bg-white rounded-xl border-2 border-[#02838d] overflow-hidden mb-6 text-left">
        <div className="bg-[#02838d] text-white text-center py-2 text-xs font-bold tracking-wider">
          ⭐ OUR #1 RECOMMENDATION
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="/images/norse-ritual.png"
              alt="Norse Organics Kill Acne & Redness Ritual"
              width={100}
              height={100}
              className="rounded-lg"
            />
            <div>
              <h3 className="font-bold text-[#231f20] text-lg">
                Kill Acne & Redness Ritual
              </h3>
              <p className="text-sm text-[#767474]">
                Norse Organics · 3-Step System
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <span className="text-xs text-[#767474]">
                  4.9 — 7,500+ reviews
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <p className="text-xs font-bold text-[#767474] uppercase tracking-wider">
              Why this is perfect for you
            </p>
            {[
              <>
                Gentle enough for <strong>young skin</strong> — no harsh chemicals
                that damage the skin barrier
              </>,
              <>
                Simple <strong>3-step routine</strong> that fits easily into the
                day
              </>,
              <>
                380+ bioactive compounds from <strong>Arctic plants</strong>{" "}
                — nature&apos;s most powerful anti-inflammatory ingredients
              </>,
              <>
                <strong>Zero synthetic preservatives</strong>, parabens, or
                hormone disruptors
              </>,
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-[#231f20]">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-[#767474] line-through mr-2">
                $127.00
              </span>
              <span className="text-2xl font-bold text-[#02838d]">$76.00</span>
              <span className="text-xs text-green-600 font-semibold ml-2">
                SAVE 40%
              </span>
            </div>
            <span className="text-xs text-[#767474]">
              Subscribe & save · cancel anytime
            </span>
          </div>

          <a
            href="https://norseorganics.co/products/kill-acne-redness-ritual"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#02838d] hover:bg-[#026a73] text-white font-bold text-base py-4 rounded-lg transition-colors text-center"
          >
            GET YOUR RITUAL — SAVE 40% →
          </a>
          <p className="text-xs text-[#767474] text-center mt-2">
            Clear skin in 60 days or your money back
          </p>
        </div>
      </div>

      {/* Read our full review */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6 text-left">
        <p className="text-sm text-[#231f20] mb-2">
          <strong>📖 Want to see our full research?</strong>
        </p>
        <p className="text-sm text-[#767474] mb-3">
          We tested 100+ products and ranked the 10 best. See how Norse Organics
          compared to CeraVe, Proactiv, Murad, and more.
        </p>
        <Link
          href="/blog/best-acne-skincare-products-teens-comprehensive-comparison"
          className="text-[#02838d] text-sm font-semibold hover:underline"
        >
          Read the full comparison →
        </Link>
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-3 text-center mb-8">
        {[
          { icon: "🛡️", label: "60-Day\nGuarantee" },
          { icon: "🌿", label: "100%\nOrganic" },
          { icon: "🚚", label: "Free\nShipping" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-lg border border-gray-200 p-3"
          >
            <span className="text-2xl">{s.icon}</span>
            <p className="text-xs text-[#767474] mt-1 whitespace-pre-line">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/"
        className="text-sm text-[#767474] hover:text-[#02838d] transition-colors"
      >
        ← Back to Teen Acne Solutions
      </Link>
    </div>
  );

  // ── Main Render ─────────────────────────────────────────────────
  const renderStep = () => {
    switch (step.type) {
      case "interstitial":
        return current === 8 ? renderInterstitial1() : renderInterstitial2();
      case "diagnosis":
        return renderDiagnosis();
      case "timeline":
        return renderTimeline();
      case "result":
        return renderResult();
      case "input":
        return (
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#231f20] mb-2">
              {step.question}
            </h2>
            {step.subtitle && (
              <p className="text-sm text-[#767474] mb-6">{step.subtitle}</p>
            )}
            <input
              type={step.inputType || "text"}
              placeholder={step.inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-64 mx-auto block border-2 border-[#02838d] rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#02838d]/30 mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleInputContinue()}
            />
            <button
              onClick={handleInputContinue}
              disabled={!inputValue.trim()}
              className="w-64 mx-auto block bg-[#02838d] disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
            >
              CONTINUE
            </button>
          </div>
        );
      case "multi":
        return (
          <div className="text-center max-w-lg mx-auto">
            {step.eyebrow && (
              <p className="text-xs font-bold text-[#02838d] tracking-wider mb-2">
                {step.eyebrow}
              </p>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-[#231f20] mb-2">
              {step.question}
            </h2>
            {step.subtitle && (
              <p className="text-sm text-[#767474] mb-6">{step.subtitle}</p>
            )}
            <div className="flex flex-col gap-3 mb-6">
              {step.options?.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => toggleMulti(opt.label)}
                  className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all text-[15px] ${
                    multiSelected.includes(opt.label)
                      ? "border-[#02838d] bg-[#02838d]/5 font-semibold"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleMultiContinue}
              disabled={multiSelected.length === 0}
              className="w-full bg-[#02838d] disabled:bg-gray-300 text-white font-bold py-4 rounded-lg transition-colors text-base"
            >
              CONTINUE
            </button>
          </div>
        );
      case "single":
      default:
        return (
          <div className="text-center max-w-lg mx-auto">
            {step.eyebrow && (
              <p className="text-xs font-bold text-[#02838d] tracking-wider mb-2">
                {step.eyebrow}
              </p>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-[#231f20] mb-2">
              {step.question}
            </h2>
            {step.subtitle && (
              <p className="text-sm text-[#767474] mb-6">{step.subtitle}</p>
            )}
            <div className="flex flex-col gap-3">
              {step.options?.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => advance(opt.label)}
                  className="w-full text-left px-5 py-4 rounded-lg border-2 border-gray-200 bg-white hover:border-[#02838d] hover:bg-[#02838d]/5 transition-all text-[15px]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3ee] flex flex-col">
      {/* Header */}
      <div className="bg-black">
        <div className="max-w-[800px] mx-auto px-5 h-[56px] flex items-center justify-center">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Teen Acne Solutions"
              width={200}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200">
        <div
          className="h-full bg-[#02838d] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Quiz body */}
      <div className="flex-1 flex items-start justify-center px-5 py-8 md:py-12">
        <div className="w-full max-w-2xl animate-fade-in" key={current}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
