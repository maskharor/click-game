// src/components/CardModal.jsx
// Modal pop-up kartu dengan dukungan pilihan ganda & challenge ganda

import React, { useState, useEffect } from 'react';
import { User, HelpCircle, AlertCircle, ShieldAlert, Users, Baby, Sparkles, CheckCircle2 } from 'lucide-react';
import { CARD_TYPES } from '../data/cards';

const ICON_MAP = { parent: User, child: HelpCircle, myth: AlertCircle, challenge: ShieldAlert };

export default function CardModal({ card, onClose }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowAnswer(false);
  }, [card]);

  if (!card) return null;

  const getFilteredOptions = () => {
    if (!card.options) return null;
    const validKeys = card.type === 'myth' ? ['A', 'B'] : ['A', 'B', 'C'];
    const filtered = {};
    validKeys.forEach((k) => { if (card.options[k] !== undefined) filtered[k] = card.options[k]; });
    return Object.keys(filtered).length > 0 ? filtered : null;
  };

  const filteredOptions = getFilteredOptions();
  const hasOptions = !!filteredOptions;
  const isChallenge = card.type === 'challenge';
  const isCorrect = selectedAnswer === card.correctAnswer;
  const cardType = CARD_TYPES[card.type] || CARD_TYPES.parent;
  const IconComponent = ICON_MAP[card.type] || User;

  const handleSelect = (key) => setSelectedAnswer(key);

  const renderChallenge = () => {
    let parentText = '';
    let childText = '';
    if (card.challenges) {
      if (Array.isArray(card.challenges)) {
        card.challenges.forEach((ch) => {
          if (ch.target === 'parent') parentText = ch.description;
          else if (ch.target === 'child') childText = ch.description;
        });
      } else {
        parentText = card.challenges.parent || '';
        childText = card.challenges.child || '';
      }
    }
    return (
      <div className="space-y-3 mb-6">
        <div className="bg-blue-50 border-l-4 border-brand-blue p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-brand-blue" />
            <span className="text-xs font-black text-brand-blue uppercase tracking-wider">Untuk Orang Tua</span>
          </div>
          <p className="text-sm md:text-base text-brand-brown font-medium leading-relaxed">{parentText || '(Belum ada challenge untuk orang tua)'}</p>
        </div>
        <div className="bg-pink-50 border-l-4 border-brand-pink p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Baby size={18} className="text-brand-pink" />
            <span className="text-xs font-black text-brand-pink uppercase tracking-wider">Untuk Anak</span>
          </div>
          <p className="text-sm md:text-base text-brand-brown font-medium leading-relaxed">{childText || '(Belum ada challenge untuk anak)'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
        <div className={`${cardType.bg} p-6 md:p-8 rounded-t-3xl relative`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-2">
              <IconComponent className={`w-6 h-6 ${cardType.iconColor}`} />
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${cardType.textColor}`}>{cardType.label}</span>
          </div>
          <h3 className={`text-lg md:text-xl font-bold leading-snug ${cardType.textColor}`}>{card.text}</h3>
        </div>

        <div className="p-6 md:p-8">
          {isChallenge && renderChallenge()}

          {hasOptions && !isChallenge && (
            <div className={`mb-6 ${card.type === 'myth' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
              {Object.entries(filteredOptions).map(([key, value]) => {
                let btnClass = "border-2 border-gray-200 hover:border-brand-blue hover:bg-blue-50";
                if (showAnswer) {
                  if (key === card.correctAnswer) btnClass = "border-2 border-green-500 bg-green-50 text-green-700";
                  else if (key === selectedAnswer) btnClass = "border-2 border-red-500 bg-red-50 text-red-700";
                  else btnClass = "border-2 border-gray-200 opacity-50";
                } else if (key === selectedAnswer) {
                  btnClass = "border-2 border-brand-pink bg-pink-50 text-brand-pink";
                }
                return (
                  <button key={key} disabled={showAnswer} onClick={() => handleSelect(key)} className={`w-full text-left p-3 md:p-4 rounded-xl transition-all font-medium flex items-start gap-3 ${btnClass}`}>
                    <span className="bg-white rounded-md w-7 h-7 flex items-center justify-center border font-bold text-sm shadow-sm flex-shrink-0">{key}</span>
                    <span className="text-sm md:text-base">{value}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-center">
            {isChallenge && (
              <button onClick={onClose} className="px-8 py-3 rounded-full font-bold bg-brand-brown text-white hover:bg-gray-800 transition-all w-full md:w-auto flex items-center justify-center gap-2 mx-auto">
                <Sparkles size={18} /> Selesai & Lanjut
              </button>
            )}

            {!isChallenge && hasOptions && !showAnswer && (
              <button onClick={() => setShowAnswer(true)} disabled={!selectedAnswer} className={`px-8 py-3 rounded-full font-bold text-white transition-all w-full md:w-auto ${selectedAnswer ? 'bg-brand-pink hover:bg-pink-600 shadow-lg' : 'bg-gray-300 cursor-not-allowed'}`}>
                Cek Jawaban
              </button>
            )}

            {!isChallenge && hasOptions && showAnswer && (
              <>
                {/* Feedback benar/salah */}
                <div className={`p-4 rounded-xl mb-4 text-left border-l-4 animate-fade-in ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                  <p className="font-bold text-sm mb-1 flex items-center gap-2 flex-wrap">
                    {isCorrect ? (
                      <><CheckCircle2 size={16} className="text-green-600" /> <span className="text-green-700">Tepat Sekali!</span></>
                    ) : (
                      <><AlertCircle size={16} className="text-red-600" /> <span className="text-red-700">Belum Tepat</span></>
                    )}
                    <span className="text-brand-brown">Kunci: {card.correctAnswer}</span>
                  </p>

                  {/* Penjelasan SELALU muncul (baik benar maupun salah) */}
                  {card.explanation && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <p className="text-xs font-black uppercase tracking-wider text-brand-brown/60 mb-1">
                        {isCorrect ? 'Kenapa ini benar:' : 'Penjelasan:'}
                      </p>
                      <p className="text-sm text-brand-brown/90 leading-relaxed">{card.explanation}</p>
                    </div>
                  )}
                </div>

                <button onClick={onClose} className="px-8 py-3 rounded-full font-bold bg-brand-brown text-white hover:bg-gray-800 transition-all w-full md:w-auto">Tutup Kartu</button>
              </>
            )}

            {!isChallenge && !hasOptions && (
              <button onClick={onClose} className="px-8 py-3 rounded-full font-bold bg-brand-brown text-white hover:bg-gray-800 transition-all w-full md:w-auto">Tutup Kartu</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
