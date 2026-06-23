"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
}

export function SearchableSelect({ name, options, defaultValue, placeholder = "Buscar..." }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue || "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === selectedValue);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={wrapperRef}>
      <input type="hidden" name={name} value={selectedValue} />
      
      <div 
        className="w-full bg-black border border-border rounded px-3 py-2 cursor-pointer flex justify-between items-center text-sm"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch("");
        }}
      >
        <span className={selectedOption ? "text-white" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-muted-foreground text-xs">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border bg-black/50">
            <input
              type="text"
              autoFocus
              placeholder="Escribe para buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black border border-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto p-1 flex-1">
            <div 
              className={`px-3 py-2 text-sm cursor-pointer rounded hover:bg-primary/20 ${!selectedValue ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
              onClick={() => {
                setSelectedValue("");
                setIsOpen(false);
              }}
            >
              (Ninguno / Sin vincular)
            </div>
            {filteredOptions.map(option => (
              <div
                key={option.value}
                className={`px-3 py-2 text-sm cursor-pointer rounded hover:bg-primary/20 ${selectedValue === option.value ? "bg-primary/20 text-primary font-bold" : "text-white"}`}
                onClick={() => {
                  setSelectedValue(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground italic text-center">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
