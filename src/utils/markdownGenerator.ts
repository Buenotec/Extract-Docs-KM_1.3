import { ExtractionResult } from '../types';

export function generateMarkdownTable(result: ExtractionResult): string {
  const lines: string[] = [];

  lines.push(`### 📄 Documento: ${result.documento.tipo_documento} (${result.documento.nome_arquivo})`);
  if (result.documento.data_referencia) {
    lines.push(`**Período/Referência:** ${result.documento.data_referencia}`);
  }
  lines.push('');
  lines.push('| Data | Dia | Frota | Motorista | KM Inicial | KM Final | KM Produtivo | Fazenda | Turno | Observações |');
  lines.push('|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|:---:|:---|');

  result.registros.forEach((reg) => {
    const data = reg.data || '-';
    const dia = reg.dia_semana || '-';
    const frota = reg.frota || '-';
    const motorista = reg.motorista || '-';
    const kmIni = typeof reg.km_inicial === 'number' && !isNaN(reg.km_inicial) ? reg.km_inicial.toLocaleString('pt-BR') : '-';
    const kmFim = typeof reg.km_final === 'number' && !isNaN(reg.km_final) ? reg.km_final.toLocaleString('pt-BR') : '-';
    const kmProd = typeof reg.km_produtivo === 'number' && !isNaN(reg.km_produtivo) ? reg.km_produtivo.toLocaleString('pt-BR') : '-';
    const fazenda = reg.fazenda || '-';
    const turno = reg.turno || '-';
    const obs = reg.observacoes ? reg.observacoes.replace(/\|/g, '/') : '-';

    lines.push(`| ${data} | ${dia} | ${frota} | ${motorista} | ${kmIni} | ${kmFim} | ${kmProd} | ${fazenda} | ${turno} | ${obs} |`);
  });

  lines.push('');
  const totalRegistros = result?.resumo?.total_registros ?? result?.registros?.length ?? 0;
  const totalKm = typeof result?.resumo?.total_km_produtivo === 'number'
    ? result.resumo.total_km_produtivo.toLocaleString('pt-BR')
    : (Number(result?.resumo?.total_km_produtivo) || 0).toLocaleString('pt-BR');

  lines.push(`**Resumo:** Total de registros: **${totalRegistros}** | KM Produtivo Total: **${totalKm} km**`);

  if (result.resumo.alertas && result.resumo.alertas.length > 0) {
    lines.push('');
    lines.push('**⚠️ Alertas / Inconsistências:**');
    result.resumo.alertas.forEach((alerta) => {
      lines.push(`- ${alerta}`);
    });
  }

  return lines.join('\n');
}
