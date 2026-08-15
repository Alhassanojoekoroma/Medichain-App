"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isSelected?: boolean;
  date: Date;
}

function generateCalendarDays(year: number, month: number, selectedDate: Date): CalendarDay[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    days.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month - 1, day),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      day: i,
      isCurrentMonth: true,
      isSelected: 
        selectedDate.getDate() === i && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year,
      date,
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  return days;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
}

export function Calendar({ onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 2, 8)); // March 8, 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = generateCalendarDays(year, month, selectedDate);

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    onDateSelect?.(date);
  }, [onDateSelect]);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--gray-200)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-[var(--ink-900)]">
          {monthNames[month]} {year}
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={goToPreviousMonth}
            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-[var(--primary-100)] rounded-lg flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--gray-600)]" />
          </button>
          <button 
            onClick={goToNextMonth}
            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-[var(--primary-100)] rounded-lg flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-[var(--gray-600)]" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-xs font-medium text-[var(--gray-500)] py-1 sm:py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.slice(0, 35).map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day.date)}
            className={`
              aspect-square flex items-center justify-center text-xs sm:text-sm rounded-full transition-colors
              ${
                day.isSelected
                  ? "bg-[var(--primary-600)] text-white font-medium"
                  : day.isCurrentMonth
                  ? "text-[var(--ink-900)] hover:bg-[var(--primary-100)]"
                  : "text-[var(--gray-300)]"
              }
            `}
          >
            {day.day}
          </button>
        ))}
      </div>
    </div>
  );
}
