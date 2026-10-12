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
    <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Character Anchor Lock</h4>
            <p className="text-[11px] text-slate-500">Enforces visual character consistency across all pages</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Locked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Character Name</label>
          <input
            type="text"
            value={character.name}
            onChange={(e) => onChange({ ...character, name: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            placeholder="e.g. Barnaby"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject / Animal / Role</label>
          <input
            type="text"
            value={character.type}
            onChange={(e) => onChange({ ...character, type: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            placeholder="e.g. Golden Retriever Puppy"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
          Signature Traits (Included in all prompt seeds)
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {character.traits.map((trait, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200"
            >
              {trait}
              <button
                type="button"
                onClick={() => handleRemoveTrait(idx)}
                className="hover:text-red-600 transition-colors"
                title="Remove trait"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddTrait} className="flex gap-2">
          <input
            type="text"
            value={newTrait}
            onChange={(e) => setNewTrait(e.target.value)}
            placeholder="Add trait (e.g. 'Blue star backpack')..."
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </form>
      </div>
    </div>
  );
}
