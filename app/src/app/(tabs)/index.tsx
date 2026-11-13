import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Empty, Fab, ListItem, Screen, styles } from '@/components/ui';
import { useData } from '@/lib/data';
import { fmtDate, fmtPrice } from '@/lib/format';
import { statsMercadillo } from '@/lib/logic';

export default function Mercadillos() {
  const { db } = useData();
  const router = useRouter();
  const rows = [...db.Mercadillos].sort((a, b) => (b.Fecha ?? '').localeCompare(a.Fecha ?? ''));

  return (
    <Screen fab={<Fab onPress={() => router.push('/mercadillo/editar')} />}>
      {rows.length === 0 && <Empty text="Todavía no hay mercadillos" />}
      {rows.map((m) => {
        const { totalBeneficio } = statsMercadillo(db, m);
        return (
          <ListItem
            key={m.idMercadillo}
            title={m.Nombre}
            subtitle={fmtDate(m.Fecha)}
            onPress={() => router.push(`/mercadillo/${m.idMercadillo}`)}
            right={
              <Text style={[styles.title, { color: totalBeneficio <= 0 ? '#d32f2f' : '#2e7d32' }]}>
                {fmtPrice(totalBeneficio)}
              </Text>
            }
          />
        );
      })}
    </Screen>
  );
}
