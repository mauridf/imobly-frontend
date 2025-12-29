import { useQuery } from '@tanstack/react-query';
import { locatarioQueries } from '@/api/locatarioApi';
import { SelectOption } from '@/types/contrato';

export function useLocatariosOptions() {
  const { data: locatarios = [], isLoading } = useQuery(locatarioQueries.all());

  const options: SelectOption[] = locatarios
    .filter(locatario => locatario.status === 'Adimplente') // Apenas locatários adimplentes
    .map(locatario => ({
      value: locatario.id,
      label: `${locatario.nome} - ${locatario.cpf}`,
    }));

  return { options, isLoading };
}