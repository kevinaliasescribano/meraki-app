import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { imageUrl } from '@/lib/images';

export const colors = {
  primary: '#7b5ea7',
  primaryLight: '#efe9f7',
  background: '#f6f5f8',
  card: '#ffffff',
  text: '#1f1b24',
  muted: '#6f6879',
  border: '#e3dfe8',
  danger: '#d32f2f',
};

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Screen({ children, fab }: { children: ReactNode; fab?: ReactNode }) {
  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {fab}
    </View>
  );
}

export function Card({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      {children}
    </Pressable>
  );
}

export function ListItem({
  title,
  subtitle,
  right,
  image,
  showImage,
  onPress,
  titleStyle,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  image?: string | null;
  showImage?: boolean;
  onPress?: () => void;
  titleStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Card onPress={onPress} style={styles.row}>
      {showImage && <Thumb uri={image} />}
      <View style={styles.flex}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {right}
    </Card>
  );
}

export function Thumb({ uri, size = 56 }: { uri?: string | null; size?: number }) {
  const src = imageUrl(uri);
  const box = { width: size, height: size, borderRadius: 8 };
  return src ? (
    <Image source={{ uri: src }} style={box} resizeMode="cover" />
  ) : (
    <View style={[box, styles.thumbEmpty]}>
      <Ionicons name="image-outline" size={size / 2.5} color={colors.muted} />
    </View>
  );
}

export function Field({ label, value, valueStyle }: { label: string; value: ReactNode; valueStyle?: StyleProp<TextStyle> }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={[styles.fieldValue, valueStyle]}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}

export function Section({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function Btn({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  const fg = variant === 'primary' ? '#fff' : variant === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.btn, styles[`btn_${variant}`], (pressed || disabled) && styles.pressed]}>
      {icon && <Ionicons name={icon} size={18} color={fg} />}
      <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Fab({ onPress, icon = 'add' }: { onPress: () => void; icon?: IconName }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fab, pressed && styles.pressed]} accessibilityLabel="Añadir">
      <Ionicons name={icon} size={28} color="#fff" />
    </Pressable>
  );
}

export const Empty = ({ text }: { text: string }) => <Text style={styles.empty}>{text}</Text>;

export const Loading = () => (
  <View style={[styles.flex, styles.center]}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

export function showError(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert('Error', message);
}

export function confirm(message: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(message));
  return new Promise((resolve) =>
    Alert.alert('Confirmar', message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Borrar', style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  screen: { padding: 16, paddingBottom: 96, gap: 10, backgroundColor: colors.background, flexGrow: 1 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.6 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  thumbEmpty: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  field: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  fieldLabel: { fontSize: 12, color: colors.muted, textTransform: 'uppercase', marginBottom: 2 },
  fieldValue: { fontSize: 16, color: colors.text },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  btn_primary: { backgroundColor: colors.primary },
  btn_secondary: { backgroundColor: colors.primaryLight },
  btn_danger: { backgroundColor: '#fdecec' },
  btnText: { fontSize: 15, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
  },
  empty: { textAlign: 'center', color: colors.muted, paddingVertical: 24 },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 8 },
});
