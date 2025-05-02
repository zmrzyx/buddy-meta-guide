
interface GeminiMessage {
  role: "user" | "model" | "system";
  content: string;
}

interface GeminiResponse {
  text: string;
  error?: string;
}

export async function generateGeminiResponse(
  apiKey: string, 
  messages: GeminiMessage[],
  model: string = "gemini-pro"
): Promise<GeminiResponse> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate response');
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { text: "Sorry, I couldn't generate a response. Please try again.", error: "No content in response" };
    }
    
    return { text: data.candidates[0].content.parts[0].text };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { 
      text: "I encountered an error while trying to respond. Please check your API key or try again later.",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
