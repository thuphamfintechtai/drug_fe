import { useState } from 'react';

export default function SearchBar({ 
  placeholder = 'Tìm kiếm...', 
  onSearch,
  value: controlledValue,
  onChange: controlledOnChange 
}) {
  const [internalValue, setInternalValue] = useState('');
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const setValue = isControlled ? controlledOnChange : setInternalValue;

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
      <button
        type="submit"
        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition transform hover:scale-105"
      >
        Tìm kiếm
      </button>
    </form>
  );
}

