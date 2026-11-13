import { Stack, useLocalSearchParams } from 'expo-router';
import { Form } from '@/components/Form';
import { useData } from '@/lib/data';
import { today } from '@/lib/format';
import { useSave } from '@/lib/hooks';
import { byId } from '@/lib/logic';

export default function MercadilloForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { db } = useData();
  const save = useSave('Mercadillos', id);
  const m = byId(db.Mercadillos, 'idMercadillo', id);

  return (
    <>
      <Stack.Screen options={{ title: id ? 'Editar mercadillo' : 'Nuevo mercadillo' }} />
      <Form
        initial={m ?? { Fecha: today() }}
        onSubmit={save}
        fields={[
          { name: 'Nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'Fecha', label: 'Fecha', type: 'date' },
          { name: 'CosteInscripcion', label: 'Coste de inscripción (€)', type: 'number' },
        ]}
      />
    </>
  );
}
