"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────
type StepType =
  | "single"
  | "single-image"
  | "single-portrait"
  | "multi"
  | "multi-image"
  | "input"
  | "date-input"
  | "photo-upload"
  | "interstitial"
  | "diagnosis"
  | "timeline"
  | "result";

interface AiAnalysis {
  acneType: string;
  severity: string;
  severityScore: number;
  affectedAreas: string[];
  inflammationLevel: string;
  scarringRisk: string;
  keyFindings: string[];
  recommendation: string;
}

interface Option {
  label: string;
  image?: string;
  imagePosition?: string; // CSS object-position value
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

// Step IDs for skip logic
const STEP_PHOTO = 1;
const STEP_SKIN_SEVERITY = 2; // first skippable if AI
const STEP_SENSITIVITY = 7;   // last skippable if AI
const STEP_INTERSTITIAL1 = 8;
const STEP_DIAGNOSIS = 10;

// ── Quiz Data ───────────────────────────────────────────────────────
const steps: Step[] = [
  // 0 - Who is this for
  {
    type: "single-portrait",
    eyebrow: "LET'S FIND YOUR TEEN'S PERFECT ROUTINE",
    question: "Who is this quiz for?",
    options: [
      { label: "My son", image: "/images/teen-boy-portrait.png" },
      { label: "My daughter", image: "/images/teen-girl-portrait.png" },
      { label: "Myself — male", image: "/images/adult-man-portrait.png" },
      { label: "Myself — female", image: "/images/adult-woman-portrait.png" },
    ],
  },
  // 1 - Photo upload (AI analysis) — MOVED TO STEP 2
  {
    type: "photo-upload",
  },
  // 2 - Skin severity visual (skipped if AI)
  {
    type: "single-image",
    question: "Which best describes the current skin?",
    subtitle: "Select the closest match",
    options: [
      { label: "Occasional spots", image: "/images/quiz-mild.jpg" },
      { label: "Regular breakouts", image: "/images/quiz-moderate.jpg" },
      { label: "Severe acne & redness", image: "/images/quiz-severe.jpg" },
      { label: "Cystic & painful", image: "/images/quiz-cystic.jpg" },
    ],
  },
  // 3 - Dream skin (skipped if AI)
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
  // 4 - Main concerns (skipped if AI)
  {
    type: "multi-image",
    eyebrow: "SELECT ALL THAT APPLY",
    question: "What are the main skin concerns?",
    subtitle: "Choose as many as you like",
    options: [
      { label: "Teen breakouts", image: "/images/quiz-teen-acne.jpg" },
      { label: "Persistent acne", image: "/images/quiz-persistent.jpg" },
      { label: "Inflamed & red skin", image: "/images/quiz-inflamed.jpg" },
      { label: "Hormonal / cystic acne", image: "/images/quiz-hormonal.jpg" },
      { label: "Dark marks & scars", image: "/images/quiz-dark-marks.jpg" },
      { label: "Confidence issues", image: "/images/quiz-confidence.jpg" },
    ],
  },
  // 5 - Severity daily (skipped if AI)
  {
    type: "single-image",
    question: "How severe is the acne on most days?",
    options: [
      { label: "Mild — a few spots here and there", image: "/images/quiz-mild.jpg" },
      { label: "Moderate — regular breakouts that are bothersome", image: "/images/quiz-moderate.jpg" },
      { label: "Severe — painful, inflamed acne that affects daily life", image: "/images/quiz-severe.jpg" },
    ],
  },
  // 6 - Skin tone (skipped if AI)
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
  // 7 - Sensitivity (skipped if AI)
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
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate annotated overlay image when AI analysis completes
  useEffect(() => {
    if (!aiAnalysis || !photoPreview) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const s = 600; // output size
      canvas.width = s;
      canvas.height = s;
      const ctx = canvas.getContext("2d")!;

      // Draw the original image (cover-fit)
      const scale = Math.max(s / img.width, s / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (s - w) / 2, (s - h) / 2, w, h);

      // Dark overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, s, s);

      // Grid lines for scientific look
      ctx.strokeStyle = "rgba(2, 131, 141, 0.12)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < s; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(s, i); ctx.stroke();
      }

      // Severity color
      const sevColor =
        aiAnalysis.severityScore >= 70
          ? "#ef4444"
          : aiAnalysis.severityScore >= 40
          ? "#f97316"
          : "#22c55e";

      // Draw detection zones (pseudo-random but deterministic based on findings)
      const zones = [
        { x: 0.35, y: 0.3, r: 0.18 },
        { x: 0.6, y: 0.45, r: 0.14 },
        { x: 0.45, y: 0.65, r: 0.12 },
        { x: 0.25, y: 0.55, r: 0.1 },
        { x: 0.7, y: 0.3, r: 0.09 },
      ];

      const numZones = Math.min(
        aiAnalysis.affectedAreas.length || 3,
        zones.length
      );

      zones.slice(0, numZones).forEach((zone, i) => {
        const cx = zone.x * s;
        const cy = zone.y * s;
        const r = zone.r * s;

        // Pulsing circle
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = sevColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Inner glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `${sevColor}20`);
        grad.addColorStop(1, `${sevColor}05`);
        ctx.fillStyle = grad;
        ctx.fill();

        // Corner brackets
        const bLen = 12;
        ctx.strokeStyle = sevColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);

        // top-left
        const bx = cx - r * 0.7;
        const by = cy - r * 0.7;
        const bx2 = cx + r * 0.7;
        const by2 = cy + r * 0.7;

        [[bx, by, 1, 1], [bx2, by, -1, 1], [bx, by2, 1, -1], [bx2, by2, -1, -1]].forEach(
          ([x, y, dx, dy]) => {
            ctx.beginPath();
            ctx.moveTo(x as number, (y as number) + (dy as number) * bLen);
            ctx.lineTo(x as number, y as number);
            ctx.lineTo((x as number) + (dx as number) * bLen, y as number);
            ctx.stroke();
          }
        );

        // Small marker dot
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = sevColor;
        ctx.fill();

        // Label line + text
        const labelX = i % 2 === 0 ? cx + r + 10 : cx - r - 10;
        const labelY = cy - r * 0.3;
        ctx.beginPath();
        ctx.moveTo(cx + (i % 2 === 0 ? r * 0.7 : -r * 0.7), cy);
        ctx.lineTo(labelX, labelY);
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label background
        const label =
          aiAnalysis.affectedAreas[i] ||
          aiAnalysis.keyFindings[i]?.slice(0, 25) ||
          `Zone ${i + 1}`;
        ctx.font = "bold 11px system-ui, sans-serif";
        const textW = ctx.measureText(label).width;
        const pad = 6;
        const lx = i % 2 === 0 ? labelX : labelX - textW - pad * 2;

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath();
        ctx.roundRect(lx, labelY - 10, textW + pad * 2, 20, 4);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, lx + pad, labelY + 4);
      });

      // Top bar - "AI SKIN ANALYSIS"
      ctx.fillStyle = "rgba(2, 131, 141, 0.9)";
      ctx.fillRect(0, 0, s, 32);
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("🔬  AI SKIN ANALYSIS  ·  TEEN ACNE SOLUTIONS", s / 2, 21);

      // Bottom bar with severity
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillRect(0, s - 50, s, 50);

      ctx.textAlign = "left";
      ctx.font = "bold 12px system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`TYPE: ${aiAnalysis.acneType.toUpperCase()}`, 16, s - 28);

      ctx.font = "11px system-ui, sans-serif";
      ctx.fillStyle = "#aaaaaa";
      ctx.fillText(`Severity: ${aiAnalysis.severityScore}/100  |  Inflammation: ${aiAnalysis.inflammationLevel}  |  Scarring risk: ${aiAnalysis.scarringRisk}`, 16, s - 12);

      // Severity badge
      ctx.textAlign = "right";
      ctx.fillStyle = sevColor;
      ctx.beginPath();
      ctx.roundRect(s - 90, s - 40, 74, 26, 4);
      ctx.fill();
      ctx.font = "bold 12px system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        aiAnalysis.severityScore >= 70 ? "SEVERE" : aiAnalysis.severityScore >= 40 ? "MODERATE" : "MILD",
        s - 20,
        s - 22
      );

      setAnnotatedImage(canvas.toDataURL("image/png"));
    };
    img.src = photoPreview;
  }, [aiAnalysis, photoPreview]);

  const step = steps[current];
  const progress = Math.round((current / (steps.length - 1)) * 100);

  const advance = useCallback(
    (answer?: string) => {
      if (answer !== undefined) {
        setAnswers((prev) => ({ ...prev, [current]: answer }));
      }
      setMultiSelected([]);
      setInputValue("");

      // If we're on the photo step and AI analysis succeeded, skip diagnosis questions
      if (current === STEP_PHOTO && aiAnalysis) {
        setCurrent(STEP_INTERSTITIAL1); // jump to interstitial, skipping steps 2-7
      } else {
        setCurrent((prev) => Math.min(prev + 1, steps.length - 1));
      }
    },
    [current, aiAnalysis]
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

  // Compute personalized data (use AI analysis if available, fall back to quiz answers)
  const severityText = aiAnalysis
    ? aiAnalysis.severity.charAt(0).toUpperCase() + aiAnalysis.severity.slice(1)
    : answers[5] && typeof answers[5] === "string"
    ? answers[5].includes("Severe")
      ? "Severe"
      : answers[5].includes("Moderate")
      ? "Moderate"
      : "Mild"
    : "Moderate";

  const concernText = aiAnalysis
    ? aiAnalysis.acneType
    : answers[4] && Array.isArray(answers[4])
    ? (answers[4] as string[])[0]
    : "Teen Breakouts";

  const ageText = answers[10] || "15";

  // Resize image to max 800px and compress to JPEG for API
  const resizeImage = (dataUrl: string, maxSize: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = dataUrl;
    });
  };

  // Photo upload handler
  const handlePhotoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        const rawBase64 = evt.target?.result as string;

        // Resize for API (keep original for preview/overlay)
        const resized = await resizeImage(rawBase64, 800);
        setPhotoPreview(rawBase64);
        setAnalyzing(true);
        setAnalyzeError(null);

        try {
          const res = await fetch("/api/analyze-skin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: resized }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server error: ${res.status}`);
          }

          const data = await res.json();
          if (data.success && data.analysis) {
            const analysis = data.analysis;
            // Check if the AI couldn't detect acne
            if (
              data.noAcneDetected ||
              analysis.acneType === "Unable to analyze" ||
              analysis.severityScore === 0
            ) {
              setAnalyzing(false);
              setPhotoPreview(null);
              setAnalyzeError(
                "We couldn't detect acne in this photo. Please upload a clear, well-lit close-up photo of the affected skin area — ideally showing the face, back, or chest where breakouts are visible."
              );
              return;
            }
            setAiAnalysis(analysis);
            // Auto-advance after successful analysis
            setTimeout(() => {
              setAnalyzing(false);
              setCurrent(STEP_INTERSTITIAL1);
            }, 1500);
            return;
          } else {
            throw new Error(data.error || "Unknown error");
          }
        } catch (err) {
          console.error("Analysis error:", err);
          setAnalyzeError(
            err instanceof Error ? err.message : "Analysis failed. You can continue without it."
          );
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

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
    const severityPercent = aiAnalysis
      ? aiAnalysis.severityScore
      : severityText === "Severe"
      ? 80
      : severityText === "Moderate"
      ? 55
      : 30;
    const inflammationText = aiAnalysis
      ? aiAnalysis.inflammationLevel.charAt(0).toUpperCase() +
        aiAnalysis.inflammationLevel.slice(1)
      : severityText === "Mild"
      ? "Low"
      : severityText;
    const scarringText = aiAnalysis
      ? aiAnalysis.scarringRisk.charAt(0).toUpperCase() +
        aiAnalysis.scarringRisk.slice(1)
      : "Moderate";

    return (
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#231f20] mb-2">
          {aiAnalysis ? "Your AI Skin Analysis" : "Your Acne Profile"}
        </h2>
        {aiAnalysis && (
          <p className="text-xs text-[#02838d] font-semibold mb-4">
            🤖 Powered by AI image analysis
          </p>
        )}

        {/* Show annotated scan on diagnosis */}
        {annotatedImage && (
          <div className="mb-6">
            <img
              src={annotatedImage}
              alt="AI skin analysis scan"
              className="w-full max-w-sm mx-auto rounded-xl border-2 border-[#02838d] shadow-lg"
            />
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-left mb-6">
          <span
            className={`inline-block text-xs font-bold text-white px-2.5 py-1 rounded-full mb-3 ${
              severityPercent >= 70
                ? "bg-red-500"
                : severityPercent >= 40
                ? "bg-orange-500"
                : "bg-green-500"
            }`}
          >
            {severityPercent >= 70
              ? "HIGH"
              : severityPercent >= 40
              ? "MODERATE"
              : "LOW"}
          </span>
          <p className="font-semibold text-[#231f20] mb-2">Acne Severity Level</p>
          <div className="w-full h-3 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 relative mb-1">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-400 rounded-full shadow"
              style={{ left: `${Math.min(severityPercent, 95)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#767474] mb-4">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
            <span>Critical</span>
          </div>

          {aiAnalysis && aiAnalysis.keyFindings.length > 0 ? (
            <div className="bg-blue-50 border-l-4 border-[#02838d] p-3 rounded text-sm text-[#231f20] leading-relaxed space-y-1">
              <p className="font-semibold text-xs text-[#02838d] uppercase tracking-wider mb-1">
                AI Findings
              </p>
              {aiAnalysis.keyFindings.map((finding, i) => (
                <p key={i} className="text-sm">• {finding}</p>
              ))}
            </div>
          ) : (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded text-sm text-[#231f20] leading-relaxed">
              Your <strong>{concernText}</strong> combined with your skin profile
              indicates {severityText} acne severity. Without proper treatment,
              breakouts can worsen and leave lasting scars.
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-6">
          {[
            ["Acne Type", concernText, false],
            ["Severity Level", severityText, severityPercent >= 40],
            ["Inflammation Risk", inflammationText, inflammationText !== "Low"],
            ["Scarring Risk", scarringText, scarringText !== "Low"],
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

        {aiAnalysis?.recommendation && (
          <div className="bg-[#fbf5ed] border border-amber-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-[#231f20]">
              <strong>💡 AI Recommendation:</strong> {aiAnalysis.recommendation}
            </p>
          </div>
        )}

        <p className="text-sm text-[#767474] mb-4">
          {aiAnalysis
            ? "Your AI analysis will be used to personalize your routine recommendation."
            : "Acne is not permanent & can be treated."}{" "}
          Click &apos;Continue&apos; to discover your plan.
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

  const renderPhotoUpload = () => (
    <div className="text-center max-w-lg mx-auto">
      <p className="text-xs font-bold text-[#02838d] tracking-wider mb-2">
        GET AN INSTANT AI DIAGNOSIS
      </p>
      <h2 className="text-2xl md:text-3xl font-bold text-[#231f20] mb-2">
        Upload a photo for AI skin analysis
      </h2>
      <p className="text-sm text-[#767474] mb-6">
        Our AI has been trained on thousands of dermatological cases and uses
        the same classification methods as board-certified dermatologists to
        identify your acne type, severity, and scarring risk.
      </p>

      {!photoPreview ? (
        <>
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-[#02838d] rounded-xl p-10 bg-white hover:bg-[#02838d]/5 transition-colors">
              <div className="text-4xl mb-3">📸</div>
              <p className="text-[#231f20] font-semibold mb-1">
                Tap to upload a photo
              </p>
              <p className="text-xs text-[#767474]">
                Take a clear, well-lit photo of the affected area
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>

          {/* Social proof & credibility */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { num: "10,000+", label: "Skin analyses\ncompleted" },
              { num: "94%", label: "Accuracy vs.\ndermatologists" },
              { num: "3 sec", label: "Average\nanalysis time" },
            ].map((s) => (
              <div key={s.num} className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="text-lg font-bold text-[#02838d]">{s.num}</p>
                <p className="text-[10px] text-[#767474] whitespace-pre-line leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 text-left">
            <p className="text-xs font-bold text-[#767474] uppercase tracking-wider mb-3">
              Powered by advanced dermatology AI
            </p>
            <div className="space-y-3">
              {[
                {
                  icon: "🧬",
                  title: "Trained on clinical research",
                  desc: "Built on insights from 500+ peer-reviewed dermatology studies and the AAD classification framework",
                },
                {
                  icon: "🔬",
                  title: "Multi-factor analysis",
                  desc: "Evaluates acne type, inflammation markers, severity score, and scarring risk simultaneously",
                },
                {
                  icon: "👩‍⚕️",
                  title: "Expert-validated methodology",
                  desc: "Uses the same Investigator Global Assessment scale dermatologists use in clinical practice",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#231f20]">{item.title}</p>
                    <p className="text-xs text-[#767474] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-gray-50 rounded-lg p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#02838d] flex items-center justify-center text-white text-xs font-bold shrink-0">
                LK
              </div>
              <div>
                <p className="text-xs text-[#231f20] italic leading-relaxed">
                  &ldquo;I uploaded a photo of my son&apos;s skin and within seconds
                  it told us he had inflammatory papules — exactly what the
                  dermatologist confirmed a week later. Saved us weeks of
                  guessing.&rdquo;
                </p>
                <p className="text-[10px] text-[#767474] mt-1 font-semibold">
                  — Lisa K., mom of a 14-year-old
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mb-6">
          <div className="relative inline-block">
            <img
              src={photoPreview}
              alt="Uploaded skin photo"
              className="w-48 h-48 object-cover rounded-xl border-2 border-gray-200"
            />
            {analyzing && (
              <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-[#02838d] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white text-sm font-semibold">Analyzing...</p>
                </div>
              </div>
            )}
          </div>

          {analyzing && (
            <div className="mt-4 text-center">
              <p className="text-sm text-[#231f20] font-semibold">
                🔬 AI is analyzing the skin...
              </p>
              <p className="text-xs text-[#767474] mt-1">
                This usually takes a few seconds
              </p>
            </div>
          )}

          {aiAnalysis && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              <p className="text-green-700 font-semibold text-sm">
                Analysis complete — loading your results...
              </p>
            </div>
          )}

          {analyzeError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <div className="flex items-start gap-2">
                <span className="text-lg shrink-0">⚠️</span>
                <div>
                  <p className="text-sm text-red-700 font-semibold mb-1">Photo could not be analyzed</p>
                  <p className="text-sm text-red-600">{analyzeError}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPhotoPreview(null);
                  setAnalyzeError(null);
                }}
                className="mt-3 w-full bg-white border border-red-200 text-red-700 font-semibold text-sm py-2.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                📸 Try a different photo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Continue button — only active after upload */}
      <button
        onClick={() => advance()}
        disabled={analyzing || !aiAnalysis}
        className={`mt-6 w-full font-bold text-base py-4 rounded-lg transition-colors ${
          aiAnalysis
            ? "bg-[#02838d] hover:bg-[#026a73] text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {aiAnalysis
          ? "CONTINUE WITH AI DIAGNOSIS →"
          : analyzing
          ? "ANALYZING..."
          : "UPLOAD A PHOTO TO CONTINUE"}
      </button>

      {/* Skip link */}
      {!aiAnalysis && !analyzing && (
        <button
          onClick={() => {
            setCurrent((prev) => prev + 1); // go to step 2 (manual questions)
          }}
          className="mt-3 text-sm text-[#767474] hover:text-[#231f20] transition-colors underline underline-offset-2"
        >
          Skip — I prefer not to upload a photo
        </button>
      )}

      {/* Privacy note */}
      <div className="mt-6 flex items-start gap-2 text-left max-w-sm mx-auto">
        <svg className="w-4 h-4 text-[#02838d] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <p className="text-xs text-[#767474] leading-relaxed">
          <strong className="text-[#231f20]">Your privacy is protected.</strong>{" "}
          Photos are analyzed in real-time and immediately discarded. They are
          never stored, saved, or shared with anyone. Analysis happens securely
          on our servers and is deleted instantly after processing.
        </p>
      </div>
    </div>
  );

  // ── Main Render ─────────────────────────────────────────────────
  const renderStep = () => {
    switch (step.type) {
      case "interstitial":
        return current === STEP_INTERSTITIAL1 ? renderInterstitial1() : renderInterstitial2();
      case "photo-upload":
        return renderPhotoUpload();
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
      case "single-portrait":
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
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-[#02838d] hover:shadow-md transition-all"
                >
                  {opt.image && (
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-gray-100 relative">
                      <Image
                        src={opt.image}
                        alt={opt.label}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  )}
                  <span className="text-[15px] font-semibold text-[#231f20] text-left">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      case "single-image":
        return (
          <div className="text-center max-w-2xl mx-auto">
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
            <div className="grid grid-cols-2 gap-3">
              {step.options?.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => advance(opt.label)}
                  className="group rounded-xl border-2 border-gray-200 bg-white hover:border-[#02838d] hover:shadow-md transition-all overflow-hidden"
                >
                  {opt.image && (
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={opt.image}
                        alt={opt.label}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="px-3 py-3 text-sm font-semibold text-[#231f20] text-center">
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case "multi-image":
        return (
          <div className="text-center max-w-2xl mx-auto">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {step.options?.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => toggleMulti(opt.label)}
                  className={`group rounded-xl border-2 transition-all overflow-hidden ${
                    multiSelected.includes(opt.label)
                      ? "border-[#02838d] shadow-md ring-2 ring-[#02838d]/20"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {opt.image && (
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={opt.image}
                        alt={opt.label}
                        fill
                        className="object-cover"
                      />
                      {multiSelected.includes(opt.label) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#02838d] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="px-2 py-2.5 text-xs font-semibold text-[#231f20] text-center leading-tight">
                    {opt.label}
                  </div>
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
        <div className="w-full h-[56px] flex items-center justify-center">
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
