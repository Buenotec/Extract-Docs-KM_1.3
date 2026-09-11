import { ExtractionResult } from '../types';

export interface SampleDoc {
  id: string;
  title: string;
  fileName: string;
  description: string;
  mimeType: string;
  badge: string;
  mockResult: ExtractionResult;
  createDataUrl: () => string;
}

// Function to generate a realistic canvas-drawn scanned sheet matching 46.jpeg from the user's document
export function generateFrota46Image(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 950;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - bluish-tinted lined ledger paper with slight fold/scan shading
  ctx.fillStyle = '#f0f5fb';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Slight vignette / paper tone
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 1.5;

  const rowHeight = 32;
  const startY = 40;
  const numRows = 28; // rows 4 to 31

  // Draw horizontal ledger lines
  for (let i = 0; i <= numRows; i++) {
    const y = startY + i * rowHeight;
    ctx.beginPath();
    ctx.strokeStyle = i % 2 === 0 ? '#60a5fa' : '#93c5fd';
    ctx.lineWidth = 1;
    ctx.moveTo(30, y);
    ctx.lineTo(canvas.width - 30, y);
    ctx.stroke();

    const lineNum = 4 + i;
    if (lineNum >= 6 && lineNum <= 31) {
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`${lineNum}`, 40, y - 9);
    }
  }

  // Vertical column grid lines
  const cols = [
    75,   // after day number
    155,  // after Frota (.46)
    330,  // after Motorista (LUCIANO)
    490,  // after Odometro Inicial
    650,  // after Odometro Final
    760,  // after KM Rodados
    920,  // after DIESEL
    canvas.width - 30, // after Rota / Observacoes
  ];

  cols.forEach((x) => {
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.2;
    ctx.moveTo(x, startY);
    ctx.lineTo(x, startY + numRows * rowHeight);
    ctx.stroke();
  });

  // Ink styling for handwritten entries
  ctx.fillStyle = '#172554';
  ctx.font = 'bold 19px "Courier New", "Comic Sans MS", monospace';

  // Data rows from 46.jpeg
  const rowsData = [
    { line: 6, frota: '.46', mot: 'LUCIANO', kmI: '403 414', kmF: '403 773', kmR: '359', d: '164 x 83', obs: 'RIBEIRÃO PRETO x CEL MACEDO' },
    { line: 10, frota: '.46', mot: 'LUCIANO', kmI: '403 773', kmF: '404 051', kmR: '278', d: '73', obs: '' },
    { line: 11, frota: '46', mot: 'LUCIANO', kmI: '403 051', kmF: '404 342', kmR: '291', d: '', obs: '' },
    { line: 12, frota: '.46', mot: 'LUCIANO', kmI: '404 342', kmF: '404 625', kmR: '283', d: '139', obs: '' },
    { line: 13, frota: '46', mot: 'LUCIANO', kmI: '404 625', kmF: '404 909', kmR: '284', d: '', obs: '' },
    { line: 14, frota: '.46', mot: 'LUCIANO', kmI: '404 909', kmF: '405 202', kmR: '293', d: '139', obs: '' },
    { line: 17, frota: '46', mot: 'LUCIANO', kmI: '405 202', kmF: '405 487', kmR: '285', d: '', obs: '' },
    { line: 18, frota: '.46', mot: 'LUCIANO', kmI: '405 487', kmF: '405 768', kmR: '281', d: '139', obs: '' },
    { line: 19, frota: '46', mot: 'LUCIANO', kmI: '405 768', kmF: '406 051', kmR: '283', d: '', obs: '' },
    { line: 20, frota: '46', mot: 'LUCIANO', kmI: '406 051', kmF: '406 329', kmR: '278', d: '139', obs: '' },
    { line: 21, frota: '46', mot: 'LUCIANO', kmI: '406 329', kmF: '406 608', kmR: '279', d: '', obs: '' },
    { line: 24, frota: '.46', mot: 'LUCIANO', kmI: '406 608', kmF: '406 888', kmR: '280', d: '139', obs: '' },
    { line: 25, frota: '46', mot: 'LUCIANO', kmI: '406 888', kmF: '407 167', kmR: '279', d: '', obs: '' },
    { line: 26, frota: '.46', mot: 'LUCIANO', kmI: '407 167', kmF: '407 451', kmR: '284', d: '139', obs: '' },
    { line: 27, frota: '46', mot: 'LUCIANO', kmI: '407 451', kmF: '407 734', kmR: '283', d: '', obs: '' },
    { line: 28, frota: '.46', mot: 'LUCIANO', kmI: '407 734', kmF: '408 012', kmR: '278', d: '139', obs: '' },
    { line: 31, frota: '46', mot: 'LUCIANO', kmI: '408 012', kmF: '408 301', kmR: '289', d: '', obs: '' },
  ];

  rowsData.forEach((row) => {
    const rowIndex = row.line - 4;
    const y = startY + (rowIndex + 1) * rowHeight - 9;

    ctx.fillText(row.frota, 92, y);
    ctx.fillText(row.mot, 175, y);
    ctx.fillText(row.kmI, 350, y);
    ctx.fillText(row.kmF, 508, y);
    ctx.fillText(row.kmR, 672, y);
    if (row.d) ctx.fillText(row.d, 785, y);
    if (row.obs) {
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.fillText(row.obs, 940, y);
      ctx.font = 'bold 19px "Courier New", "Comic Sans MS", monospace';
    }
  });

  // Total KM MÊS 4.887 at row 31 / footer
  const totalY = startY + (31 - 4 + 1) * rowHeight + 24;
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('KM MÊS', 675, totalY - 18);
  ctx.fillText('DIESEL', 785, totalY - 18);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.fillText('4.887', 655, totalY + 8);

  return canvas.toDataURL('image/jpeg');
}

