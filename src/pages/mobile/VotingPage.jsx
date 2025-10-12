import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Question from '../../components/mobile/Queston';
import VotingOption from '../../components/mobile/VotingOption';
import useGameStoreMobile from '../../store/index_mobile';
import LoadingOverlay from '../../components/shared/LoadingOverlay';

const VotingPage = () => {
  const { gameId: gameIdParam } = useParams();
  const navigate = useNavigate();
  
  // Store state
  const gameState = useGameStoreMobile(s => s.gameMeta.state);
  const gameMetaId = useGameStoreMobile(s => s.gameMeta.id);
  const turn = useGameStoreMobile(s => s.turn);
  const isGameArchived = useGameStoreMobile(s => s.gameMeta.state === 'archived');
  const isGameFinished = useGameStoreMobile(s => s.gameMeta.state === 'finished');
  const startPollingForVote = useGameStoreMobile(s => s.startPollingForVote);
  const stopPolling = useGameStoreMobile(s => s.stopPolling);
  
  // Local state
  const [selectedId, setSelectedId] = useState(null);
  const [submitOk, setSubmitOk] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  
  // Used to track current turn_index and detect changes
  const currentTurnIndexRef = useRef(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const hasInitialized = useRef(false);

  useEffect(() => {
    const loadPage = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);
        setHasSubmitted(false);
        setSelectedId(null);
        setSubmitOk(false);

        const {
          fetchGameDetail,
          fetchCurrentTurn,
          gameMeta: { id },
        } = useGameStoreMobile.getState();

        // Get game ID
        const paramId = Number(gameIdParam);
        const gameId = Number.isFinite(paramId) ? paramId : id;
        if (Number.isFinite(paramId) && id !== paramId) {
          useGameStoreMobile.getState().setGameMeta({ id: paramId });
        }
        // Get token
        const token = localStorage.getItem('authToken');


        // Get game details and current turn
        console.info('[VotingPage] Getting game data...');
        const [game, currentTurn] = await Promise.all([
          fetchGameDetail(gameId),
          fetchCurrentTurn(gameId, token)
        ]);

        if (!game) {
          throw new Error('Failed to get game details');
        }

        // Record current turn_index
        if (currentTurn && typeof currentTurn.index === 'number') {
          currentTurnIndexRef.current = currentTurn.index;
          console.info('[VotingPage] Current turn:', currentTurn.index);
        } else {
          console.warn('[VotingPage] Turn data invalid');
        }


        console.info('[VotingPage] Page loading complete');
        setIsInitializing(false);
      } catch (error) {
        console.error('[VotingPage] Page loading failed:', error);
        setInitError(error.message);
        setIsInitializing(false);
      }
    };
    
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadPage();
    }
  }, [gameIdParam]);
  
  // 2. Start polling (only after user submits choice)
  useEffect(() => {
    if (!isInitializing && !initError && hasSubmitted) {
      console.info('[VotingPage] Starting polling mechanism...');
      startPollingForVote();
      return () => {
        console.info('[VotingPage] Stopping polling mechanism...');
        stopPolling();
      };
    }
  }, [isInitializing, initError, hasSubmitted, startPollingForVote, stopPolling]);

  // 3. Detect turn_index changes, reset component state to enter new turn
  useEffect(() => {
    const currentTurnIndex = turn?.index;
    
    // If turn_index is valid and different from previously recorded
    if (typeof currentTurnIndex === 'number' && 
        currentTurnIndexRef.current !== null && 
        currentTurnIndex !== currentTurnIndexRef.current) {
      
      console.info('[VotingPage] Detected turn_index change:', 
        currentTurnIndexRef.current, '→', currentTurnIndex);
      
      // If user has already submitted choice, reset component state to enter new turn
      if (hasSubmitted) {
        console.info('[VotingPage] User has submitted, resetting component state to enter new turn...');
        
        // Reset local state
        setHasSubmitted(false);
        setSelectedId(null);
        setSubmitOk(false);
        
        // Stop polling (will restart after user next submission)
        stopPolling();
      }
      
      // Update recorded turn_index
      currentTurnIndexRef.current = currentTurnIndex;
    }
  }, [turn?.index, hasSubmitted, stopPolling]);

  // 5. User selection and submission logic
  const submitChoice = async (chosen) => {
    setSelectedId(chosen);
    try {
      const authToken = localStorage.getItem('authToken');
      const { submitPlayerChoice } = useGameStoreMobile.getState();
      const success = await submitPlayerChoice(chosen, authToken);
      if (success) {
        setHasSubmitted(true);
        setSubmitOk(true);
        setTimeout(() => setSubmitOk(false), 1500);
      } else {
        console.error('[VotingPage]Option submission failed');
        setSelectedId(null); // Reset selection
      }
    } catch (error) {
      console.error('[VotingPage]Submission process error:', error);
      setSelectedId(null); // Reset selection
    }
  };

  // 6. Get display data
  const question = turn?.questionText || 'Memories is:';
  const votingOptions = turn?.options || [
    { id: 1, text: 'a right', display_number: 1 },
    { id: 2, text: 'a resource', display_number: 2 },
    { id: 3, text: 'a responsibility', display_number: 3 },
    { id: 4, text: 'a trade', display_number: 4 }
  ];

  // 7. Listen for game state changes: stop polling and redirect when finished or archived
  useEffect(() => {
    if (isGameFinished || isGameArchived) {
      console.info('[VotingPage] 🏁 Game ended, stopping polling and redirecting to summary page');
      stopPolling(); // Stop polling
      const currentGameId = gameMetaId || gameIdParam || 'demo-game';
      navigate(`/game/${currentGameId}/summary`);
    }
  }, [isGameFinished, isGameArchived, gameMetaId, gameIdParam, navigate, stopPolling]);


  // 8. Render logic
  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading game...</div>
      </div>
    );
  }

  // Error state
  if (initError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Loading failed</div>
          <div className="text-red-200 text-sm mb-4">{initError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  // Game archived state
  if (isGameArchived) {
    const goToPersonalSummary = () => {
      const currentGameId = gameMetaId || gameIdParam || 'demo-game';
      navigate(`/game/${currentGameId}/timeline`);
    };

    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-cyan-400 text-2xl mb-6">Game Over</div>
          <button
            onClick={goToPersonalSummary}
            className="px-6 py-3 bg-cyan-400 text-black rounded-lg text-lg font-semibold hover:bg-cyan-300 transition-colors duration-200"
          >
            View Personal Summary
          </button>
        </div>
      </div>
    );
  }

  // 8. Main render - voting interface
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-8 relative">
      {/* Game status display */}
      {(gameMetaId != null) && (
        <div className="text-center mb-4">
          <div className="text-cyan-400 text-sm">
            Game {gameMetaId} Status: {gameState} Turn: {(turn.index)}
          </div>
        </div>
      )}
      
      {/* Voting title */}
      <Question question={question} />
      
      {/* Submission status display */}
      <div className="text-center mb-8">
        {submitOk && (
          <div className="text-green-400 text-lg mb-4">Submission successful</div>
        )}
        {hasSubmitted && !submitOk && (
          <div className="text-yellow-400 text-lg mb-4">Waiting for next turn...</div>
        )}
      </div>

      {/* Voting options */}
      <div className="max-w-sm mx-auto w-full space-y-4">
        {votingOptions.map((option, index) => (
          <VotingOption
            key={option.id || index}
            option={option}
            isSelected={selectedId === option.id}
            onClick={() => {
              if (!hasSubmitted) {
                const chosen = option.id;
                console.info('[VotingPage] Clicked to select optionId=', chosen);
                submitChoice(chosen);
              }
            }}
          />
        ))}
      </div>

      {/* 提交后等待下一回合：覆盖式加载动画（移动端） */}
      {hasSubmitted && !isGameFinished && (
        <LoadingOverlay text="Generating next turn..." small />
      )}
    </div>
  );
};

export default VotingPage;