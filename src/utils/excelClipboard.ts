import { ExtractionResult, RegistroItem } from '../types';

/**
 * Builds Tab-Separated Values (TSV) string specifically engineered for Microsoft Excel and Google Sheets.
 * In Excel, tabs (\t) separate columns and newlines (\r\n) separate rows.
 */
export function buildExcelTsv(
  result: ExtractionResult,
  options?: { includeHeaders?: boolean }
): string {
  const includeHeaders = options?.includeHeaders !== false;

  const headers = [
    'Dia',
    'Data Completa',
    'Dia da Semana',
    'Frota',
    'Motorista',
    'KM Inicial',
    'KM Final',
    'KM Produtivo',
    'Fazenda / Destino',
    'Turno',
    'Observações / Caligrafia',
  ];

  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(headers.join('\t'));
  }

  result.registros.forEach((item: RegistroItem) => {
    const row = [
      item.dia !== undefined && item.dia !== null ? String(item.dia) : '',
      item.data || '',
      item.dia_semana || '',
      item.frota || '',
      item.motorista || '',
      item.km_inicial !== null && item.km_inicial !== undefined ? String(item.km_inicial) : '',
      item.km_final !== null && item.km_final !== undefined ? String(item.km_final) : '',
      item.km_produtivo !== null && item.km_produtivo !== undefined ? String(item.km_produtivo) : '0',
      item.fazenda || '',
      item.turno || '',
      item.observacoes || '',
    ];

    // Clean any accidental tabs or newlines within cell values to prevent breaking TSV structure
    const cleanedRow = row.map((cell) =>
      cell.replace(/[\t\r\n]+/g, ' ').trim()
    );

    lines.push(cleanedRow.join('\t'));
  });

  return lines.join('\r\n');
}

/**
 * Builds HTML table string for clipboard (text/html).
 * Excel prioritizes text/html if available and renders clean cell boundaries and bold headers.
 */
export function buildExcelHtml(
  result: ExtractionResult,
  options?: { includeHeaders?: boolean }
): string {
  const includeHeaders = options?.includeHeaders !== false;

  let html = `<style>
    table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
    th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; border: 1px solid #cbd5e1; padding: 6px 10px; }
    td { border: 1px solid #e2e8f0; padding: 5px 10px; }
    .num { text-align: right; }
    .center { text-align: center; }
  </style><table>`;

  if (includeHeaders) {
    html += `<thead><tr>
      <th class="center">Dia</th>
      <th>Data Completa</th>
      <th>Dia da Semana</th>
      <th class="center">Frota</th>
      <th>Motorista</th>
      <th class="num">KM Inicial</th>
      <th class="num">KM Final</th>
      <th class="num">KM Produtivo</th>
      <th>Fazenda / Destino</th>
      <th>Turno</th>
      <th>Observações / Caligrafia</th>
    </tr></thead>`;
  }

  html += '<tbody>';
  result.registros.forEach((item: RegistroItem) => {
    html += `<tr>
      <td class="center">${item.dia !== undefined && item.dia !== null ? item.dia : ''}</td>
      <td>${item.data || ''}</td>
      <td>${item.dia_semana || ''}</td>
      <td class="center">${item.frota || ''}</td>
      <td>${item.motorista || ''}</td>
      <td class="num">${item.km_inicial !== null && item.km_inicial !== undefined ? item.km_inicial : ''}</td>
      <td class="num">${item.km_final !== null && item.km_final !== undefined ? item.km_final : ''}</td>
      <td class="num">${item.km_produtivo !== null && item.km_produtivo !== undefined ? item.km_produtivo : 0}</td>
      <td>${item.fazenda || ''}</td>
      <td>${item.turno || ''}</td>
      <td>${item.observacoes || ''}</td>
    </tr>`;
  });
  html += '</tbody></table>';

  return html;
}

/**
 * Copies the entire extraction result to clipboard in both TSV and HTML formats
 * for 100% compatibility when pasting directly into Excel (Ctrl+V).
 */
export async function copyTableToExcelClipboard(
  result: ExtractionResult,
  options?: { includeHeaders?: boolean }
): Promise<boolean> {
  const tsv = buildExcelTsv(result, options);
  const html = buildExcelHtml(result, options);

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const textBlob = new Blob([tsv], { type: 'text/plain' });
      const htmlBlob = new Blob([html], { type: 'text/html' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob,
        }),
      ]);
      return true;
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tsv);
      return true;
    } else {
      // Fallback using textarea
      const textArea = document.createElement('textarea');
      textArea.value = tsv;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Falha ao copiar para o Excel:', err);
    // Fallback try simple writeText
    try {
      await navigator.clipboard.writeText(tsv);
      return true;
    } catch {
      return false;
    }
  }
}
