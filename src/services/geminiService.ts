import { GoogleGenAI } from "@google/genai";

// Initialization with the platform-provided API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export type MockupCategory = 'wallpaper' | 'bag' | 'clothing' | 'curtains' | 'kitchen' | 'phone_case' | 'notebook' | 'living_room' | 'baby_clothes' | 'moodboard';

const prompts: Record<MockupCategory, string> = {
  wallpaper: "A high-quality interior photography of a modern, well-lit living room. The large main wall is covered in a wallpaper featuring the exact pattern from the attached tile image. The pattern repeats seamlessly and naturally across the wall surface. 8k resolution, cinematic lighting, photorealistic.",
  bag: "A professional studio product shot of a premium quality tote bag. The bag's fabric is printed with the pattern from the attached tile image. The pattern follows the contours and folds of the bag naturally. Soft studio lighting, minimalist clean background, photorealistic.",
  clothing: "A fashion photography of a person wearing a stylish A-line dress. The entire dress is made of a fabric that uses the attached pattern tile. The pattern flows naturally with the drapes and movement of the fabric. High-end fashion aesthetic, photorealistic.",
  curtains: "A close-up architectural shot of large floor-to-ceiling windows with elegant curtains. The curtains are made of fabric featuring the attached pattern tile. The pattern is visible in the folds and gathers of the fabric. Soft natural light coming through the window, photorealistic.",
  kitchen: "A lifestyle interior shot of a bright, modern kitchen. The kitchen backsplash and some textile accessories like tea towels feature the pattern from the attached tile image. The pattern looks like high-quality tiles or printed fabric. Natural kitchen lighting, realistic textures.",
  phone_case: "A premium product mockup of a sleek smartphone with a protective case. The back of the phone case is printed with the pattern from the attached tile image. The pattern is sharp, high-resolution, and wraps around the edges of the case. Studio lighting, elegant presentation.",
  notebook: "A close-up shot of a high-end hardcover notebook and a matching book cover lying on a wooden desk. Both covers are printed with the pattern from the attached tile image. The texture of the paper or fabric cover is visible through the pattern. Cozy aesthetic lighting, shallow depth of field.",
  living_room: "A wide-angle lens photography of a cozy, stylish living room. Various textile elements like throw pillows on the sofa and a soft area rug feature the pattern from the attached tile image. The pattern scale is appropriate for the items. Warm home lighting, photorealistic.",
  baby_clothes: "A charming flat-lay or lifestyle photography of organic cotton baby onesies and blankets. The fabric is printed with the attached pattern tile. The pattern is soft and appropriately scaled for small infant clothing. Bright, clean, and gentle aesthetic.",
  moodboard: "A professional lifestyle moodboard layout. In the center is the attached pattern tile. Surrounding it are complementary lifestyle items: high-end textures of silk or linen, a color palette swatches derived from the pattern, matching interior decor elements (like a vase or candle), and a few natural elements like a flower or leaf that match the vibe. Highly aesthetic, editorial design."
};

export async function generateMockup(patternBase64: string, mimeType: string, category: MockupCategory, scale: number = 1.0) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to the Secrets panel.");
  }

  const scaleText = scale < 0.8 ? "with a very fine, small-scale intricate motif" : 
                    scale > 1.5 ? "with a bold, large-scale oversized motif" : 
                    "with a naturally scaled motif";

  const customPrompt = `${prompts[category]} Ensure the pattern is applied ${scaleText}.`;

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
