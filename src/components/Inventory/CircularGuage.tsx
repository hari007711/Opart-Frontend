import React from "react";

interface CircularGaugeProps {
  percentage: number;
  label?: string;
  colorClass?: string;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({
  percentage,
  label,
  colorClass = "text-blue-600",
}) => {
  return (
    <div className="relative w-15 h-15">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          className="text-gray-200"
          stroke="currentColor"
          strokeWidth="2.8"
          fill="none"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />

        <path
          className={colorClass}
          stroke="currentColor"
          strokeWidth="2.8"
          strokeDasharray={`${percentage}, 100`}
          strokeLinecap="round"
          fill="none"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>

      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
        {percentage}%
      </span>

      {label && (
        <span className="absolute -bottom-5 inset-x-0 text-center text-xs text-gray-500">
          {label}
        </span>
      )}
    </div>
  );
};

export default CircularGauge;
