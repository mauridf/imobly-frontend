import { useQuery } from '@tanstack/react-query';
import { contratoApi } from '../api/contratoApi';
import { Contrato } from '../types/contrato';

export interface ContratoOption {
  value: string;
  label: string;
  valorAluguel: number;
  diaVencimento: number;
  imovelTitulo: string;
  locatarioNome: string;
}

// Mude para export function para padronizar
export function useContratosOptions() {
  const { data: contratos = [], isLoading, error } = useQuery({
    queryKey: ['contratos', 'options'],
    queryFn: () => contratoApi.getAll(),
  });

  const options: ContratoOption[] = contratos.map((contrato: Contrato) => ({
    value: contrato.id,
    label: `${contrato.imovelTitulo} - ${contrato.locatarioNome}`,
    valorAluguel: contrato.valorAluguel,
    diaVencimento: contrato.diaVencimento,
    imovelTitulo: contrato.imovelTitulo,
    locatarioNome: contrato.locatarioNome,
  }));

  return { options, isLoading, error };
}