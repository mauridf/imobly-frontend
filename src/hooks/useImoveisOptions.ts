import { useQuery } from '@tanstack/react-query';
import { imovelQueries } from '@/api/imovelApi';
import { SelectOption } from '@/types/contrato';

export function useImoveisOptions() {
  const { data: imoveis = [], isLoading } = useQuery(imovelQueries.all());

  const options: SelectOption[] = imoveis
    .filter(imovel => imovel.ativo) // Apenas imóveis ativos
    .map(imovel => ({
      value: imovel.id,
      label: `${imovel.titulo} - ${imovel.endereco.cidade}/${imovel.endereco.estado}`,
      extra: {
        valorAluguelSugerido: imovel.valorAluguelSugerido,
      },
    }));

  return { options, isLoading };
}