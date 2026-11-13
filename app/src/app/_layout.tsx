import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { Btn, colors, Loading, styles } from '@/components/ui';
import { DataProvider, useData } from '@/lib/data';

function Gate() {
  const { loading, error, db, reload } = useData();
  const empty = Object.values(db).every((rows) => rows.length === 0);
  if (loading) return <Loading />;
  if (error && empty) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text style={styles.title}>No se pudieron cargar los datos locales</Text>
        <Text style={styles.subtitle}>{error}</Text>
        <Btn title="Reintentar" icon="refresh" onPress={reload} />
      </View>
    );
  }
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Meraki' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <DataProvider>
      <StatusBar style="dark" />
      <Gate />
    </DataProvider>
  );
}
