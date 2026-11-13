import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { View } from 'react-native';
import { Btn, showError, styles, Thumb } from './ui';

export function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5, base64: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      const dataUri = asset.uri.match(/^data:(image\/[\w+.-]+);base64,(.*)$/);
      const mime = dataUri?.[1] ?? 'image/jpeg';
      const data = dataUri?.[2] ?? asset.base64;
      if (!data) throw new Error('No se pudo leer la imagen');
      onChange(`data:${mime};base64,${data}`);
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.row, { flexWrap: 'wrap' }]}>
      <Thumb uri={value} size={96} />
      <View style={{ gap: 8 }}>
        <Btn title={busy ? 'Subiendo…' : 'Elegir imagen'} icon="image" variant="secondary" onPress={pick} disabled={busy} />
        {!!value && <Btn title="Quitar" icon="trash" variant="danger" onPress={() => onChange('')} />}
      </View>
    </View>
  );
}
