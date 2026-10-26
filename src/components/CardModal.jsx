import React, { useState, useEffect } from 'react';
import { User, HelpCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { CARD_TYPES } from '../data/cards';

const ICON_MAP = {
  parent: User,
  child: HelpCircle,
  myth: AlertCircle,
  challenge: ShieldAlert,
};

export default function CardModal({ card, onClose }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowAnswer(false);
  }, [card]);

  if (!card) return null;

  const hasOptions = !!card.options;
  const cardType = CARD_TYPES[card.type] || CARD_TYPES.parent;
  const IconComponent = ICON_MAP[card.type] || User;

  const handleSelect = (key) => setSelectedAnswer(key);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">

        {/* === Header Berwarna sesuai Tipe Kartu === */}
        <div className={`${cardType.bg} p-6 md:p-8 rounded-t-3xl relative`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-2">
              <IconComponent className={`w-6 h-6 ${cardType.iconColor}`} />
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${cardType.textColor}`}>
              {cardType.label}
            </span>
          </div>
          <h3 className={`text-lg md:text-xl font-bold leading-snug ${cardType.textColor}`}>
            {card.text}
          </h3>
        </div>

        {/* === Body === */}
        <div className="p-6 md:p-8">

          {/* Render Pilihan Ganda */}
          {hasOptions && (
            <div className={`mb-6 ${card.type === 'myth' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
              {Object.entries(card.options).map(([key, value]) => {
                let btnClass = "border-2 border-gray-200 hover:border-brand-blue hover:bg-blue-50";

                if (showAnswer) {
                  if (key === card.correctAnswer) {
                    btnClass = "border-2 border-green-500 bg-green-50 text-green-700";
                  } else if (key === selectedAnswer) {
                    btnClass = "border-2 border-red-500 bg-red-50 text-red-700";
                  } else {
                    btnClass = "border-2 border-gray-200 opacity-50";
                  }
                } else if (key === selectedAnswer) {
                  btnClass = "border-2 border-brand-pink bg-pink-50 text-brand-pink";
                }

                return (
                  <button
                    key={key}
                    disabled={showAnswer}
                    onClick={() => handleSelect(key)}
                    className={`w-full text-left p-3 md:p-4 rounded-xl transition-all font-medium flex items-start gap-3 ${btnClass}`}
                  >
                    <span className="bg-white rounded-md w-7 h-7 flex items-center justify-center border font-bold text-sm shadow-sm flex-shrink-0">
                      {key}
                    </span>
                    <span className="text-sm md:text-base">{value}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Aksi */}
          <div className="text-center">
            {hasOptions && !showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                disabled={!selectedAnswer}
                className={`px-8 py-3 rounded-full font-bold text-white transition-all w-full md:w-auto ${selectedAnswer ? 'bg-brand-pink hover:bg-pink-600 shadow-lg hover:-translate-y-0.5' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Cek Jawaban
              </button>
            ) : (
              <>
                {hasOptions && card.explanation && (
                  <div className={`p-4 rounded-xl mb-4 text-left border-l-4 animate-fade-in ${
                    selectedAnswer === card.correctAnswer
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <p className="font-bold text-sm mb-1 flex items-center gap-2 flex-wrap">
                      {selectedAnswer === card.correctAnswer ? (
                        <><i className="fas fa-check-circle text-green-600"></i> <span className="text-green-700">Tepat Sekali!</span></>
                      ) : (
                        <><i className="fas fa-times-circle text-red-600"></i> <span className="text-red-700">Belum Tepat</span></>
                      )}
                      <span className="text-brand-brown">Kunci: {card.correctAnswer}</span>
                    </p>
                    <p className="text-sm text-brand-brown/80 leading-relaxed">{card.explanation}</p>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-full font-bold bg-brand-brown text-white hover:bg-gray-800 transition-all w-full md:w-auto"
                >
                  Tutup Kartu
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
