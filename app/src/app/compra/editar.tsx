import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Form } from '@/components/Form';
import { Btn } from '@/components/ui';
import { useData } from '@/lib/data';
import { today } from '@/lib/format';
import { useRemove, useSave } from '@/lib/hooks';
import { byId, options } from '@/lib/logic';

export default function CompraForm() {
  const { id, material } = useLocalSearchParams<{ id?: string; material?: string }>();
  const { db } = useData();
  const save = useSave('Compras', id);
  const remove = useRemove();
  const compra = byId(db.Compras, 'idCompra', id);

  return (
    <>
      <Stack.Screen options={{ title: id ? 'Editar compra' : 'Registrar compra' }} />
      <Form
        initial={
          compra ?? {
            Fecha: today(),
            Producto: material,
            PrecioUnidad: byId(db.Inventario, 'idObjeto', material)?.PrecioUnidad,
          }
        }
        onSubmit={save}
        onFieldChange={(name, value) => {
          if (name !== 'Producto') return;
          const precio = byId(db.Inventario, 'idObjeto', value)?.PrecioUnidad;
          return precio != null ? { PrecioUnidad: String(precio) } : undefined;
        }}
        fields={[
          { name: 'Fecha', label: 'Fecha', type: 'date' },
          { name: 'Producto', label: 'Material', type: 'select', required: true, options: options.materiales(db) },
          { name: 'CantidadComprada', label: 'Cantidad comprada', type: 'number', required: true },
          { name: 'PrecioUnidad', label: 'Precio por unidad (€)', type: 'number' },
          { name: 'Proveedor', label: 'Proveedor', type: 'text' },
        ]}
      />
      {id && (
        <View style={{ padding: 16 }}>
          <Btn title="Borrar compra" icon="trash-outline" variant="danger" onPress={() => remove('Compras', id, true)} />
        </View>
      )}
    </>
  );
}
