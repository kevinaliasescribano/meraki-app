import { Stack, useRouter } from 'expo-router';
import { Empty, Fab, ListItem, Screen, Section } from '@/components/ui';
import { useData } from '@/lib/data';
import { fmtNumber } from '@/lib/format';
import { consumoTotal, nombre } from '@/lib/logic';

export default function Componentes() {
  const { db } = useData();
  const router = useRouter();
  const productos = [...new Set(db.ComponentesProducto.map((c) => c.Producto))].sort((a, b) =>
    nombre.producto(db, a).localeCompare(nombre.producto(db, b), 'es'),
  );

  return (
    <Screen fab={<Fab onPress={() => router.push('/componente/editar')} />}>
      <Stack.Screen options={{ title: 'Componentes de producto' }} />
      {productos.length === 0 && <Empty text="Todavía no hay componentes definidos" />}
      {productos.map((idProducto) => [
        <Section key={`s-${idProducto}`} title={nombre.producto(db, idProducto)} />,
        ...db.ComponentesProducto.filter((c) => c.Producto === idProducto).map((c) => (
          <ListItem
            key={c.idComponente}
            title={nombre.material(db, c.Material)}
            subtitle={`${fmtNumber(c.CantidadPorUnidad)} por unidad · consumo total ${fmtNumber(consumoTotal(db, c))}`}
            onPress={() => router.push(`/componente/editar?id=${c.idComponente}`)}
          />
        )),
      ])}
    </Screen>
  );
}
