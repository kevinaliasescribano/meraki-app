import { Stack, useLocalSearchParams } from 'expo-router';
import { Form } from '@/components/Form';
import { useData } from '@/lib/data';
import { useSave } from '@/lib/hooks';
import { byId } from '@/lib/logic';

export default function MaterialForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { db } = useData();
  const save = useSave('Inventario', id);
  const m = byId(db.Inventario, 'idObjeto', id);

  return (
    <>
      <Stack.Screen options={{ title: id ? 'Editar material' : 'Nuevo material' }} />
      <Form
        initial={m ?? { StockInicial: 0 }}
        onSubmit={save}
        fields={[
          { name: 'Nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'StockInicial', label: 'Stock inicial', type: 'number' },
          { name: 'PrecioUnidad', label: 'Precio por unidad (€)', type: 'number' },
          { name: 'EnlaceCompra', label: 'Enlace de compra', type: 'url' },
        ]}
      />
    </>
  );
}
