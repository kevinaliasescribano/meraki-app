import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from './ui';

export interface Option {
  value: string;
  label: string;
}

export function Select({
  value,
  options,
  onChange,
  placeholder = 'Seleccionar…',
  allowCustom,
}: {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value)?.label ?? value;
  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  );
  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <Pressable style={s.input} onPress={() => setOpen(true)}>
        <Text style={[s.text, !selected && s.placeholder]} numberOfLines={1}>
          {selected || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={s.backdrop}>
          <View style={s.sheet}>
            <View style={s.header}>
              <TextInput
                style={[s.input, s.flex]}
                placeholder="Buscar…"
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={26} color={colors.text} />
              </Pressable>
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(o) => o.value}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                allowCustom && query.trim() && !options.some((o) => o.label === query.trim()) ? (
                  <Pressable style={s.option} onPress={() => pick(query.trim())}>
                    <Text style={s.text}>Usar «{query.trim()}»</Text>
                  </Pressable>
                ) : undefined
              }
              renderItem={({ item }) => (
                <Pressable style={s.option} onPress={() => pick(item.value)}>
                  <Text style={[s.text, item.value === value && s.active]}>{item.label}</Text>
                </Pressable>
              )}
              ListEmptyComponent={<Text style={[s.text, s.placeholder, s.option]}>Sin resultados</Text>}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  text: { fontSize: 16, color: colors.text, flexShrink: 1 },
  placeholder: { color: colors.muted },
  active: { color: colors.primary, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: '50%',
    padding: 16,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  option: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
});
