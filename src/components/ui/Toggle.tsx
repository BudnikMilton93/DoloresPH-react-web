interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
            checked ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
          } ${disabled ? 'opacity-50' : ''}`}
        />
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </div>
      {label && <span className="text-sm text-[var(--color-text)]">{label}</span>}
    </label>
  );
}
