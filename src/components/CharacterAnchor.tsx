"use client";

import React, { useState } from "react";
import { CharacterAnchor as ICharacterAnchor } from "@/types/book";
import { Lock, Plus, X, Sparkles } from "lucide-react";

interface CharacterAnchorProps {
  character: ICharacterAnchor;
  onChange: (updated: ICharacterAnchor) => void;
}

export default function CharacterAnchor({ character, onChange }: CharacterAnchorProps) {
  const [newTrait, setNewTrait] = useState("");

  const handleAddTrait = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrait.trim()) return;
    onChange({
      ...character,
      traits: [...character.traits, newTrait.trim()],
    });
    setNewTrait("");
  };

  const handleRemoveTrait = (indexToRemove: number) => {
    onChange({
      ...character,
      traits: character.traits.filter((_, idx) => idx !== indexToRemove),
    });
  };

  return (
    <div className="bg-[#FAF6EE] rounded-xl border border-[#E8DFD3] p-4 shadow-sm text-[#1E2530]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E2530]">Character Anchor Lock</h4>
            <p className="text-[11px] text-[#5C5347]">Enforces visual character consistency across all pages</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Locked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#5C5347] mb-1">Character Name</label>
          <input
            type="text"
            value={character.name}
            onChange={(e) => onChange({ ...character, name: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E8DFD3] text-[#1E2530] placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
            placeholder="e.g. Barnaby"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#5C5347] mb-1">Archetype / Animal</label>
          <input
            type="text"
            value={character.type}
            onChange={(e) => onChange({ ...character, type: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E8DFD3] text-[#1E2530] placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
            placeholder="e.g. Golden Retriever Puppy"
          />
        </div>
      </div>

      {/* Trait Pills */}
      <div>
        <label className="block text-[11px] font-semibold text-[#5C5347] mb-1.5">
          Visual Anchor Traits (Injected into Prompt for Consistency)
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {character.traits.map((trait, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-950 border border-amber-300"
            >
              <span>{trait}</span>
              <button
                type="button"
                onClick={() => handleRemoveTrait(idx)}
                className="text-amber-700 hover:text-rose-700 transition-colors ml-0.5"
                title="Remove trait"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Trait Form */}
        <form onSubmit={handleAddTrait} className="flex gap-2">
          <input
            type="text"
            value={newTrait}
            onChange={(e) => setNewTrait(e.target.value)}
            placeholder="Add visual trait (e.g. 'Wearing a cozy red scarf')..."
            className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-white border border-[#E8DFD3] text-[#1E2530] placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
