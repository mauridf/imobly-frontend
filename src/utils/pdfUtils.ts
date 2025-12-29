import { contratoApi } from '@/api/contratoApi';

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Função específica para baixar PDF de contrato
 */
export async function baixarPDFContrato(
  id: string,
  nomeArquivo: string = `contrato-${id}.pdf`
): Promise<void> {
  try {
    const pdfBlob = await contratoApi.gerarPDF(id);
    downloadBlob(pdfBlob, nomeArquivo);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    throw error;
  }
}