import React, { useState } from 'react';
import { Calendar, Check, Sparkles, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { MONTH_OPTIONS, applyMonthYearToRegistros } from '../utils/dateCompletion';
import { ExtractionResult } from '../types';

interface DateCompletionBarProps {
  result: ExtractionResult;
  onUpdateResult: (updated: ExtractionResult) => void;
}

export function DateCompletionBar({ result, onUpdateResult }: DateCompletionBarProps) {
  // Default to existing month/year or August 2026
  const initialMonth = result.documento.mes_referencia || 8; // Agosto
  const initialYear = result.documento.ano_referencia || 2026;

  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [dateFormat, setDateFormat] = useState<'br' | 'iso'>('br');
  const [syncWeekday, setSyncWeekday] = useState<boolean>(true);
  const [justApplied, setJustApplied] = useState<boolean>(false);

  const selectedMonthName = MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.name || 'Agosto';

  const handleApplyDates = (month = selectedMonth, year = selectedYear) => {
    const updatedRegistros = applyMonthYearToRegistros(result.registros, month, year, {
      iso: dateFormat === 'iso',
      updateWeekday: syncWeekday,
    });

    const monthName = MONTH_OPTIONS.find((m) => m.value === month)?.name || '';
    const updatedResult: ExtractionResult = {
      ...result,
      documento: {
        ...result.documento,
        mes_referencia: month,
        ano_referencia: year,
        data_referencia: `${monthName} / ${year} (Dias ${result.registros.map(r => r.dia).filter(Boolean).join(', ') || '12 a 18'})`,
      },
      registros: updatedRegistros,
    };

    onUpdateResult(updatedResult);
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 3000);
  };

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    handleApplyDates(newMonth, selectedYear);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    handleApplyDates(selectedMonth, newYear);
  };

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title and Explanation */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-600 text-white">
              <Calendar className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Preenchimento Automático de Datas por Mês & Ano</span>
              {justApplied && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full transition animate-fadeIn">
                  <CheckCircle2 className="w-3 h-3" />
                  Datas Atualizadas!
                </span>
              )}
            </h4>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 max-w-2xl">
            Como as folhinhas impressas contêm apenas o número do dia (ex: <strong>12, 13, 14...</strong>), selecione o mês e ano abaixo para que o sistema complete automaticamente as datas completas (ex: <strong className="text-blue-700 dark:text-blue-300">12/08/2026</strong>) em todas as linhas.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mês Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
              Mês:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {String(m.value).padStart(2, '0')} - {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ano Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
              Ano:
            </label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              min={2020}
              max={2035}
              className="w-20 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Formato da Data */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
              Formato:
            </label>
            <div className="flex items-center rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setDateFormat('br');
                  handleApplyDates(selectedMonth, selectedYear);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  dateFormat === 'br'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                DD/MM/AAAA
              </button>
              <button
                type="button"
                onClick={() => {
                  setDateFormat('iso');
                  handleApplyDates(selectedMonth, selectedYear);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  dateFormat === 'iso'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                AAAA-MM-DD
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col justify-end pt-5">
            <button
              type="button"
              onClick={() => handleApplyDates()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Aplicar a Todas as Linhas
            </button>
          </div>
        </div>
      </div>

      {/* Atalho com apenas o Mês/Ano selecionado (ex: Agosto/2026) */}
      <div className="mt-3 pt-3 border-t border-blue-200/80 dark:border-blue-900/40 w-full flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-stone-600 dark:text-stone-300 font-semibold text-xs whitespace-nowrap">
            Atalho rápido:
          </span>
          <button
            type="button"
            onClick={() => handleApplyDates(selectedMonth, selectedYear)}
            className="px-3 py-1 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition"
            title={`Clique para aplicar ${selectedMonthName}/${selectedYear} a todas as linhas`}
          >
            {selectedMonthName}/{selectedYear}
          </button>
        </div>
      </div>
    </div>
  );
}
