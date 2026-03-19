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

    const prompt = `You are a dermatology AI assistant. Analyze this photo and provide a JSON assessment.

IMPORTANT RULES:
1. If the photo does NOT clearly show skin with acne (e.g. it's a selfie without acne, a product photo, a pet, food, a random object, or anything that is NOT a close-up of acne-affected skin), you MUST return:
{"acneType":"Unable to analyze","severity":"none","severityScore":0,"affectedAreas":[],"inflammationLevel":"none","scarringRisk":"none","keyFindings":["No acne detected in this image"],"recommendation":"Please upload a clear photo showing the affected skin area.","noAcneDetected":true}

2. If the photo DOES show skin with acne, return a JSON object with these fields:
- acneType: string (e.g. "Inflammatory (papules & pustules)", "Mixed comedonal & inflammatory", "Cystic / Nodular", "Comedonal (blackheads & whiteheads)")
- severity: string ("mild", "moderate", "severe", or "critical")
- severityScore: number (1-100)
- affectedAreas: array of strings (e.g. ["cheeks", "jawline", "forehead"])
- inflammationLevel: string ("low", "moderate", or "high")
- scarringRisk: string ("low", "moderate", or "high")
- keyFindings: array of exactly 3 strings describing specific observations
- recommendation: string (1-2 sentences recommending gentle, natural approaches first)
- noAcneDetected: false

Return ONLY the JSON object, no other text.`;

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

    // Gemini 2.5 Flash returns multiple parts (thinking + response)
    // We need to find the JSON part
    const candidates = data?.candidates || [];
    let text = "";

    for (const candidate of candidates) {
      const parts = candidate?.content?.parts || [];
      // Iterate in reverse — the last part is usually the actual response
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        if (part.text) {
          const trimmed = part.text.trim();
          // Check if this part looks like JSON
          if (trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.startsWith("```")) {
            text = trimmed;
            break;
          }
        }
      }
      if (text) break;
    }

    // Fallback: grab ANY text from parts
    if (!text) {
      for (const candidate of candidates) {
        const parts = candidate?.content?.parts || [];
        for (const part of parts) {
          if (part.text && part.text.trim()) {
            text = part.text.trim();
          }
        }
      }
    }

    if (!text) {
      console.error("No text in Gemini response:", JSON.stringify(data).slice(0, 500));
      return NextResponse.json(
        { error: "AI returned empty response" },
        { status: 500 }
      );
    }

    // Extract JSON from the response
    let jsonStr = text;

    // Remove markdown code fences if present
    jsonStr = jsonStr.replace(/^```json?\s*/i, "").replace(/\s*```\s*$/, "");

    // Find the JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text.slice(0, 500));
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Raw:", jsonMatch[0].slice(0, 300));
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    // Check for non-acne photos
    if (
      analysis.noAcneDetected === true ||
      analysis.acneType === "Unable to analyze" ||
      analysis.severityScore === 0
    ) {
      return NextResponse.json({
        success: true,
        noAcneDetected: true,
        analysis: {
          acneType: "Unable to analyze",
          severity: "none",
          severityScore: 0,
          affectedAreas: [],
          inflammationLevel: "none",
          scarringRisk: "none",
          keyFindings: ["No acne detected in this image"],
          recommendation: "Please upload a clear photo showing the affected skin area.",
        },
      });
    }

    return NextResponse.json({
      success: true,
      noAcneDetected: false,
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
