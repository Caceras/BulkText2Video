"use client";

import { useCallback } from "react";

interface VariableInputsProps {
  variables: string[];
  values: Record<string, string[]>;
  onChange: (values: Record<string, string[]>) => void;
}

export function VariableInputs({ variables, values, onChange }: VariableInputsProps) {
  const handleChange = useCallback(
    (varName: string, rawValue: string) => {
      const items = rawValue
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      onChange({ ...values, [varName]: items });
    },
    [values, onChange]
  );

  if (variables.length === 0) return null;

  const totalCombinations = variables.reduce((total, varName) => {
    const count = values[varName]?.length || 0;
    return total * (count || 1);
  }, 1);

  const hasValues = variables.some((v) => (values[v]?.length || 0) > 0);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        Variable Values
      </label>
      {variables.map((varName) => (
        <div key={varName} className="space-y-1">
          <label className="text-xs text-gray-400 font-mono">[{varName}]</label>
          <input
            type="text"
            placeholder={`Enter values separated by commas (e.g. value1, value2, value3)`}
            value={(values[varName] || []).join(", ")}
            onChange={(e) => handleChange(varName, e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {values[varName]?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-1">
              {values[varName].map((val, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300"
                >
                  {val}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      {hasValues && (
        <p className="text-sm text-gray-400">
          Total combinations:{" "}
          <span className="font-bold text-white">{totalCombinations}</span>
        </p>
      )}
    </div>
  );
}
