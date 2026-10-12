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
    <div className="glacier-glass-subtle rounded-xl border border-sky-400/20 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-400/15 text-sky-300 flex items-center justify-center border border-sky-400/30">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Character Anchor Lock</h4>
            <p className="text-[11px] text-[#a0b4c4]">Enforces visual character consistency across all pages</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/30 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Locked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#a0b4c4] mb-1">Character Name</label>
          <input
            type="text"
            value={character.name}
            onChange={(e) => onChange({ ...character, name: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/70 border border-sky-400/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-medium"
            placeholder="e.g. Barnaby"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#a0b4c4] mb-1">Archetype / Animal</label>
          <input
            type="text"
            value={character.type}
            onChange={(e) => onChange({ ...character, type: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/70 border border-sky-400/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-medium"
            placeholder="e.g. Golden Retriever Puppy"
          />
        </div>
      </div>

      {/* Trait Pills */}
      <div>
        <label className="block text-[11px] font-semibold text-[#a0b4c4] mb-1.5">
          Visual Anchor Traits (Injected into GPT Prompt for Consistency)
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {character.traits.map((trait, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-sky-400/15 text-sky-200 border border-sky-400/30"
            >
              <span>{trait}</span>
              <button
                type="button"
                onClick={() => handleRemoveTrait(idx)}
                className="hover:text-red-300 transition-colors ml-0.5"
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
            className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-slate-900/70 border border-sky-400/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-bold bg-sky-400/20 hover:bg-sky-400/30 text-sky-300 border border-sky-400/40 rounded-lg flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
