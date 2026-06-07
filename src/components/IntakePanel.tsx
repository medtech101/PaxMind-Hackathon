import React, { useState } from 'react';
import { PatientContext } from '../types';
import { User, ShieldAlert, Heart, Calendar, Pill, AlertTriangle, Sparkles } from 'lucide-react';

interface IntakePanelProps {
  context: PatientContext;
  onChange: (newContext: PatientContext) => void;
  isModified?: boolean;
  onReAnalyze?: () => void;
  isLoading?: boolean;
  hasActiveTriage?: boolean;
}

const COMMON_CONDITIONS = ["Diabetes", "Heart Failure", "Renal Disfunction / Dialysis", "Hypertension", "Asthma / COPD"];
const PRE_ADDED_MEDS = [
  { name: "Oxybutynin (Ditropan)", class: "Anticholinergic Bladder Drug", Beers: true },
  { name: "Diphenhydramine (Benadryl)", class: "Anticholinergic Antihistamine", Beers: true },
  { name: "Amitriptyline", class: "Tricyclic Antidepressant", Beers: true },
  { name: "Lisinopril", class: "ACE Inhibitor Hypertension", Beers: false },
  { name: "Metformin", class: "Oral Antidiabetic", Beers: false },
  { name: "Atorvastatin (Lipitor)", class: "Statin Lipid Control", Beers: false }
];