// Function to generate a realistic canvas-drawn scanned fleet log sheet image matching the user's actual document
export function generateFleetSheetImage(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1350;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - white lined ledger paper
  ctx.fillStyle = '#fbfbfb';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Left margin line number column
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 80, canvas.height);

  // Printed Header "DATA" above line 1..31
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('DATA', 20, 28);
  ctx.fillText('VIAÇÃO UNIÃO - CONTROLE DIÁRIO DE ODÔMETRO (FROTA 045 - DANILO)', 95, 28);

  // Horizontal ruled lines for days 12 to 31
  const rowHeight = 44;
  const numRows = 21;
  const startRow = 11;

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;

  for (let i = 0; i <= numRows; i++) {
    const y = i * rowHeight + 40;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();

    // Day numbers (11 to 31)
    const lineNum = startRow + i;
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`${lineNum}`, 30, y - 14);
  }

  // Vertical column lines
  const vCols = [80, 200, 290, 440, 560, 680, 800, 940, 1120, canvas.width];
  vCols.forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, numRows * rowHeight + 40);
    ctx.stroke();
  });

  // Handwritten entries in blue ink (Row 12 to Row 31)
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 18px "Courier New", "Caveat", monospace';

  const frota45CanvasData = [
    { dia: 12, sem: 'QUARTA', frota: '045', mot: 'DANILO', ini: '488 404', fim: '488 979', prod: '575', faz: '', obs: '' },
    { dia: 13, sem: 'QUINTA', frota: '045', mot: 'DANILO', ini: '488 979', fim: '489 612', prod: '633', faz: '', obs: '' },
    { dia: 14, sem: 'SEXTA', frota: '045', mot: 'DANILO', ini: '489 612', fim: '490 076', prod: '464', faz: '', obs: '' },
    { dia: 15, sem: 'SÁBADO', frota: '', mot: '', ini: '', fim: '', prod: '', faz: '', obs: 'ENTREGA DOS EPIS DA TURMA' },
    { dia: 16, sem: 'DOMINGO', frota: '045', mot: 'DANILO', ini: '490 076', fim: '490 078', prod: '2', faz: 'ESTRELA', obs: 'GEOVANE' },
    { dia: 17, sem: 'SEGUNDA', frota: '045', mot: 'DANILO', ini: '490 078', fim: '490 179', prod: '101', faz: 'RIO VERDE', obs: 'GEOVANE' },
    { dia: 18, sem: 'TERÇA', frota: '045', mot: 'DANILO', ini: '490 179', fim: '490 220', prod: '41', faz: '', obs: '' },
    { dia: 19, sem: 'QUARTA', frota: '045', mot: 'DANILO', ini: '490 220', fim: '490 265', prod: '45', faz: '', obs: '' },
    { dia: 20, sem: 'QUINTA', frota: '045', mot: 'DANILO', ini: '490 265', fim: '490 307', prod: '42', faz: '', obs: '' },
    { dia: 21, sem: 'SEXTA', frota: '045', mot: 'DANILO', ini: '490 307', fim: '490 342', prod: '35', faz: '', obs: '' },
    { dia: 22, sem: 'SÁBADO', frota: '045', mot: 'DANILO', ini: '490 342', fim: '490 393', prod: '51', faz: '', obs: '' },
    { dia: 23, sem: 'DOMINGO', frota: '045', mot: 'DANILO', ini: '490 393', fim: '490 405', prod: '12', faz: '', obs: '' },
    { dia: 24, sem: 'SEGUNDA', frota: '045', mot: 'DANILO', ini: '490 405', fim: '490 452', prod: '47', faz: '', obs: '' },
    { dia: 25, sem: 'TERÇA', frota: '045', mot: 'DANILO', ini: '490 452', fim: '490 501', prod: '49', faz: '', obs: '' },
    { dia: 26, sem: 'QUARTA', frota: '045', mot: 'DANILO', ini: '490 501', fim: '490 550', prod: '49', faz: '', obs: '' },
    { dia: 27, sem: 'QUINTA', frota: '045', mot: 'DANILO', ini: '490 550', fim: '490 603', prod: '53', faz: '', obs: '' },
    { dia: 28, sem: 'SEXTA', frota: '045', mot: 'DANILO', ini: '490 605', fim: '490 656', prod: '51', faz: '', obs: '' },
    { dia: 29, sem: 'SÁBADO', frota: '045', mot: 'DANILO', ini: '490 658', fim: '490 680', prod: '22', faz: '', obs: '' },
    { dia: 30, sem: 'DOMINGO', frota: '045', mot: 'DANILO', ini: '490 690', fim: '490 748', prod: '58', faz: '', obs: '' },
    { dia: 31, sem: 'SEGUNDA', frota: '045', mot: 'DANILO', ini: '490 748', fim: '490 797', prod: '49', faz: '', obs: '' },
  ];

  frota45CanvasData.forEach((row, i) => {
    const y = (i + 1) * rowHeight + 40 - 14;
    ctx.fillText(row.sem, 95, y);
    if (row.frota) ctx.fillText(row.frota, 215, y);
    if (row.mot) ctx.fillText(row.mot, 305, y);
    if (row.ini) ctx.fillText(row.ini, 455, y);
    if (row.fim) ctx.fillText(row.fim, 575, y);
    if (row.prod) ctx.fillText(row.prod, 705, y);
    if (row.faz) ctx.fillText(row.faz, 820, y);
    if (row.obs) ctx.fillText(row.obs, 955, y);
  });

  return canvas.toDataURL('image/png');
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'frota-046-luciano',
    title: 'Apontamento Real - Frota 46 (Luciano)',
    fileName: '46.jpeg',
    badge: 'Folha 46.jpeg',
    description: 'Folha de controle diário da frota 46, motorista Luciano, odômetros 403.414 a 408.301, rota Ribeirão Preto x Cel Macedo e totalizador 4.887 km.',
    mimeType: 'image/jpeg',
    createDataUrl: generateFrota46Image,
    mockResult: {
      documento: {
        nome_arquivo: '46.jpeg',
        tipo_documento: 'Folha de Controle Diário de Odômetro',
        data_referencia: 'Agosto / 2026 (Dias 6 a 31)',
        mes_referencia: 8,
        ano_referencia: 2026,
      },
      registros: [
        { id: 'f46-6', dia: 6, data: '06/08/2026', dia_semana: 'Quinta-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 403414, km_final: 403773, km_produtivo: 359, fazenda: 'RIBEIRÃO PRETO x CEL MACEDO', turno: null, observacoes: 'Diesel 164x83' },
        { id: 'f46-10', dia: 10, data: '10/08/2026', dia_semana: 'Segunda-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 403773, km_final: 404051, km_produtivo: 278, fazenda: null, turno: null, observacoes: 'Diesel 73' },
        { id: 'f46-11', dia: 11, data: '11/08/2026', dia_semana: 'Terça-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 404051, km_final: 404342, km_produtivo: 291, fazenda: null, turno: null, observacoes: '' },
        { id: 'f46-12', dia: 12, data: '12/08/2026', dia_semana: 'Quarta-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 404342, km_final: 404625, km_produtivo: 283, fazenda: null, turno: null, observacoes: 'Diesel 139' },
        { id: 'f46-13', dia: 13, data: '13/08/2026', dia_semana: 'Quinta-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 404625, km_final: 404909, km_produtivo: 284, fazenda: null, turno: null, observacoes: '' },
        { id: 'f46-14', dia: 14, data: '14/08/2026', dia_semana: 'Sexta-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 404909, km_final: 405202, km_produtivo: 293, fazenda: null, turno: null, observacoes: 'Diesel 139' },
        { id: 'f46-17', dia: 17, data: '17/08/2026', dia_semana: 'Segunda-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 405202, km_final: 405487, km_produtivo: 285, fazenda: null, turno: null, observacoes: '' },
        { id: 'f46-18', dia: 18, data: '18/08/2026', dia_semana: 'Terça-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 405487, km_final: 405768, km_produtivo: 281, fazenda: null, turno: null, observacoes: 'Diesel 139' },
        { id: 'f46-19', dia: 19, data: '19/08/2026', dia_semana: 'Quarta-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 405768, km_final: 406051, km_produtivo: 283, fazenda: null, turno: null, observacoes: '' },
        { id: 'f46-20', dia: 20, data: '20/08/2026', dia_semana: 'Quinta-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 406051, km_final: 406329, km_produtivo: 278, fazenda: null, turno: null, observacoes: 'Diesel 139' },
        { id: 'f46-21', dia: 21, data: '21/08/2026', dia_semana: 'Sexta-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 406329, km_final: 406608, km_produtivo: 279, fazenda: null, turno: null, observacoes: '' },
        { id: 'f46-24', dia: 24, data: '24/08/2026', dia_semana: 'Segunda-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 406608, km_final: 406888, km_produtivo: 280, fazenda: null, turno: null, observacoes: 'Diesel 139' },
        { id: 'f46-25', dia: 25, data: '25/08/2026', dia_semana: 'Terça-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 406888, km_final: 407167, km_produtivo: 279, fazenda: null, turno: null, observacoes: '' },
        { id: 'f46-26', dia: 26, data: '26/08/2026', dia_semana: 'Quarta-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 407167, km_final: 407451, km_produtivo: 284, fazenda: null, turno: null, observacoes: 'Diesel 139' },
        { id: 'f46-27', dia: 27, data: '27/08/2026', dia_semana: 'Quinta-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 407451, km_final: 407734, km_produtivo: 283, fazenda: null, turno: null, observacoes: '' },
        { id: 'f46-28', dia: 28, data: '28/08/2026', dia_semana: 'Sexta-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 407734, km_final: 408012, km_produtivo: 278, fazenda: null, turno: null, observacoes: 'Diesel 139' },
        { id: 'f46-31', dia: 31, data: '31/08/2026', dia_semana: 'Segunda-feira', frota: '46', motorista: 'LUCIANO', km_inicial: 408012, km_final: 408301, km_produtivo: 289, fazenda: null, turno: null, observacoes: 'KM MÊS: 4.887' },
      ],
      resumo: {
        total_registros: 17,
        total_km_produtivo: 4887,
        alertas: [
          'Quilometragem contínua verificada: 403.414 a 408.301 = 4.887 km rodados',
          'Totalizador KM MÊS confere perfeitamente com a folha (4.887 km)',
        ],
      },
    },
  },
  {
    id: 'frota-045-danilo',
    title: 'Apontamento Manuscrito - Frota 045 (Danilo)',
    fileName: 'apontamento_frota_045_danilo_2026.png',
    badge: 'Manuscrito Real 2026',
    description: 'Folha pautada manuscrita com controle de odômetro, veículo 045, motorista Danilo, destinos Estrela e Rio Verde, e entrega de EPIs.',
    mimeType: 'image/png',
    createDataUrl: generateFleetSheetImage,
    mockResult: {
      documento: {
        nome_arquivo: 'apontamento_frota_045_danilo_2026.png',
        tipo_documento: 'Folha de Apontamento de Odômetro e Frota',
        data_referencia: 'Agosto / 2026 (Dias 12 a 31)',
        mes_referencia: 8,
        ano_referencia: 2026,
      },
      registros: [
        {
          id: 'reg-12',
          dia: 12,
          data: '12/08/2026',
          dia_semana: 'Quarta-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 488404,
          km_final: 488979,
          km_produtivo: 575,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 12: Odômetro inicial 488.404 / final 488.979 (575 km)',
        },
        {
          id: 'reg-13',
          dia: 13,
          data: '13/08/2026',
          dia_semana: 'Quinta-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 488979,
          km_final: 489612,
          km_produtivo: 633,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 13: Odômetro inicial 488.979 / final 489.612 (633 km)',
        },
        {
          id: 'reg-14',
          dia: 14,
          data: '14/08/2026',
          dia_semana: 'Sexta-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 489612,
          km_final: 490076,
          km_produtivo: 464,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 14: Odômetro inicial 489.612 / final 490.076 (464 km)',
        },
        {
          id: 'reg-15',
          dia: 15,
          data: '15/08/2026',
          dia_semana: 'Sábado',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: null,
          km_final: null,
          km_produtivo: 0,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 15: ENTREGA DOS EPIS DA TURMA (sem movimentação de odômetro)',
        },
        {
          id: 'reg-16',
          dia: 16,
          data: '16/08/2026',
          dia_semana: 'Domingo',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490076,
          km_final: 490078,
          km_produtivo: 2,
          fazenda: 'ESTRELA',
          turno: null,
          observacoes: 'Linha 16: Destino Estrela. Fiscal: GEOVANE (2 km)',
        },
        {
          id: 'reg-17',
          dia: 17,
          data: '17/08/2026',
          dia_semana: 'Segunda-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490078,
          km_final: 490179,
          km_produtivo: 101,
          fazenda: 'RIO VERDE',
          turno: null,
          observacoes: 'Linha 17: Destino Rio Verde. Fiscal: GEOVANE (101 km)',
        },
        {
          id: 'reg-18',
          dia: 18,
          data: '18/08/2026',
          dia_semana: 'Terça-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490179,
          km_final: 490220,
          km_produtivo: 41,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 18: Odômetro inicial 490.179 / final 490.220 (41 km)',
        },
        {
          id: 'reg-19',
          dia: 19,
          data: '19/08/2026',
          dia_semana: 'Quarta-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490220,
          km_final: 490265,
          km_produtivo: 45,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 19: Odômetro inicial 490.220 / final 490.265 (45 km)',
        },
        {
          id: 'reg-20',
          dia: 20,
          data: '20/08/2026',
          dia_semana: 'Quinta-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490265,
          km_final: 490307,
          km_produtivo: 42,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 20: Odômetro inicial 490.265 / final 490.307 (42 km)',
        },
        {
          id: 'reg-21',
          dia: 21,
          data: '21/08/2026',
          dia_semana: 'Sexta-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490307,
          km_final: 490342,
          km_produtivo: 35,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 21: Odômetro inicial 490.307 / final 490.342 (35 km)',
        },
        {
          id: 'reg-22',
          dia: 22,
          data: '22/08/2026',
          dia_semana: 'Sábado',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490342,
          km_final: 490393,
          km_produtivo: 51,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 22: Odômetro inicial 490.342 / final 490.393 (51 km)',
        },
        {
          id: 'reg-23',
          dia: 23,
          data: '23/08/2026',
          dia_semana: 'Domingo',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490393,
          km_final: 490405,
          km_produtivo: 12,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 23: Odômetro inicial 490.393 / final 490.405 (12 km)',
        },
        {
          id: 'reg-24',
          dia: 24,
          data: '24/08/2026',
          dia_semana: 'Segunda-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490405,
          km_final: 490452,
          km_produtivo: 47,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 24: Odômetro inicial 490.405 / final 490.452 (47 km)',
        },
        {
          id: 'reg-25',
          dia: 25,
          data: '25/08/2026',
          dia_semana: 'Terça-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490452,
          km_final: 490501,
          km_produtivo: 49,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 25: Odômetro inicial 490.452 / final 490.501 (49 km)',
        },
        {
          id: 'reg-26',
          dia: 26,
          data: '26/08/2026',
          dia_semana: 'Quarta-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490501,
          km_final: 490550,
          km_produtivo: 49,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 26: Odômetro inicial 490.501 / final 490.550 (49 km)',
        },
        {
          id: 'reg-27',
          dia: 27,
          data: '27/08/2026',
          dia_semana: 'Quinta-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490550,
          km_final: 490603,
          km_produtivo: 53,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 27: Odômetro inicial 490.550 / final 490.603 (53 km)',
        },
        {
          id: 'reg-28',
          dia: 28,
          data: '28/08/2026',
          dia_semana: 'Sexta-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490605,
          km_final: 490656,
          km_produtivo: 51,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 28: Odômetro inicial 490.605 / final 490.656 (51 km)',
        },
        {
          id: 'reg-29',
          dia: 29,
          data: '29/08/2026',
          dia_semana: 'Sábado',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490658,
          km_final: 490680,
          km_produtivo: 22,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 29: Odômetro inicial 490.658 / final 490.680 (22 km)',
        },
        {
          id: 'reg-30',
          dia: 30,
          data: '30/08/2026',
          dia_semana: 'Domingo',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490690,
          km_final: 490748,
          km_produtivo: 58,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 30: Odômetro inicial 490.690 / final 490.748 (58 km)',
        },
        {
          id: 'reg-31',
          dia: 31,
          data: '31/08/2026',
          dia_semana: 'Segunda-feira',
          frota: '045',
          motorista: 'DANILO',
          km_inicial: 490748,
          km_final: 490797,
          km_produtivo: 49,
          fazenda: null,
          turno: null,
          observacoes: 'Linha 31: Odômetro inicial 490.748 / final 490.797 (49 km)',
        },
      ],
      resumo: {
        total_registros: 20,
        total_km_produtivo: 2379,
        alertas: [
          'Linha 15 (SÁBADO): Sem registro de odômetro, atividade interna: ENTREGA DOS EPIS DA TURMA',
          'Quilometragem contínua verificada: 488.404 a 490.797 = 2.379 km rodados',
          'Odômetros iniciais e finais rigorosamente conferidos com a folha original manuscrita.',
        ],
      },
    },
  },
];
