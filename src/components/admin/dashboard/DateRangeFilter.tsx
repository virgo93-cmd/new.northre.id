"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export type DateRangeOption = "today" | "7d" | "30d" | "all" | "custom";

interface DateRangeFilterProps {
  value: DateRangeOption;
  onChange: (value: DateRangeOption) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (start: string, end: string) => void;
}

export default function DateRangeFilter({ 
  value, 
  onChange,
  customStartDate,
  customEndDate,
  onCustomDateChange
}: DateRangeFilterProps) {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // State untuk range kalender visual (DayPicker)
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
    from: customStartDate ? new Date(customStartDate) : undefined,
    to: customEndDate ? new Date(customEndDate) : undefined,
  });

  const options: { label: string; value: DateRangeOption }[] = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "All Time", value: "all" },
  ];

  // Tutup popup jika klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    }
    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopup]);

  const handleApply = () => {
    if (selectedRange?.from && selectedRange?.to) {
      const startStr = format(selectedRange.from, "yyyy-MM-dd");
      const endStr = format(selectedRange.to, "yyyy-MM-dd");
      onCustomDateChange?.(startStr, endStr);
      onChange("custom");
      setShowPopup(false);
    }
  };

  // Format teks label tombol custom
  const getCustomDisplayLabel = () => {
    if (customStartDate && customEndDate) {
      return `${customStartDate} – ${customEndDate}`;
    }
    return "Custom Range";
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative">
      <div className="flex items-center gap-1.5 text-neutral-500 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-xs">
        <CalendarIcon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">Date range</span>
      </div>
      
      <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200/60 shadow-inner items-center">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              onChange(opt.value);
              setShowPopup(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              value === opt.value
                ? "bg-white text-neutral-900 shadow-xs ring-1 ring-neutral-200"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
        
        {/* Tombol Custom & Pop-Up Kalender Visual */}
        <div className="relative">
          <button
            onClick={() => setShowPopup(!showPopup)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 ${
              value === "custom"
                ? "bg-white text-neutral-900 shadow-xs ring-1 ring-neutral-200"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{value === "custom" ? getCustomDisplayLabel() : "Custom"}</span>
          </button>

          {/* Pop-Up Modal Kalender Visual Dua Bulan */}
          {showPopup && (
            <div 
              ref={popupRef}
              className="absolute top-full mt-2 right-0 z-50 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 animate-in fade-in zoom-in-95 duration-200 w-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <h4 className="text-xs font-bold text-neutral-900">Select Date Range & Time</h4>
                <button 
                  onClick={() => setShowPopup(false)} 
                  className="text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* DayPicker 2 Bulan Berjajar (Desktop) */}
              <div className="p-2">
                <DayPicker
                  mode="range"
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  numberOfMonths={2}
                  locale={id}
                  className="p-3"
                  modifiersClassNames={{
                    selected: "bg-emerald-600 text-white font-bold rounded-full",
                    range_middle: "bg-emerald-50 text-emerald-900",
                    range_start: "bg-emerald-600 text-white rounded-l-full",
                    range_end: "bg-emerald-600 text-white rounded-r-full",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-neutral-100">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleApply}
                  disabled={!selectedRange?.from || !selectedRange?.to}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}