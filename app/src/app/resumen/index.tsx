import { Stack, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Card, Empty, Field, ListItem, Screen, Section, styles } from '@/components/ui';
import { useData } from '@/lib/data';
import { fmtNumber, fmtPrice } from '@/lib/format';
import { nombre } from '@/lib/logic';

export default function Resumen() {
  const { db } = useData();
  const router = useRouter();
  const total = (key: 'Ingreso' | 'Coste' | 'Beneficio') => db.ResumenVentas.reduce((acc, r) => acc + (r[key] ?? 0), 0);
  const mercadillos = [...new Set(db.ResumenVentas.map((r) => r.Mercadillo ?? ''))];

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Resumen de ventas' }} />
      <Card>
        <Field label="Ingresos" value={fmtPrice(total('Ingreso'))} />
        <Field label="Coste de materiales" value={fmtPrice(total('Coste'))} />
        <Field label="Beneficio" value={fmtPrice(total('Beneficio'))} valueStyle={{ fontWeight: '700' }} />
      </Card>
      {mercadillos.length === 0 && <Empty text="Todavía no hay ventas registradas" />}
      {mercadillos.map((idM) => [
        <Section key={`s-${idM}`} title={nombre.mercadillo(db, idM)} />,
        ...db.ResumenVentas.filter((r) => (r.Mercadillo ?? '') === idM).map((r) => (
          <ListItem
            key={r.idResumenVenta}
            title={nombre.producto(db, r.Producto)}
            subtitle={`${fmtNumber(r.Cantidad)} uds · ingreso ${fmtPrice(r.Ingreso)} · coste ${fmtPrice(r.Coste)}`}
            onPress={() => router.push(`/resumen/editar?id=${r.idResumenVenta}`)}
            right={
              <Text style={[styles.title, { color: (r.Beneficio ?? 0) < 0 ? '#d32f2f' : '#2e7d32' }]}>
                {fmtPrice(r.Beneficio)}
              </Text>
            }
          />
        )),
      ])}
    </Screen>
  );
}
