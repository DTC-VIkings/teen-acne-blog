import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface GeminiAnalysis {
  acneType: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  severityScore: number; // 1-100
  affectedAreas: string[];
  inflammationLevel: "low" | "moderate" | "high";
  scarringRisk: "low" | "moderate" | "high";
  keyFindings: string[];
  recommendation: string;
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Strip data URL prefix to get raw base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = image.match(/^data:(image\/\w+);/)?.[1] || "image/jpeg";

    const prompt = `You are a dermatology AI assistant for a teen acne education website. Analyze this photo of skin and provide a detailed assessment.

IMPORTANT: This is for educational purposes only, not medical diagnosis. Be helpful but include a disclaimer.

Analyze the image and respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "acneType": "primary type of acne visible (e.g., 'Comedonal (blackheads & whiteheads)', 'Inflammatory (papules & pustules)', 'Cystic / Nodular', 'Hormonal pattern', 'Mixed comedonal & inflammatory', 'Mild comedonal')",
  "severity": "mild or moderate or severe or critical",
  "severityScore": 45,
  "affectedAreas": ["list", "of", "visible", "affected", "areas"],
  "inflammationLevel": "low or moderate or high",
  "scarringRisk": "low or moderate or high",
  "keyFindings": [
    "Finding 1: describe what you see",
    "Finding 2: describe another observation",
    "Finding 3: one more observation"
  ],
  "recommendation": "A 1-2 sentence personalized recommendation focusing on the type of routine that would help, emphasizing gentle, natural approaches first."
}

If the image does not show skin or acne, return:
{
  "acneType": "Unable to analyze",
  "severity": "mild",
  "severityScore": 0,
  "affectedAreas": [],
  "inflammationLevel": "low",
  "scarringRisk": "low",
  "keyFindings": ["Could not identify skin or acne in this image. Please upload a clear, well-lit photo of the affected skin area."],
  "recommendation": "Please try uploading a clearer photo of the affected skin area for analysis."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: "AI analysis failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response (handle potential markdown fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    const analysis: GeminiAnalysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      analysis,
      disclaimer:
        "This AI analysis is for educational purposes only and is not a substitute for professional medical advice. Please consult a dermatologist for an accurate diagnosis.",
    });
  } catch (error) {
    console.error("Analyze skin error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
