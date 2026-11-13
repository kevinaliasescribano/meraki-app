import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { colors } from '@/components/ui';

type IconName = ComponentProps<typeof Ionicons>['name'];
const icon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} size={size} color={color as string} />;

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerTitleStyle: { color: colors.text } }}>
      <Tabs.Screen name="index" options={{ title: 'Mercadillos', tabBarIcon: icon('storefront-outline') }} />
      <Tabs.Screen name="productos" options={{ title: 'Productos', tabBarIcon: icon('pricetags-outline') }} />
      <Tabs.Screen name="inventario" options={{ title: 'Inventario', tabBarIcon: icon('cube-outline') }} />
      <Tabs.Screen name="compras" options={{ title: 'Compras', tabBarIcon: icon('cart-outline') }} />
      <Tabs.Screen name="mas" options={{ title: 'Más', tabBarIcon: icon('ellipsis-horizontal') }} />
    </Tabs>
  );
}
