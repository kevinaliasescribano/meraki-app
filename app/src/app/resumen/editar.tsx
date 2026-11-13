import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Form } from '@/components/Form';
import { Btn, Empty } from '@/components/ui';
import { useData } from '@/lib/data';
import { useRemove, useSave } from '@/lib/hooks';
import { byId, options } from '@/lib/logic';

export default function ResumenForm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db } = useData();
  const save = useSave('ResumenVentas', id);
  const remove = useRemove();
  const r = byId(db.ResumenVentas, 'idResumenVenta', id);
  if (!r) return <Empty text="Entrada no encontrada" />;

  return (
    <>
      <Stack.Screen options={{ title: 'Editar resumen' }} />
      <Form
        initial={r}
        onSubmit={save}
        fields={[
          { name: 'Mercadillo', label: 'Mercadillo', type: 'select', options: options.mercadillos(db) },
          { name: 'Producto', label: 'Producto', type: 'select', options: options.productos(db) },
          { name: 'Cantidad', label: 'Cantidad', type: 'number' },
          { name: 'Ingreso', label: 'Ingreso (€)', type: 'number' },
          { name: 'Coste', label: 'Coste (€)', type: 'number' },
        ]}
      />
      <View style={{ padding: 16 }}>
        <Btn title="Borrar entrada" icon="trash-outline" variant="danger" onPress={() => remove('ResumenVentas', id, true)} />
      </View>
    </>
  );
}
