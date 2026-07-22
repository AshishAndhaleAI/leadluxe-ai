import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Phone, User } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import type { SiteVisit } from '../../types';

interface CalendarViewProps {
  visits: SiteVisit[];
  onDateSelect?: (date: Date) => void;
  onVisitClick?: (visit: SiteVisit) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarView({ visits, onDateSelect, onVisitClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const visitsByDate = useMemo(() => {
    const map = new Map<string, SiteVisit[]>();
    visits.forEach((visit) => {
      const key = visit.scheduled_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(visit);
    });
    return map;
  }, [visits]);

  const selectedDateVisits = selectedDate
    ? visitsByDate.get(formatDateToISO(selectedDate)) || []
    : [];

  function formatDateToISO(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [daysInMonth, firstDayOfWeek]);

  const getVisitCount = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return visitsByDate.get(dateStr)?.length || 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900/80 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-luxury-gold-400" />
            <h2 className="text-lg font-semibold text-white">
              {MONTHS[month]} {year}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-xs text-luxury-gold-400 hover:bg-luxury-gold-500/10 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div key={index} className="aspect-square">
              {day && (
                <button
                  onClick={() => {
                    const date = new Date(year, month, day);
                    setSelectedDate(date);
                    onDateSelect?.(date);
                  }}
                  className={cn(
                    'w-full h-full min-h-[48px] flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-200 relative',
                    isSelected(day)
                      ? 'bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30'
                      : isToday(day)
                      ? 'bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/20'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent'
                  )}
                >
                  <span className="font-medium">{day}</span>
                  {getVisitCount(day) > 0 && (
                    <span className="text-[10px] text-emerald-400 font-medium -mt-0.5">
                      {getVisitCount(day)} visit{getVisitCount(day) > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Visits */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          {selectedDate ? (
            formatDate(selectedDate)
          ) : (
            'Select a date to view visits'
          )}
        </h3>

        <div className="space-y-3">
          {selectedDateVisits.length === 0 && selectedDate && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="w-8 h-8 text-gray-700 mb-2" />
              <p className="text-sm text-gray-500">No visits scheduled</p>
              <p className="text-xs text-gray-600 mt-1">Click + to schedule a new visit</p>
            </div>
          )}

          {selectedDateVisits.map((visit) => (
            <div
              key={visit.id}
              onClick={() => onVisitClick?.(visit)}
              className="p-3 rounded-lg border border-gray-800 bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-sm text-white">{visit.scheduled_time}</span>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  visit.status === 'scheduled' && 'text-blue-400 bg-blue-500/10',
                  visit.status === 'completed' && 'text-emerald-400 bg-emerald-500/10',
                  visit.status === 'cancelled' && 'text-red-400 bg-red-500/10',
                  visit.status === 'rescheduled' && 'text-amber-400 bg-amber-500/10',
                )}>
                  {visit.status.replace('_', ' ')}
                </span>
              </div>
              {visit.lead && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <User className="w-3 h-3" />
                    <span>{visit.lead.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    <span>{visit.lead.phone}</span>
                  </div>
                  {visit.lead.preferred_location && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{visit.lead.preferred_location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
