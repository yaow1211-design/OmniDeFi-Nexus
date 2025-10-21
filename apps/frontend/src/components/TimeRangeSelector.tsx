/**
 * TimeRangeSelector - Toggle between time periods
 */

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
}

const defaultOptions = [
  { label: '24H', value: '1d' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
];

export function TimeRangeSelector({ 
  value, 
  onChange, 
  options = defaultOptions 
}: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-all
            ${
              value === option.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}




