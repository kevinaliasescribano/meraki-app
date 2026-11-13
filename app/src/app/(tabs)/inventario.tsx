import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';
import { colors, Empty, Fab, ListItem, Screen, styles } from '@/components/ui';
import { useData } from '@/lib/data';
import { fmtNumber } from '@/lib/format';
import { stockColor, stockMaterial } from '@/lib/logic';

export default function Inventario() {
  const { db } = useData();
  const router = useRouter();
  const rows = [...db.Inventario].sort((a, b) => a.Nombre.localeCompare(b.Nombre, 'es'));

  return (
    <Screen fab={<Fab onPress={() => router.push('/material/editar')} />}>
      {rows.length === 0 && <Empty text="Todavía no hay materiales en el inventario" />}
      {rows.map((m) => {
        const stock = stockMaterial(db, m);
        return (
          <ListItem
            key={m.idObjeto}
            title={m.Nombre}
            titleStyle={{ color: stockColor(stock), fontWeight: '700' }}
            subtitle={`Stock: ${fmtNumber(stock)}`}
            onPress={() => router.push(`/material/${m.idObjeto}`)}
            right={
              m.EnlaceCompra ? (
                <Pressable hitSlop={10} onPress={() => Linking.openURL(m.EnlaceCompra!)} accessibilityLabel="Abrir enlace de compra">
                  <Ionicons name="open-outline" size={22} color={colors.primary} />
                </Pressable>
              ) : null
            }
          />
        );
      })}
      {rows.length > 0 && (
        <View style={[styles.row, { justifyContent: 'center', gap: 16, marginTop: 8 }]}>
          <Text style={{ color: '#d32f2f' }}>● &lt; 5</Text>
          <Text style={{ color: '#ef8a00' }}>● 5–9</Text>
          <Text style={{ color: '#2e7d32' }}>● ≥ 10</Text>
        </View>
      )}
    </Screen>
  );
}
