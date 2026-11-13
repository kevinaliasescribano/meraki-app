import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Form } from '@/components/Form';
import { Btn } from '@/components/ui';
import { useData } from '@/lib/data';
import { useRemove, useSave } from '@/lib/hooks';
import { byId, options } from '@/lib/logic';

export default function ComponenteForm() {
  const { id, producto } = useLocalSearchParams<{ id?: string; producto?: string }>();
  const { db } = useData();
  const save = useSave('ComponentesProducto', id);
  const remove = useRemove();
  const c = byId(db.ComponentesProducto, 'idComponente', id);

  return (
    <>
      <Stack.Screen options={{ title: id ? 'Editar componente' : 'Nuevo componente' }} />
      <Form
        initial={c ?? { Producto: producto, CantidadPorUnidad: 1 }}
        onSubmit={save}
        fields={[
          { name: 'Producto', label: 'Producto', type: 'select', required: true, options: options.productos(db) },
          { name: 'Material', label: 'Material', type: 'select', required: true, options: options.materiales(db) },
          { name: 'CantidadPorUnidad', label: 'Cantidad por unidad', type: 'number', required: true },
        ]}
      />
      {id && (
        <View style={{ padding: 16 }}>
          <Btn title="Borrar componente" icon="trash-outline" variant="danger" onPress={() => remove('ComponentesProducto', id, true)} />
        </View>
      )}
    </>
  );
}
