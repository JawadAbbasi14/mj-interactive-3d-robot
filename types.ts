
import { Chat } from "@google/genai";

export interface SceneResponse {
  scene: string;
  choices: string[];
}

export interface GameState {
  currentSceneText: string | null;
  currentImagePrompt: string | null;
  currentImageUrl: string | null;
  choices: string[];
  isLoadingScene: boolean;
  isLoadingImage: boolean;
  isLoadingImagePrompt: boolean;
  error: string | null;
  gameStarted: boolean;
  chatSession: Chat | null;
}
    