import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import { Btn, Card, colors, Empty, Field, Fab, ListItem, Screen, Section, styles } from '@/components/ui';
import { useData } from '@/lib/data';
import { fmtDate, fmtNumber, fmtPrice } from '@/lib/format';
import { useRemove } from '@/lib/hooks';
import { byId, importe, nombre, statsMercadillo } from '@/lib/logic';

export default function MercadilloDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db } = useData();
  const router = useRouter();
  const remove = useRemove();
  const m = byId(db.Mercadillos, 'idMercadillo', id);
  if (!m) return <Empty text="Mercadillo no encontrado" />;

  const { ventas, unidadesVendidas, totalVentas, totalBeneficio } = statsMercadillo(db, m);

  return (
    <Screen fab={<Fab icon="cart" onPress={() => router.push(`/venta/editar?mercadillo=${m.idMercadillo}`)} />}>
      <Stack.Screen options={{ title: m.Nombre }} />
      <Card>
        <Field label="Fecha" value={fmtDate(m.Fecha)} />
        <Field label="Coste de inscripción" value={fmtPrice(m.CosteInscripcion)} />
        <Field label="Unidades vendidas" value={fmtNumber(unidadesVendidas)} />
        <Field label="Total ventas" value={fmtPrice(totalVentas)} />
        <Field
          label="Beneficio"
          value={fmtPrice(totalBeneficio)}
          valueStyle={{ color: totalBeneficio <= 0 ? '#d32f2f' : '#2e7d32', fontWeight: '700' }}
        />
        <View style={styles.actions}>
          <Btn title="Editar" icon="create-outline" variant="secondary" onPress={() => router.push(`/mercadillo/editar?id=${m.idMercadillo}`)} />
          <Btn title="Borrar" icon="trash-outline" variant="danger" onPress={() => remove('Mercadillos', m.idMercadillo, true)} />
        </View>
      </Card>

      <Section
        title={`Ventas (${ventas.length})`}
        action={<Btn title="Añadir venta" icon="add" variant="secondary" onPress={() => router.push(`/venta/editar?mercadillo=${m.idMercadillo}`)} />}
      />
      {ventas.length === 0 && <Empty text="Sin ventas en este mercadillo" />}
      {ventas.map((v) => {
        const producto = byId(db.Productos, 'idProducto', v.Producto);
        return (
          <ListItem
            key={v.idVenta}
            showImage
            image={producto?.Imagen}
            title={nombre.producto(db, v.Producto)}
            subtitle={`${fmtNumber(v.Cantidad)} × ${fmtPrice(v.PrecioVenta)}`}
            right={
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <Text style={styles.title}>{fmtPrice(importe(v))}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Editar venta de ${nombre.producto(db, v.Producto)}`}
                    onPress={() => router.push(`/venta/editar?id=${v.idVenta}&mercadillo=${m.idMercadillo}`)}
                    style={({ pressed }) => [styles.btn, styles.btn_secondary, { paddingHorizontal: 10 }, pressed && styles.pressed]}>
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Borrar venta de ${nombre.producto(db, v.Producto)}`}
                    onPress={() => remove('Ventas', v.idVenta)}
                    style={({ pressed }) => [styles.btn, styles.btn_danger, { paddingHorizontal: 10 }, pressed && styles.pressed]}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            }
          />
        );
      })}
    </Screen>
  );
}
