const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

export async function generateQuestion(word, difficulty = 'intermediate', category = 'IELTS') {
  try {
    const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!key) return { success: false, error: 'Gemini API key not set' };

    const url = `${GEMINI_BASE}?key=${key}`;

    const prompt = `For the word "${word}", create a ${difficulty} ${category} vocabulary question with 4 options.
Return ONLY this JSON (fill in the values, keep the structure exactly):
{"word":"${word}","question":"What does ${word.toUpperCase()} mean?","options":["<correct definition>","<wrong 1>","<wrong 2>","<wrong 3>"],"correctIndex":0,"difficulty":"${difficulty}","category":"${category}","xpReward":20}
Do not write anything before or after the JSON.`;

    const response = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: 'You are a JSON-only API. Every response is a single valid JSON object. No prose, no markdown, no explanation. Output starts with { and ends with }.' }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature:     0.4,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err?.error?.message || `HTTP ${response.status}`;
      console.log('Gemini API error:', msg);
      return { success: false, error: `API error: ${msg}` };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.log('Gemini: empty response', JSON.stringify(data));
      return { success: false, error: 'No response from AI' };
    }

    console.log('Gemini raw response:', text);

    // Strip any accidental markdown fences (belt-and-suspenders)
    const cleaned = text
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .trim();

    // Extract the first JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('Gemini: no JSON found in:', cleaned);
      return { success: false, error: 'Could not parse AI response' };
    }

    let question;
    try {
      question = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.log('JSON parse error:', e.message, '\nRaw:', jsonMatch[0]);
      return { success: false, error: 'Could not parse AI response' };
    }

    // Validate
    if (
      !question.word ||
      !question.question ||
      !Array.isArray(question.options) ||
      question.options.length !== 4 ||
      typeof question.correctIndex !== 'number' ||
      question.correctIndex < 0 ||
      question.correctIndex > 3
    ) {
      console.log('Gemini: invalid structure:', JSON.stringify(question));
      return { success: false, error: 'Invalid question format from AI' };
    }

    // Ensure word is stored as entered (lowercase)
    question.word = word.trim().toLowerCase();

    return { success: true, question };

  } catch (error) {
    console.log('generateQuestion error:', error.message);
    return { success: false, error: error.message };
  }
}