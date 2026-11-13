import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { Btn, Card, Empty, Field, ListItem, Screen, Section, styles } from '@/components/ui';
import { imageUrl } from '@/lib/images';
import { useData } from '@/lib/data';
import { fmtNumber, fmtPrice } from '@/lib/format';
import { useRemove } from '@/lib/hooks';
import { byId, costeUnidadProducto, importe, nombre, unidadesVendidasProducto } from '@/lib/logic';

export default function ProductoDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db } = useData();
  const router = useRouter();
  const remove = useRemove();
  const p = byId(db.Productos, 'idProducto', id);
  if (!p) return <Empty text="Producto no encontrado" />;

  const componentes = db.ComponentesProducto.filter((c) => c.Producto === p.idProducto);
  const ventas = db.Ventas.filter((v) => v.Producto === p.idProducto);
  const coste = costeUnidadProducto(db, p.idProducto);
  const src = imageUrl(p.Imagen);

  return (
    <Screen>
      <Stack.Screen options={{ title: p.Nombre }} />
      {src && <Image source={{ uri: src }} style={{ width: '100%', height: 220, borderRadius: 12 }} resizeMode="cover" />}
      <Card>
        <Field label="Tipo" value={p.Tipo ?? '—'} />
        <Field label="Precio" value={fmtPrice(p.Precio)} />
        <Field label="Peso" value={fmtNumber(p.Peso)} />
        <Field label="Coste de materiales por unidad" value={fmtPrice(coste)} />
        <Field label="Unidades vendidas" value={fmtNumber(unidadesVendidasProducto(db, p.idProducto))} />
        <View style={styles.actions}>
          <Btn title="Editar" icon="create-outline" variant="secondary" onPress={() => router.push(`/producto/editar?id=${p.idProducto}`)} />
          <Btn title="Borrar" icon="trash-outline" variant="danger" onPress={() => remove('Productos', p.idProducto, true)} />
        </View>
      </Card>

      <Section
        title={`Componentes (${componentes.length})`}
        action={<Btn title="Añadir" icon="add" variant="secondary" onPress={() => router.push(`/componente/editar?producto=${p.idProducto}`)} />}
      />
      {componentes.length === 0 && <Empty text="Sin materiales asociados" />}
      {componentes.map((c) => (
        <ListItem
          key={c.idComponente}
          title={nombre.material(db, c.Material)}
          subtitle={`${fmtNumber(c.CantidadPorUnidad)} por unidad`}
          onPress={() => router.push(`/componente/editar?id=${c.idComponente}`)}
        />
      ))}

      <Section title={`Ventas (${ventas.length})`} />
      {ventas.length === 0 && <Empty text="Sin ventas" />}
      {ventas.map((v) => (
        <ListItem
          key={v.idVenta}
          title={nombre.mercadillo(db, v.Mercadillo)}
          subtitle={`${fmtNumber(v.Cantidad)} × ${fmtPrice(v.PrecioVenta)}`}
          onPress={() => router.push(`/venta/editar?id=${v.idVenta}`)}
          right={<Text style={styles.title}>{fmtPrice(importe(v))}</Text>}
        />
      ))}
    </Screen>
  );
}
