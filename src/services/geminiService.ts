import { GoogleGenAI } from "@google/genai";

// Initialization with the platform-provided API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export type MockupCategory = 'wallpaper' | 'bag' | 'clothing' | 'curtains' | 'kitchen' | 'phone_case' | 'notebook' | 'living_room' | 'baby_clothes' | 'moodboard';

const prompts: Record<MockupCategory, string> = {
  wallpaper: "A high-quality interior photography of a modern, well-lit living room. The large main wall is covered in a wallpaper featuring the exact pattern from the attached tile image. The pattern must repeat perfectly and seamlessly across the entire wall surface without any overlapping or gaps. 8k resolution, cinematic lighting, photorealistic.",
  bag: "A professional studio product shot of a premium quality tote bag. The bag's fabric is printed with the pattern from the attached tile image. The pattern must tile seamlessly across the bag's surface, following the contours naturally without any messy overlapping or distortions. Soft studio lighting, photorealistic.",
  clothing: "A fashion photography of a person wearing a stylish A-line dress. The fabric is printed with the attached pattern tile. The pattern must tile perfectly and seamlessly across the garment, following the drapes naturally without any overlapping layers or artifacts. High-end fashion aesthetic.",
  curtains: "A close-up architectural shot of large floor-to-ceiling windows with elegant curtains. The curtains feature the attached pattern tile. The pattern must repeat seamlessly along the fabric folds without any overlapping or visible seams. Soft natural light, photorealistic.",
  kitchen: "A lifestyle interior shot of a bright, modern kitchen. The kitchen accessories feature the pattern from the attached tile image. The pattern must be applied as a clean, non-overlapping, perfectly repeating tile on the surfaces. Natural kitchen lighting, realistic textures.",
  phone_case: "A premium product mockup of a sleek smartphone with a protective case. The back is printed with the pattern from the attached tile image. The pattern must be a clean seamless tile that wraps around edges without any overlapping or messy textures. Studio lighting, elegant.",
  notebook: "A close-up shot of a high-end hardcover notebook. The cover is printed with the pattern from the attached tile image. The pattern must repeat seamlessly and perfectly across the cover without any overlapping or gaps. Cozy aesthetic lighting.",
  living_room: "A wide-angle lens photography of a cozy, stylish living room. Pillows and rugs feature the pattern from the attached tile image. The pattern must be applied as a clean seamless repeat without any overlapping or artifacts. Warm home lighting.",
  baby_clothes: "A charming flat-lay of organic cotton baby clothes. The fabric is printed with the attached pattern tile. The pattern must be a perfectly repeating seamless tile without any overlapping or scale distortions. Bright and gentle aesthetic.",
  moodboard: "A professional lifestyle moodboard. The pattern from the attached tile image is shown as a perfectly repeating, seamless swatch in the center. Ensure there is no overlapping within the pattern grid. Highly aesthetic, editorial design."
};

export async function generateMockup(patternBase64: string, mimeType: string, category: MockupCategory, scale: number = 1.0) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to the Secrets panel.");
  }

  const scaleText = scale < 0.8 ? "fine, small-scale intricate motif" : 
                    scale > 1.5 ? "bold, large-scale oversized motif" : 
                    "natural standard-scale motif";

  const customPrompt = `${prompts[category]} CRITICAL: The pattern must be applied as a perfectly seamless tile without any overlapping, gaps, or offset errors. Ensure the ${scaleText} is maintained correctly across the surface.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: patternBase64,
              mimeType: mimeType,
            },
          },
          {
            text: customPrompt,
          },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response parts received from the model.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("The model did not generate an image part.");
  } catch (error) {
    console.error("Mockup generation failed:", error);
    throw error;
  }
}

export async function generateAIData(patternBase64: string, mimeType: string, type: 'pinterest' | 'instagram') {
  if (!process.env.GEMINI_API_KEY) return null;

  const prompt = type === 'pinterest' 
    ? "이 패턴을 분석하여 다음을 제공하세요: 1. 시선을 끄는 핀 제목. 2. 상세한 핀 설명 (최대 500자). 3. 테마 분류 (예: 보태니컬, 빈티지, 모던). 반드시 한국어로 작성하고 JSON 형식으로 반환하세요: { title, description, theme }"
    : "이 패턴을 분석하여 다음을 제공하세요: 1. 스토리텔링 요소가 포함된 매력적인 인스타그램 캡션. 2. 관련 해시태그 10개 (# 심볼을 반드시 포함). 반드시 한국어로 작성하고 JSON 형식으로 반환하세요: { caption, hashtags }";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: patternBase64, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Data generation failed:", error);
    return null;
  }
}
