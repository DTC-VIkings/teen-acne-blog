import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

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
    const base64Data = image.replace(/^data:image\/[^;]+;base64,/, "");
    const mimeMatch = image.match(/^data:(image\/[^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const prompt = `You are a dermatology AI assistant. Analyze this photo of skin and provide a JSON assessment.

This is for educational purposes only, not medical diagnosis.

Return a JSON object with these exact fields:
- acneType: string (e.g. "Inflammatory (papules & pustules)", "Mixed comedonal & inflammatory", "Cystic / Nodular")
- severity: string ("mild", "moderate", "severe", or "critical")
- severityScore: number (1-100)
- affectedAreas: array of strings (e.g. ["cheeks", "jawline", "forehead"])
- inflammationLevel: string ("low", "moderate", or "high")
- scarringRisk: string ("low", "moderate", or "high")
- keyFindings: array of 3 strings describing what you observe
- recommendation: string (1-2 sentences recommending gentle, natural approaches)

If the image doesn't show skin, set acneType to "Unable to analyze" and severityScore to 0.`;

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
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json(
        { error: `AI analysis failed (${response.status})` },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Gemini 2.5 Flash may return multiple parts (thinking + response)
    // Find the part that contains JSON text
    const candidates = data?.candidates || [];
    let text = "";

    for (const candidate of candidates) {
      const parts = candidate?.content?.parts || [];
      for (const part of parts) {
        if (part.text) {
          // Check if this part contains JSON (skip thinking parts)
          const trimmed = part.text.trim();
          if (trimmed.startsWith("{") || trimmed.startsWith("```")) {
            text = trimmed;
            break;
          }
          // If we haven't found JSON yet, keep this as fallback
          if (!text) text = trimmed;
        }
      }
      if (text) break;
    }

    if (!text) {
      console.error("No text in Gemini response:", JSON.stringify(data).slice(0, 500));
      return NextResponse.json(
        { error: "AI returned empty response" },
        { status: 500 }
      );
    }

    // Extract JSON - handle markdown fences, raw JSON, etc.
    let jsonStr = text;

    // Remove markdown code fences if present
    jsonStr = jsonStr.replace(/^```json?\s*/i, "").replace(/\s*```\s*$/, "");

    // Find the JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text.slice(0, 300));
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate required fields exist
    if (!analysis.acneType || analysis.severityScore === undefined) {
      console.error("Missing fields in analysis:", analysis);
      return NextResponse.json(
        { error: "Incomplete AI analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: {
        acneType: analysis.acneType || "Unknown",
        severity: analysis.severity || "moderate",
        severityScore: Number(analysis.severityScore) || 50,
        affectedAreas: analysis.affectedAreas || [],
        inflammationLevel: analysis.inflammationLevel || "moderate",
        scarringRisk: analysis.scarringRisk || "moderate",
        keyFindings: analysis.keyFindings || [],
        recommendation: analysis.recommendation || "",
      },
      disclaimer:
        "This AI analysis is for educational purposes only and is not a substitute for professional medical advice.",
    });
  } catch (error) {
    console.error("Analyze skin error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during analysis" },
      { status: 500 }
    );
  }
}
