"use client";
import { usePathname } from "next/navigation";
import NavigationBarItem from "./NavigationBarItem";

const NavigationBar: React.FC = () => {
  const pathname = usePathname();

  // Define navigation items: enabled items are clickable.
  // Only My Decks and About are enabled; the rest are disabled.
  const navItems = [
    { label: "My Decks", path: "/dashboard", enabled: true },
    { label: "Practice", path: "/practice", enabled: false },
    { label: "Discover", path: "/discover", enabled: false },
    { label: "Profile", path: "/profile", enabled: false },
    { label: "About", path: "/about", enabled: true },
  ];

  return (
    <nav className="bg-[#242424] border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-[#4f46e5]">
            Deck Generator
          </div>
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <NavigationBarItem
                key={item.label}
                label={item.label}
                path={item.path}
                enabled={item.enabled}
                active={pathname === item.path}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar; 