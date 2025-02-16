"use client";
import Link from "next/link";

interface NavigationBarItemProps {
  label: string;
  path: string;
  active: boolean;
  enabled: boolean;
}

const NavigationBarItem: React.FC<NavigationBarItemProps> = ({ label, path, active, enabled }) => {
  const baseClass = "px-4 py-2 rounded-lg transition-colors duration-200";
  if (enabled) {
    return (
      <Link
        href={path}
        className={`${baseClass} ${active ? "bg-[#4f46e5] text-white" : "text-gray-300 hover:text-white"}`}
      >
        {label}
      </Link>
    );
  }
  return (
    <button disabled className={`${baseClass} text-gray-500 cursor-not-allowed`}>
      {label}
    </button>
  );
};

export default NavigationBarItem; 