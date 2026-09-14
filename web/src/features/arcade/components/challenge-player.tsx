'use client';
import { useState } from 'react';
import { usePlayChallenge } from '../api';
import { EmployeeChallenge } from '../types';
import { useTranslations } from 'next-intl';

export function ChallengePlayer({ challenge, onComplete }: { challenge: EmployeeChallenge, onComplete: () => void }) {
  const t = useTranslations();
  const { mutate: play, isPending } = usePlayChallenge(challenge.id);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [answerText, setAnswerText] = useState<string>('');
  const [startTime] = useState(() => Date.now());

  const handlePlay = () => {
    let answer = '';
    if (challenge.type === 'TRIVIA' || challenge.type === 'POLL' || challenge.type === 'GUESS_COLLEAGUE') {
      if (!selectedOption) return;
      answer = selectedOption;
    } else {
      if (!answerText.trim()) return;
      answer = answerText.trim();
    }
    
    play({ answer, durationMs: Date.now() - startTime }, {
      onSuccess: () => {
        onComplete();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl">
        <h3 className="font-bold text-lg mb-2">{challenge.question}</h3>
        {challenge.description && <p className="text-sm opacity-80">{challenge.description}</p>}
      </div>

      {(challenge.type === 'TRIVIA' || challenge.type === 'POLL' || challenge.type === 'GUESS_COLLEAGUE') && challenge.options && (
        <div className="space-y-2">
          {challenge.options.map((opt, idx) => (
            <label 
              key={idx} 
              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                selectedOption === opt 
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' 
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input 
                type="radio" 
                name="option" 
                value={opt} 
                checked={selectedOption === opt}
                onChange={() => setSelectedOption(opt)}
                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600"
              />
              <span className="font-medium">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {challenge.type === 'CAPTION' && (
        <div>
          <textarea
            className="input w-full min-h-[100px]"
            placeholder={t('arcade.captionPlaceholder')}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button 
          onClick={handlePlay} 
          disabled={isPending || ((challenge.type === 'CAPTION' ? !answerText.trim() : !selectedOption))}
          className="btn btn-primary px-6 py-2 rounded-xl"
        >
          {isPending ? t('common.loading') : t('arcade.play')}
        </button>
      </div>
    </div>
  );
}
