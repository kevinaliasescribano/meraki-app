import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, View } from 'react-native';
import { Btn, Card, Empty, Field, ListItem, Screen, Section, styles } from '@/components/ui';
import { useData } from '@/lib/data';
import { fmtDate, fmtNumber, fmtPrice } from '@/lib/format';
import { useRemove } from '@/lib/hooks';
import { byId, consumoTotal, nombre, stockColor, stockMaterial } from '@/lib/logic';

export default function MaterialDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db } = useData();
  const router = useRouter();
  const remove = useRemove();
  const m = byId(db.Inventario, 'idObjeto', id);
  if (!m) return <Empty text="Material no encontrado" />;

  const stock = stockMaterial(db, m);
  const compras = db.Compras.filter((c) => c.Producto === m.idObjeto).sort((a, b) => (b.Fecha ?? '').localeCompare(a.Fecha ?? ''));
  const usos = db.ComponentesProducto.filter((c) => c.Material === m.idObjeto);

  return (
    <Screen>
      <Stack.Screen options={{ title: m.Nombre }} />
      <Card>
        <Field label="Stock actual" value={fmtNumber(stock)} valueStyle={{ color: stockColor(stock), fontWeight: '700' }} />
        <Field label="Stock inicial" value={fmtNumber(m.StockInicial)} />
        <Field label="Precio por unidad" value={fmtPrice(m.PrecioUnidad)} />
        <Field label="Valor del stock" value={fmtPrice(Math.max(stock, 0) * (m.PrecioUnidad ?? 0))} />
        <View style={styles.actions}>
          {!!m.EnlaceCompra && (
            <Btn title="Comprar" icon="open-outline" onPress={() => Linking.openURL(m.EnlaceCompra!)} />
          )}
          <Btn title="Registrar compra" icon="cart-outline" variant="secondary" onPress={() => router.push(`/compra/editar?material=${m.idObjeto}`)} />
          <Btn title="Editar" icon="create-outline" variant="secondary" onPress={() => router.push(`/material/editar?id=${m.idObjeto}`)} />
          <Btn title="Borrar" icon="trash-outline" variant="danger" onPress={() => remove('Inventario', m.idObjeto, true)} />
        </View>
      </Card>

      <Section title={`Usado en (${usos.length})`} />
      {usos.length === 0 && <Empty text="No se usa en ningún producto" />}
      {usos.map((c) => (
        <ListItem
          key={c.idComponente}
          title={nombre.producto(db, c.Producto)}
          subtitle={`${fmtNumber(c.CantidadPorUnidad)} por unidad · consumo total ${fmtNumber(consumoTotal(db, c))}`}
          onPress={() => router.push(`/producto/${c.Producto}`)}
        />
      ))}

      <Section title={`Compras (${compras.length})`} />
      {compras.length === 0 && <Empty text="Sin compras" />}
      {compras.map((c) => (
        <ListItem
          key={c.idCompra}
          title={`${fmtNumber(c.CantidadComprada)} uds × ${fmtPrice(c.PrecioUnidad)}`}
          subtitle={`${fmtDate(c.Fecha)}${c.Proveedor ? ` · ${c.Proveedor}` : ''}`}
          onPress={() => router.push(`/compra/editar?id=${c.idCompra}`)}
        />
      ))}
    </Screen>
  );
}
