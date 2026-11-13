import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Form } from '@/components/Form';
import { Btn } from '@/components/ui';
import { useData } from '@/lib/data';
import { useRemove } from '@/lib/hooks';
import { byId, options } from '@/lib/logic';

export default function VentaForm() {
  const { id, mercadillo } = useLocalSearchParams<{ id?: string; mercadillo?: string }>();
  const { db, saveRecord, registrarVenta } = useData();
  const router = useRouter();
  const remove = useRemove();
  const venta = byId(db.Ventas, 'idVenta', id);

  const save = async (values: object) => {
    if (id) await saveRecord('Ventas', id, values as Record<string, unknown>);
    else await registrarVenta(values as Partial<import('@/lib/types').Venta>);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: id ? 'Editar venta' : 'Nueva venta' }} />
      <Form
        initial={venta ?? { Mercadillo: mercadillo, Cantidad: 1 }}
        onSubmit={save}
        submitLabel={id ? 'Guardar' : 'Registrar venta'}
        onFieldChange={(name, value) => {
          if (name !== 'Producto') return;
          const precio = byId(db.Productos, 'idProducto', value)?.Precio;
          return precio != null ? { PrecioVenta: String(precio) } : undefined;
        }}
        fields={[
          { name: 'Mercadillo', label: 'Mercadillo', type: 'select', required: true, options: options.mercadillos(db) },
          { name: 'Producto', label: 'Producto', type: 'select', required: true, options: options.productos(db) },
          { name: 'Cantidad', label: 'Cantidad', type: 'number', required: true },
          { name: 'PrecioVenta', label: 'Precio de venta (€)', type: 'number' },
        ]}
      />
      {id && !mercadillo && (
        <View style={{ padding: 16 }}>
          <Btn title="Borrar venta" icon="trash-outline" variant="danger" onPress={() => remove('Ventas', id, true)} />
        </View>
      )}
    </>
  );
}
