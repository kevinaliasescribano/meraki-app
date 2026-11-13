import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { colors, ListItem, Screen, Section } from '@/components/ui';
import { useData } from '@/lib/data';
import { fmtPrice } from '@/lib/format';

export default function Mas() {
  const { db } = useData();
  const router = useRouter();
  const beneficio = db.ResumenVentas.reduce((acc, r) => acc + (r.Beneficio ?? 0), 0);
  const chevron = <Ionicons name="chevron-forward" size={20} color={colors.muted} />;

  return (
    <Screen>
      <Section title="Ventas" />
      <ListItem
        title="Resumen de ventas"
        subtitle={`${db.ResumenVentas.length} entradas · beneficio ${fmtPrice(beneficio)}`}
        onPress={() => router.push('/resumen')}
        right={chevron}
      />
      <Section title="Productos" />
      <ListItem
        title="Componentes de producto"
        subtitle="Materiales que consume cada producto"
        onPress={() => router.push('/componente')}
        right={chevron}
      />
      <Section title="Datos" />
      <ListItem
        title="Importar / exportar CSV"
        subtitle="Migrar desde Google Sheets o hacer copias de seguridad"
        onPress={() => router.push('/datos')}
        right={chevron}
      />
    </Screen>
  );
}
