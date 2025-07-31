export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
export const IMAGEN_MODEL = 'imagen-3.0-generate-002';

export const SYSTEM_INSTRUCTION_ADVENTURE = `You are Jawad's Storytelling Engine, creating a dynamic text adventure. The player will make choices, and you will describe the outcome and the new situation, offering new choices. Always respond ONLY with a JSON object in the format: {"scene": "<description>", "choices": ["<choice1>", "<choice2>", "<choice3>"]}. Do not include any other text, explanations, or markdown formatting around the JSON. Ensure the scene is intriguing, choices are distinct and meaningful, and descriptions are vivid but concise (around 100-150 words).`;

export const INITIAL_ADVENTURE_PROMPT = `Begin a new fantasy adventure for Jawad's game. Provide the first scene and 3 choices.`;

export const PROGRESS_ADVENTURE_PROMPT_PREFIX = `The player chose:`;
// Example full prompt for progress: `${PROGRESS_ADVENTURE_PROMPT_PREFIX} "${playerChoice}". Based on this choice, describe what happens next, the new scene, and provide 3 new distinct choices.`
// The service will construct the full prompt using this prefix and the actual player choice.

export const IMAGE_PROMPT_GENERATION_PROMPT_TEMPLATE = (sceneDescription: string): string =>
  `Analyze the following text adventure scene. Generate a concise, visually descriptive prompt (max 20 words, style: 'dramatic fantasy art') suitable for Jawad's Vision Generator to create an image. Focus on key characters, objects, environment, and mood. Scene:\n${sceneDescription}\n\nGenerated Image Prompt:`;