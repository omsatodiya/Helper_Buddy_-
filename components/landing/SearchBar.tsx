'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Small delay to allow clicking dropdown items
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute mt-1 w-full rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
          {/* You can map through your search results here */}
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            Search Result 1
          </div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            Search Result 2
          </div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            Search Result 3
          </div>
        </div>
      )}
    </div>
  );
}