
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai"; // Ensure Chat is imported if used directly here, or from types
import { GameState, SceneResponse } from './types';
import { startAdventure, progressAdventure, generateImagePromptForScene, generateImageWithImagen } from './services/geminiService';
import SceneDisplay from './components/SceneDisplay';
import ChoiceButton from './components/ChoiceButton';
import LoadingSpinner from './components/LoadingSpinner';

// Check for API Key early. App will not function without it.
// The geminiService also checks, this is an additional safeguard or UI hint.
const apiKeyAvailable = !!process.env.API_KEY;


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentSceneText: null,
    currentImagePrompt: null,
    currentImageUrl: null,
    choices: [],
    isLoadingScene: false,
    isLoadingImage: false,
    isLoadingImagePrompt: false,
    error: null,
    gameStarted: false,
    chatSession: null,
  });

  const handleError = (message: string) => {
    setGameState(prev => ({ ...prev, error: message, isLoadingScene: false, isLoadingImage: false, isLoadingImagePrompt: false }));
  };

  const handleStartGame = useCallback(async () => {
    if (!apiKeyAvailable) {
      handleError("API Key is not configured. Please ensure the API_KEY environment variable is set to enable Jawad's game engine.");
      return;
    }
    setGameState(prev => ({
      ...prev,
      isLoadingScene: true,
      isLoadingImage: true, // Will also set isLoadingImagePrompt true later
      isLoadingImagePrompt: true,
      gameStarted: true,
      error: null,
      currentSceneText: null, // Clear previous game data
      currentImageUrl: null,
      currentImagePrompt: null,
      choices: [],
    }));

    const adventureData = await startAdventure();
    if (!adventureData) {
      handleError("Failed to start the adventure. The mists of creation are unclear.");
      return;
    }

    const { chat, initialScene } = adventureData;
    setGameState(prev => ({
      ...prev,
      chatSession: chat,
      currentSceneText: initialScene.scene,
      choices: initialScene.choices,
      isLoadingScene: false,
    }));

    // Generate image for the initial scene
    if (initialScene.scene) {
      const imagePrompt = await generateImagePromptForScene(initialScene.scene);
      setGameState(prev => ({ ...prev, currentImagePrompt: imagePrompt, isLoadingImagePrompt: false }));
      if (imagePrompt) {
        const imageUrl = await generateImageWithImagen(imagePrompt);
        setGameState(prev => ({ ...prev, currentImageUrl: imageUrl, isLoadingImage: false }));
      } else {
        setGameState(prev => ({ ...prev, isLoadingImage: false, currentImagePrompt: "Could not generate image prompt." }));
      }
    } else {
       setGameState(prev => ({ ...prev, isLoadingImage: false, isLoadingImagePrompt: false }));
    }
  }, []);

  const handleChoice = useCallback(async (choice: string) => {
    if (!gameState.chatSession) {
      handleError("Game session lost. Please restart.");
      return;
    }

    setGameState(prev => ({
      ...prev,
      isLoadingScene: true,
      isLoadingImage: true,
      isLoadingImagePrompt: true,
      error: null,
      currentImageUrl: null, // Clear previous image while new one loads
      currentImagePrompt: null,
    }));

    const nextSceneData = await progressAdventure(gameState.chatSession, choice);
    if (!nextSceneData) {
      handleError("The path ahead is clouded. Failed to get next scene.");
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentSceneText: nextSceneData.scene,
      choices: nextSceneData.choices,
      isLoadingScene: false,
    }));
    
    // Generate image for the new scene
    if (nextSceneData.scene) {
      const imagePrompt = await generateImagePromptForScene(nextSceneData.scene);
      setGameState(prev => ({ ...prev, currentImagePrompt: imagePrompt, isLoadingImagePrompt: false }));

      if (imagePrompt) {
        const imageUrl = await generateImageWithImagen(imagePrompt);
        setGameState(prev => ({ ...prev, currentImageUrl: imageUrl, isLoadingImage: false }));
      } else {
        setGameState(prev => ({ ...prev, isLoadingImage: false, currentImagePrompt: "Could not generate image prompt." }));
      }
    } else {
       setGameState(prev => ({ ...prev, isLoadingImage: false, isLoadingImagePrompt: false }));
    }

  }, [gameState.chatSession]);

  const handleRestartGame = () => {
    setGameState({
      currentSceneText: null,
      currentImagePrompt: null,
      currentImageUrl: null,
      choices: [],
      isLoadingScene: false,
      isLoadingImage: false,
      isLoadingImagePrompt: false,
      error: null,
      gameStarted: false,
      chatSession: null,
    });
  };

  if (!apiKeyAvailable && !gameState.error && !gameState.gameStarted) {
     // Display API key error message only if game hasn't started and no other error is present.
     handleError("API Key is not configured. This application, developed by Jawad, requires an API_KEY environment variable to function.");
  }


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 flex flex-col items-center justify-center selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Jawad Text Adventure
          </h1>
          <p className="text-gray-400 mt-2">An interactive story by Jawad. Your choices shape the world.</p>
        </header>

        {gameState.error && (
          <div className="bg-red-700 border border-red-900 text-white p-4 rounded-lg mb-6 shadow-lg">
            <h3 className="font-semibold text-lg">An ill omen!</h3>
            <p>{gameState.error}</p>
          </div>
        )}

        {!gameState.gameStarted ? (
          <div className="text-center bg-gray-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">Ready for an adventure by Jawad?</h2>
            <p className="text-gray-400 mb-6">A unique story by Jawad awaits. Each choice carves a new path.</p>
            <button
              onClick={handleStartGame}
              disabled={!apiKeyAvailable || gameState.isLoadingScene}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gameState.isLoadingScene ? <LoadingSpinner size="w-6 h-6" color="border-white" className="inline-block mr-2" /> : null}
              {gameState.isLoadingScene ? 'Embarking...' : 'Begin Your Journey'}
            </button>
            {!apiKeyAvailable && <p className="text-red-400 text-sm mt-4">API Key not detected. Please configure it to play Jawad's game.</p>}
          </div>
        ) : (
          <main className="space-y-8">
            <SceneDisplay
              imageUrl={gameState.currentImageUrl}
              imagePrompt={gameState.currentImagePrompt}
              sceneText={gameState.currentSceneText}
              isLoadingImage={gameState.isLoadingImage}
              isLoadingScene={gameState.isLoadingScene}
              isLoadingImagePrompt={gameState.isLoadingImagePrompt}
            />

            {(gameState.isLoadingScene || gameState.isLoadingImage || gameState.isLoadingImagePrompt) && !gameState.choices.length && (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="w-16 h-16" />
              </div>
            )}
            
            {!gameState.isLoadingScene && gameState.choices.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">What will you do?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.choices.map((choice, index) => (
                    <ChoiceButton
                      key={index}
                      text={choice}
                      onClick={() => handleChoice(choice)}
                      disabled={gameState.isLoadingScene || gameState.isLoadingImage || gameState.isLoadingImagePrompt}
                    />
                  ))}
                </div>
              </div>
            )}
             <div className="mt-8 text-center">
                <button
                    onClick={handleRestartGame}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg shadow-sm transition-colors duration-150"
                >
                    Restart Adventure
                </button>
            </div>
          </main>
        )}
        <footer className="text-center mt-12 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Jawad. Adventure awaits.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;