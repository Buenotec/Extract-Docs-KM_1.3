import { ExtractionResult, RegistroItem } from '../types';

/**
 * Generates a Brazilian-compatible CSV string with ';' delimiter and UTF-8 BOM.
 */
export function generateBrazilianCsv(result: ExtractionResult): string {
  const headers = [
    'Data Completa',
    'Dia da Folha',
    'Dia da Semana',
    'Frota',
    'Motorista',
    'KM Inicial',
    'KM Final',
    'KM Produtivo',
    'Fazenda',
    'Turno',
    'Observações',
  ];

  const escapeCsv = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = result.registros.map((item: RegistroItem) => {
    return [
      escapeCsv(item.data),
      escapeCsv(item.dia !== undefined && item.dia !== null ? item.dia : ''),
      escapeCsv(item.dia_semana),
      escapeCsv(item.frota),
      escapeCsv(item.motorista),
      escapeCsv(item.km_inicial !== null ? item.km_inicial : ''),
      escapeCsv(item.km_final !== null ? item.km_final : ''),
      escapeCsv(item.km_produtivo !== null ? item.km_produtivo : ''),
      escapeCsv(item.fazenda),
      escapeCsv(item.turno),
      escapeCsv(item.observacoes),
    ].join(';');
  });

  // Summary footer lines for completeness
  const summaryLine1 = `;;;;;;;;;`;
  const summaryLine2 = `RESUMO DO DOCUMENTO;;;;;;;;;`;
  const summaryLine3 = `Documento:;${escapeCsv(result.documento.tipo_documento)};Arquivo:;${escapeCsv(result.documento.nome_arquivo)};Período:;${escapeCsv(result.documento.data_referencia || '')};;;;`;
  const summaryLine4 = `Total Registros:;${result.resumo.total_registros};;Total KM Produtivo:;${result.resumo.total_km_produtivo};;;;;`;

  const content = [
    headers.join(';'),
    ...rows,
    summaryLine1,
    summaryLine2,
    summaryLine3,
    summaryLine4,
  ].join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens UTF-8 without gibberish
  return `\uFEFF${content}`;
}

export function downloadCsvFile(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  link.setAttribute('download', `${cleanName}_validado.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
