import { Stack, useLocalSearchParams } from 'expo-router';
import { Form } from '@/components/Form';
import { useData } from '@/lib/data';
import { useSave } from '@/lib/hooks';
import { byId } from '@/lib/logic';
import { TIPOS_PRODUCTO } from '@/lib/types';

export default function ProductoForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { db } = useData();
  const save = useSave('Productos', id);
  const p = byId(db.Productos, 'idProducto', id);
  const tipos = [...new Set([...TIPOS_PRODUCTO, ...db.Productos.map((x) => x.Tipo).filter(Boolean)])] as string[];

  return (
    <>
      <Stack.Screen options={{ title: id ? 'Editar producto' : 'Nuevo producto' }} />
      <Form
        initial={p ?? {}}
        onSubmit={save}
        fields={[
          { name: 'Nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'Tipo', label: 'Tipo', type: 'select', allowCustom: true, options: tipos.map((t) => ({ value: t, label: t })) },
          { name: 'Precio', label: 'Precio (€)', type: 'number' },
          { name: 'Peso', label: 'Peso', type: 'number' },
          { name: 'Imagen', label: 'Imagen', type: 'image' },
        ]}
      />
    </>
  );
}
