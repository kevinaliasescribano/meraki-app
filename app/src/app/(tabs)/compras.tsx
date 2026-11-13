import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Empty, Fab, ListItem, Screen, styles } from '@/components/ui';
import { useData } from '@/lib/data';
import { fmtDate, fmtNumber, fmtPrice } from '@/lib/format';
import { nombre } from '@/lib/logic';

export default function Compras() {
  const { db } = useData();
  const router = useRouter();
  const rows = [...db.Compras].sort((a, b) => (b.Fecha ?? '').localeCompare(a.Fecha ?? ''));

  return (
    <Screen fab={<Fab onPress={() => router.push('/compra/editar')} />}>
      {rows.length === 0 && <Empty text="Todavía no hay compras registradas" />}
      {rows.map((c) => (
        <ListItem
          key={c.idCompra}
          title={nombre.material(db, c.Producto)}
          subtitle={`${fmtDate(c.Fecha)} · ${fmtNumber(c.CantidadComprada)} uds × ${fmtPrice(c.PrecioUnidad)}${c.Proveedor ? ` · ${c.Proveedor}` : ''}`}
          onPress={() => router.push(`/compra/editar?id=${c.idCompra}`)}
          right={<Text style={styles.title}>{fmtPrice((c.CantidadComprada ?? 0) * (c.PrecioUnidad ?? 0))}</Text>}
        />
      ))}
    </Screen>
  );
}
