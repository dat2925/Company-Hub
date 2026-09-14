'use client';
import { useState, useEffect } from 'react';
import { 
  X, Maximize2, Minimize2, Gamepad2, RotateCcw, 
  Rocket, Star, Heart, Moon, Sun, Cloud, Snowflake, Zap 
} from 'lucide-react';

const icons = [Rocket, Star, Heart, Moon, Sun, Cloud, Snowflake, Zap];

interface Card {
  id: number;
  iconId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const generateCards = () => {
  const deck = [...icons, ...icons].map((_, i) => ({
    id: i,
    iconId: i % icons.length,
    isFlipped: false,
    isMatched: false,
  }));
  // Shuffle
  return deck.sort(() => Math.random() - 0.5);
};

export function MiniGameWidget({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  
  // Initialize game on mount
  useEffect(() => {
    if (isOpen && cards.length === 0) {
      setCards(generateCards());
    }
  }, [isOpen]);

  const resetGame = () => {
    setCards(generateCards());
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [firstIdx, secondIdx] = newFlipped;
      
      if (newCards[firstIdx].iconId === newCards[secondIdx].iconId) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatches(m => m + 1);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed z-[100] transition-all duration-300 ease-in-out shadow-2xl rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 animate-in slide-in-from-bottom-10 fade-in
      ${isMinimized ? 'bottom-4 right-4 w-64 h-12 shadow-indigo-500/20 shadow-lg' : 'bottom-6 right-6 w-80 sm:w-96 h-[400px]'}`}>
      
      {/* Header */}
      <div className="bg-slate-800/90 backdrop-blur-md px-3 flex items-center justify-between cursor-default border-b border-slate-700/50 h-12">
        <div className="flex items-center gap-2.5 text-indigo-300">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg">
            <Gamepad2 size={14} className={!isMinimized ? "animate-pulse text-indigo-400" : ""} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-white leading-none">Memory Match</span>
            {isMinimized && <span className="text-[9px] text-indigo-400 font-medium mt-0.5">Game paused</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
            title={isMinimized ? "Tiếp tục" : "Thu nhỏ"}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-700"
            title="Đóng"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className={`w-full ${isMinimized ? 'h-0 opacity-0 pointer-events-none' : 'h-[calc(100%-48px)] opacity-100'} transition-opacity duration-500 flex flex-col`}>
        
        {/* Game Stats */}
        <div className="px-4 py-2 flex items-center justify-between bg-slate-900 border-b border-slate-800">
          <div className="flex gap-4 text-xs font-bold text-slate-400">
            <span>Matches: <strong className="text-white">{matches}/8</strong></span>
            <span>Moves: <strong className="text-white">{moves}</strong></span>
          </div>
          <button onClick={resetGame} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors" title="Chơi lại">
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 p-4 flex items-center justify-center bg-slate-900/50">
          {matches === 8 ? (
            <div className="text-center animate-in zoom-in">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/50">
                <Star size={32} className="text-white fill-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-1">Chiến thắng!</h3>
              <p className="text-sm text-slate-400 mb-6">Bạn hoàn thành với {moves} bước</p>
              <button onClick={resetGame} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors">
                Chơi lại ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-[280px]">
              {cards.map((card, idx) => {
                const Icon = icons[card.iconId];
                const show = card.isFlipped || card.isMatched;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    disabled={show}
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-300 transform perspective-1000 ${
                      show 
                        ? (card.isMatched ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 border' : 'bg-indigo-600 shadow-inner shadow-black/20 text-white')
                        : 'bg-slate-800 hover:bg-slate-700 cursor-pointer shadow-md'
                    }`}
                  >
                    <div className={`transition-all duration-300 ${show ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-180 opacity-0'}`}>
                      <Icon size={24} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
