"use client";

interface GenerateButtonProps {
  combinationCount: number;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function GenerateButton({ combinationCount, loading, disabled, onClick }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Creating job...
        </span>
      ) : (
        `Generate ${combinationCount} combination${combinationCount !== 1 ? "s" : ""}`
      )}
    </button>
  );
}
