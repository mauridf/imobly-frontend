export const toUTC = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds()
  ));
};

export const formatDateForAPI = (date: string): string => {
  // Converte data no formato YYYY-MM-DD para UTC
  const d = new Date(date);
  return toUTC(d).toISOString();
};

export const formatarParaUTC = (dataString: string): string => {
  if (!dataString) return '';
  
  // Se já for ISO, converter
  if (dataString.includes('T')) {
    return new Date(dataString).toISOString();
  }
  
  // Formato YYYY-MM-DD
  const [ano, mes, dia] = dataString.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0)).toISOString();
};

export const formatarCompetencia = (competencia: string): string => {
  if (!competencia || competencia === '-infinity') {
    return 'Data inválida';
  }
  
  try {
    const date = new Date(competencia);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  } catch {
    return 'Data inválida';
  }
};

export const formatarDataISO = (ano: number, mes: number): string => {
  // Meses: 1-12
  return new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0)).toISOString();
};