import { RegistroItem } from '../types';

export interface MonthOption {
  value: number;
  name: string;
  abbrev: string;
}

export const MONTH_OPTIONS: MonthOption[] = [
  { value: 1, name: 'Janeiro', abbrev: 'Jan' },
  { value: 2, name: 'Fevereiro', abbrev: 'Fev' },
  { value: 3, name: 'Março', abbrev: 'Mar' },
  { value: 4, name: 'Abril', abbrev: 'Abr' },
  { value: 5, name: 'Maio', abbrev: 'Mai' },
  { value: 6, name: 'Junho', abbrev: 'Jun' },
  { value: 7, name: 'Julho', abbrev: 'Jul' },
  { value: 8, name: 'Agosto', abbrev: 'Ago' },
  { value: 9, name: 'Setembro', abbrev: 'Set' },
  { value: 10, name: 'Outubro', abbrev: 'Out' },
  { value: 11, name: 'Novembro', abbrev: 'Nov' },
  { value: 12, name: 'Dezembro', abbrev: 'Dez' },
];

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

/**
 * Extracts a numeric day (1..31) from a string or number.
 */
export function extractDayNumber(val: any, fallbackIndex?: number): number | null {
  if (typeof val === 'number' && val >= 1 && val <= 31) {
    return val;
  }
  if (typeof val === 'string') {
    // If it's a date like DD/MM/AAAA or AAAA-MM-DD
    if (val.includes('/')) {
      const parts = val.split('/');
      const d = parseInt(parts[0], 10);
      if (d >= 1 && d <= 31) return d;
    }
    if (val.includes('-')) {
      const parts = val.split('-');
      // Check if AAAA-MM-DD
      if (parts[0].length === 4) {
        const d = parseInt(parts[2], 10);
        if (d >= 1 && d <= 31) return d;
      } else {
        const d = parseInt(parts[0], 10);
        if (d >= 1 && d <= 31) return d;
      }
    }
    // Match any stand-alone number
    const match = val.match(/\b([1-9]|[12][0-9]|3[01])\b/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  if (fallbackIndex !== undefined && fallbackIndex >= 1 && fallbackIndex <= 31) {
    return fallbackIndex;
  }
  return null;
}

/**
 * Formats a day, month, and year into DD/MM/AAAA (or AAAA-MM-DD)
 */
export function formatFullDate(
  day: number,
  month: number,
  year: number,
  iso: boolean = false
): string {
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  const yyyy = String(year);
  return iso ? `${yyyy}-${mm}-${dd}` : `${dd}/${mm}/${yyyy}`;
}

/**
 * Gets day of week name in Portuguese for a given day, month (1-12), and year.
 */
export function getWeekdayName(day: number, month: number, year: number): string {
  try {
    const d = new Date(year, month - 1, day);
    return DIAS_SEMANA[d.getDay()] || '';
  } catch {
    return '';
  }
}

/**
 * Applies selected month and year to all records, updating both the day, full formatted date,
 * and optionally aligning day of week.
 */
export function applyMonthYearToRegistros(
  registros: RegistroItem[],
  month: number,
  year: number,
  options?: { iso?: boolean; updateWeekday?: boolean }
): RegistroItem[] {
  return registros.map((item, index) => {
    // If item.dia is set, use it; otherwise extract from data or row index
    const day = extractDayNumber(item.dia, undefined) || extractDayNumber(item.data, index + 1) || (index + 1);
    const fullDate = formatFullDate(day, month, year, options?.iso);
    const weekday = options?.updateWeekday ? getWeekdayName(day, month, year) : (item.dia_semana || getWeekdayName(day, month, year));

    return {
      ...item,
      dia: day,
      data: fullDate,
      dia_semana: weekday,
      _edited: true,
    };
  });
}
