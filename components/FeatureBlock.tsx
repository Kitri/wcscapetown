"use client";

interface FeatureBlockProps {
  title: string;
  index: number;
  isActive: boolean;
  onToggle: () => void;
}

export default function FeatureBlock({
  title,
  index,
  isActive,
  onToggle,
}: FeatureBlockProps) {
  // Odd blocks (1, 3, 5, 7) use yellow, even blocks (2, 4, 6) use pink
  const isOdd = (index + 1) % 2 === 1;

  return (
    <button
      onClick={onToggle}
      className={`
        border-2 rounded-full px-5 py-2 text-sm md:text-base font-medium transition-all duration-250 cursor-pointer
        ${
          isActive
            ? isOdd
              ? "bg-yellow-accent border-yellow-accent text-text-dark scale-105"
              : "bg-pink-accent border-pink-accent text-white scale-105"
            : isOdd
            ? "bg-white border-text-dark/20 hover:bg-yellow-accent hover:border-yellow-accent hover:text-text-dark hover:-translate-y-0.5 shadow-sm"
            : "bg-white border-text-dark/20 hover:bg-pink-accent hover:border-pink-accent hover:text-white hover:-translate-y-0.5 shadow-sm"
        }
      `}
    >
      {title}
    </button>
  );
}
