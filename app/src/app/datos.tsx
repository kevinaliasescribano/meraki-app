import { Stack } from 'expo-router';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Platform, Share, Text, TextInput, View } from 'react-native';
import { Select } from '@/components/Select';
import { Btn, Card, colors, Screen, Section, showError, styles } from '@/components/ui';
import { useData } from '@/lib/data';
import { exportCsv } from '@/lib/localData';
import { TABLE_LABELS, type TableName } from '@/lib/types';

// Orden recomendado: primero las tablas referenciadas
const TABLES: TableName[] = ['Mercadillos', 'Productos', 'Inventario', 'Ventas', 'Compras', 'ComponentesProducto', 'ResumenVentas'];

function pickFileWeb(onText: (text: string) => void) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,text/csv';
  input.onchange = () => input.files?.[0]?.text().then(onText);
  input.click();
}

export default function Datos() {
  const { db, importCsv } = useData();
  const [table, setTable] = useState<TableName>('Mercadillos');
  const [csv, setCsv] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedTable, setCopiedTable] = useState<TableName | null>(null);

  const importar = async () => {
    setBusy(true);
    setMessage('');
    try {
      const importados = await importCsv(table, csv);
      setMessage(`${importados} registros importados en ${TABLE_LABELS[table]}`);
      setCsv('');
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  const exportar = async (target: TableName) => {
    const content = exportCsv(db, target);
    if (Platform.OS === 'web') {
      const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${target}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    await Share.share({ title: `${target}.csv`, message: content });
  };

  const copiar = async (target: TableName) => {
    try {
      const content = db[target].map((record) => JSON.stringify(record)).join(',\n');
      await Clipboard.setStringAsync(content);
      setCopiedTable(target);
    } catch (e) {
      showError(e);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Importar / exportar' }} />
      <Text style={styles.subtitle}>Los datos se guardan solo en este dispositivo. Usa la exportación CSV para hacer copias o trasladarlos.</Text>
      <Section title="Exportar a CSV" />
      {TABLES.map((t) => (
        <Card key={t} style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.title}>{TABLE_LABELS[t]}</Text>
            <Text style={styles.subtitle}>{db[t].length} registros</Text>
          </View>
          <Btn
            title={copiedTable === t ? 'Copiado' : 'JSON'}
            icon={copiedTable === t ? 'checkmark-outline' : 'copy-outline'}
            variant="secondary"
            onPress={() => copiar(t)}
          />
          <Btn title="CSV" icon="download-outline" variant="secondary" onPress={() => exportar(t)} />
        </Card>
      ))}

      <Section title="Importar desde CSV" />
      <Card style={{ gap: 10 }}>
        <Text style={styles.subtitle}>
          Exporta cada hoja de Google Sheets como CSV e impórtala en este orden: Mercadillos, Productos, Inventario y
          después el resto. Los registros con la misma clave se actualizan.
        </Text>
        <Select
          value={table}
          options={TABLES.map((t) => ({ value: t, label: TABLE_LABELS[t] }))}
          onChange={(v) => setTable(v as TableName)}
        />
        {Platform.OS === 'web' && (
          <Btn title="Elegir archivo CSV" icon="document-outline" variant="secondary" onPress={() => pickFileWeb(setCsv)} />
        )}
        <TextInput
          style={{
            minHeight: 140,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 10,
            backgroundColor: '#fff',
            fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
            textAlignVertical: 'top',
          }}
          multiline
          placeholder="Pega aquí el contenido del CSV (con cabecera)"
          value={csv}
          onChangeText={setCsv}
        />
        <Btn title={busy ? 'Importando…' : 'Importar'} icon="cloud-upload-outline" onPress={importar} disabled={busy || !csv.trim()} />
        {!!message && <Text style={{ color: '#2e7d32' }}>{message}</Text>}
      </Card>
    </Screen>
  );
}
