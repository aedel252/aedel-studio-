import { GoogleGenAI } from "@google/genai";

// Initialization with the platform-provided API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export type MockupCategory = 'wallpaper' | 'bag' | 'clothing' | 'curtains' | 'kitchen' | 'phone_case' | 'notebook';

const prompts: Record<MockupCategory, string> = {
  wallpaper: "A high-quality interior photography of a modern, well-lit living room. The large main wall is covered in a wallpaper featuring the exact pattern from the attached tile image. The pattern repeats seamlessly and naturally across the wall surface. 8k resolution, cinematic lighting, photorealistic.",
  bag: "A professional studio product shot of a premium quality tote bag. The bag's fabric is printed with the pattern from the attached tile image. The pattern follows the contours and folds of the bag naturally. Soft studio lighting, minimalist clean background, photorealistic.",
  clothing: "A fashion photography of a person wearing a stylish A-line dress. The entire dress is made of a fabric that uses the attached pattern tile. The pattern flows naturally with the drapes and movement of the fabric. High-end fashion aesthetic, photorealistic.",
  curtains: "A close-up architectural shot of large floor-to-ceiling windows with elegant curtains. The curtains are made of fabric featuring the attached pattern tile. The pattern is visible in the folds and gathers of the fabric. Soft natural light coming through the window, photorealistic.",
  kitchen: "A lifestyle interior shot of a bright, modern kitchen. The kitchen backsplash and some textile accessories like tea towels feature the pattern from the attached tile image. The pattern looks like high-quality tiles or printed fabric. Natural kitchen lighting, realistic textures.",
  phone_case: "A premium product mockup of a sleek smartphone with a protective case. The back of the phone case is printed with the pattern from the attached tile image. The pattern is sharp, high-resolution, and wraps around the edges of the case. Studio lighting, elegant presentation.",
  notebook: "A close-up shot of a high-end hardcover notebook and a matching book cover lying on a wooden desk. Both covers are printed with the pattern from the attached tile image. The texture of the paper or fabric cover is visible through the pattern. Cozy aesthetic lighting, shallow depth of field."
};

export async function generateMockup(patternBase64: string, mimeType: string, category: MockupCategory) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to the Secrets panel.");
  }

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
            text: prompts[category],
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