export default function IntakePanel({ 
  context, 
  onChange,
  isModified = false,
  onReAnalyze,
  isLoading = false,
  hasActiveTriage = false
}: IntakePanelProps) {
  const [customCond, setCustomCond] = useState('');
  const [customMed, setCustomMed] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');

  const updateField = (field: keyof PatientContext, value: any) => {
    onChange({
      ...context,
      [field]: value
    });
  };

  const toggleCondition = (cond: string) => {
    const updated = context.conditions.includes(cond)
      ? context.conditions.filter(c => c !== cond)
      : [...context.conditions, cond];
    updateField('conditions', updated);
  };

  const addMedication = (med: string) => {
    if (med && !context.medications.includes(med)) {
      updateField('medications', [...context.medications, med]);
    }
  };

  const removeMedication = (med: string) => {
    updateField('medications', context.medications.filter(m => m !== med));
  };

  const addAllergy = () => {
    if (customAllergy.trim() && !context.allergies.includes(customAllergy.trim())) {
      updateField('allergies', [...context.allergies, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    updateField('allergies', context.allergies.filter(a => a !== allergy));
  };

  const applyTemplate = (type: 'elder' | 'cardiac' | 'healthy') => {
    if (type === 'elder') {
      onChange({
        age: '78',
        biologicalSex: 'female',
        isPregnant: false,
        conditions: ["Urinary Frequency", "Mild Osteoarthritis"],
        medications: ["Oxybutynin (Ditropan)", "Atorvastatin (Lipitor)"],
        allergies: ["Penicillin"]
      });
    } else if (type === 'cardiac') {
      onChange({
        age: '61',
        biologicalSex: 'male',
        isPregnant: false,
        conditions: ["Hypertension", "Diabetes", "Heart Failure"],
        medications: ["Lisinopril", "Metformin"],
        allergies: []
      });
    } else {
      onChange({
        age: '28',
        biologicalSex: 'female',
        isPregnant: false,
        conditions: [],
        medications: [],
        allergies: []
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col gap-5 h-full overflow-y-auto" id="intake-panel-container">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User className="h-5 w-5 text-teal-600" id="user-avatar-icon" />
          <h2 className="text-base font-semibold text-slate-800" id="intake-main-header">Active Patient Profile</h2>
        </div>
        <p className="text-xs text-slate-500">Provide baseline details to adjust clinical risk calculation dynamically.</p>
      </div>

      {/* Synchronization Actions and Active Feedback Indicators */}
      {hasActiveTriage ? (
        isModified && onReAnalyze ? (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex flex-col gap-2 animate-fade-in" id="panel-sync-alert">
            <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-600 animate-pulse" />
              <span>Assessment Desynced</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              You updated the baseline patient context. Click below to re-evaluate the triage calculation.
            </p>
            <button
              onClick={onReAnalyze}
              disabled={isLoading}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              id="panel-reanalyze-button"
            >
              {isLoading ? "Re-evaluating..." : "🔄 Re-Analyze with New Profile"}
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2" id="panel-sync-success">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] text-emerald-800 font-medium">Triage is synchronized to current profile.</span>
          </div>
        )
      ) : (
        <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-3 flex items-start gap-2 animate-fade-in" id="panel-first-instruction">
          <Sparkles className="h-4 w-4 text-teal-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-[11px] text-teal-900 leading-normal">
            <p className="font-semibold text-teal-950">Baseline Locked In</p>
            <p className="text-slate-600 font-normal mt-0.5">Parameters are applied to active sandbox. Start a clinical chat thread or select a preset scenario to update triage.</p>
          </div>
        </div>
      )}

      {/* Simulator Preset Templates */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100" id="presets-panel">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-teal-700" />
          <span className="text-xs font-medium text-slate-700">Quick Patient Scenarios</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => applyTemplate('elder')}
            className="text-[11px] px-2.5 py-1.5 bg-white text-slate-700 rounded border border-slate-200 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/20 transition-all cursor-pointer font-medium"
            id="preset-elder-btn"
          >
            🧓 78yo Bladder Cascade
          </button>
          <button
            onClick={() => applyTemplate('cardiac')}
            className="text-[11px] px-2.5 py-1.5 bg-white text-slate-700 rounded border border-slate-200 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/20 transition-all cursor-pointer font-medium"
            id="preset-cardiac-btn"
          >
            🫀 61yo High CV Risk
          </button>
          <button
            onClick={() => applyTemplate('healthy')}
            className="text-[11px] px-2.5 py-1.5 bg-white text-slate-700 rounded border border-slate-200 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/20 transition-all cursor-pointer font-medium"
            id="preset-healthy-btn"
          >
            🏃 28yo Clean Profile
          </button>
        </div>
      </div>

      {/* General Information */}
      <div className="grid grid-cols-2 gap-3" id="general-info-grid">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Age</label>
          <div className="relative">
            <input
              type="number"
              placeholder="e.g. 45"
              value={context.age}
              onChange={(e) => updateField('age', e.target.value)}
              className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-teal-500 focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              id="patient-age-input"
            />
            <Calendar className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Biological Sex</label>
          <select
            value={context.biologicalSex}
            onChange={(e) => {
              const val = e.target.value as any;
              onChange({
                ...context,
                biologicalSex: val,
                isPregnant: val === 'female' ? context.isPregnant : false
              });
            }}
            className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-teal-500 focus:bg-white transition-all"
            id="patient-sex-select"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Pregnancy Checkbox (Female only) */}
      {context.biologicalSex === 'female' && (
        <div className="flex items-center gap-2 bg-pink-50/40 p-2.5 rounded-lg border border-pink-100/60" id="pregnancy-container">
          <input
            type="checkbox"
            checked={context.isPregnant === true}
            onChange={(e) => updateField('isPregnant', e.target.checked)}
            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-slate-300 rounded cursor-pointer"
            id="patient-pregnancy-checkbox"
          />
          <span className="text-xs font-semibold text-pink-900">Active Pregnancy Status</span>
        </div>
      )}

      {/* Comorbidities */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Heart className="h-3.5 w-3.5 text-red-500" /> Comorbidity Risk Adjusters
        </label>
        <div className="grid grid-cols-1 gap-1">
          {COMMON_CONDITIONS.map(cond => {
            const isChecked = context.conditions.includes(cond);
            return (
              <label
                key={cond}
                className={`flex items-center gap-2.5 py-2 px-3 rounded-lg border cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-rose-50/40 border-rose-200 text-rose-950 font-medium'
                    : 'bg-slate-50/20 border-slate-100 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCondition(cond)}
                  className="h-3.5 w-3.5 text-rose-600 focus:ring-rose-500 rounded border-slate-300 cursor-pointer"
                />
                <span className="text-xs">{cond}</span>
              </label>
            );
          })}
        </div>
        <div className="flex gap-1.5 mt-1">
          <input
            type="text"
            placeholder="Add custom condition..."
            value={customCond}
            onChange={(e) => setCustomCond(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customCond.trim()) {
                toggleCondition(customCond.trim());
                setCustomCond('');
              }
            }}
            className="flex-1 text-xs bg-slate-50/50 border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-teal-500"
            id="custom-condition-text"
          />
          <button
            onClick={() => {
              if (customCond.trim()) {
                toggleCondition(customCond.trim());
                setCustomCond('');
              }
            }}
            className="text-[11px] px-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded border border-slate-200 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* Medications (with Beers list indicators) */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Pill className="h-3.5 w-3.5 text-blue-500" /> Active Medications (Beers Check)
        </label>
        
        {/* Quick add high-risk medications */}
        <div className="p-3 bg-blue-50/20 rounded-lg border border-blue-100 flex flex-col gap-1.5">
          <span className="text-[10px] font-medium text-slate-500 uppercase">Beers List & Cascade Triggers:</span>
          <div className="flex flex-wrap gap-1">
            {PRE_ADDED_MEDS.map(med => {
              const isAdded = context.medications.includes(med.name);
              return (
                <button
                  key={med.name}
                  onClick={() => isAdded ? removeMedication(med.name) : addMedication(med.name)}
                  className={`text-[10px] py-1 px-2 rounded flex items-center gap-1 border transition-all cursor-pointer font-medium ${
                    isAdded
                      ? 'bg-blue-600 text-white border-blue-600'
                      : med.Beers
                      ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={`${med.class} ${med.Beers ? '(High Beers criteria caution for elderly)' : ''}`}
                >
                  {med.Beers && <AlertTriangle className="h-2.5 w-2.5 text-amber-700 inline" />}
                  {med.name.split(' (')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current list */}
        {context.medications.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1" id="active-medications-list">
            {context.medications.map(med => (
              <span
                key={med}
                className="text-[11px] bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200 flex items-center gap-1"
              >
                {med}
                <button onClick={() => removeMedication(med)} className="text-slate-400 hover:text-red-500 font-bold ml-1 text-xs cursor-pointer">×</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-1.5 mt-1">
          <input
            type="text"
            placeholder="Add other medication..."
            value={customMed}
            onChange={(e) => setCustomMed(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customMed.trim()) {
                addMedication(customMed.trim());
                setCustomMed('');
              }
            }}
            className="flex-1 text-xs bg-slate-50/50 border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-teal-500"
            id="custom-med-text"
          />
          <button
            onClick={() => {
              if (customMed.trim()) {
                addMedication(customMed.trim());
                setCustomMed('');
              }
            }}
            className="text-[11px] px-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded border border-slate-200 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* Allergies */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Medical Allergies
        </label>
        {context.allergies.length > 0 && (
          <div className="flex flex-wrap gap-1" id="allergies-list">
            {context.allergies.map(allergy => (
              <span
                key={allergy}
                className="text-[11px] bg-amber-50 text-amber-950 px-2 py-1 rounded border border-amber-200 flex items-center gap-1"
              >
                {allergy}
                <button onClick={() => removeAllergy(allergy)} className="text-amber-400 hover:text-amber-800 font-bold ml-1 text-xs cursor-pointer">×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <input
            type="text"
            placeholder="Add allergy (e.g. Penicillin)..."
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addAllergy();
            }}
            className="flex-1 text-xs bg-slate-50/50 border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-teal-500"
            id="custom-allergy-text"
          />
          <button
            onClick={addAllergy}
            className="text-[11px] px-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded border border-slate-200 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
