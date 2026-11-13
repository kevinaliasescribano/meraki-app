import { useRouter } from 'expo-router';
import { Empty, Fab, ListItem, Screen, Section } from '@/components/ui';
import { useData } from '@/lib/data';
import { fmtPrice } from '@/lib/format';

export default function Productos() {
  const { db } = useData();
  const router = useRouter();

  const groups = new Map<string, typeof db.Productos>();
  for (const p of [...db.Productos].sort((a, b) => a.Nombre.localeCompare(b.Nombre, 'es'))) {
    const tipo = p.Tipo || 'Sin tipo';
    groups.set(tipo, [...(groups.get(tipo) ?? []), p]);
  }

  return (
    <Screen fab={<Fab onPress={() => router.push('/producto/editar')} />}>
      {groups.size === 0 && <Empty text="Todavía no hay productos" />}
      {[...groups.entries()]
        .sort(([a], [b]) => a.localeCompare(b, 'es'))
        .map(([tipo, productos]) => [
          <Section key={`s-${tipo}`} title={`${tipo} (${productos.length})`} />,
          ...productos.map((p) => (
            <ListItem
              key={p.idProducto}
              showImage
              image={p.Imagen}
              title={p.Nombre}
              subtitle={fmtPrice(p.Precio)}
              onPress={() => router.push(`/producto/${p.idProducto}`)}
            />
          )),
        ])}
    </Screen>
  );
}
