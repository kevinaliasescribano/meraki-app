import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { parseNumber, today } from '@/lib/format';
import { ImageField } from './ImageField';
import { Select, type Option } from './Select';
import { Btn, colors, Screen, showError } from './ui';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'url' | 'select' | 'image';
  options?: Option[];
  allowCustom?: boolean;
  required?: boolean;
}

type Values = Record<string, string>;
export type FormResult = Record<string, string | number | null>;

const toValues = (fields: FieldDef[], initial: object): Values => {
  const source = initial as Record<string, unknown>;
  return Object.fromEntries(fields.map((f) => [f.name, source[f.name] == null ? '' : String(source[f.name])]));
};

export function Form({
  fields,
  initial = {},
  onSubmit,
  onFieldChange,
  submitLabel = 'Guardar',
}: {
  fields: FieldDef[];
  initial?: object;
  onSubmit: (values: FormResult) => Promise<unknown>;
  onFieldChange?: (name: string, value: string, values: Values) => Partial<Values> | void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Values>(() => toValues(fields, initial));
  const [saving, setSaving] = useState(false);

  const set = (name: string, value: string) =>
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      return { ...next, ...(onFieldChange?.(name, value, next) ?? {}) } as Values;
    });

  const submit = async () => {
    const result: FormResult = {};
    for (const f of fields) {
      const raw = values[f.name].trim();
      if (f.required && !raw) return showError(new Error(`El campo «${f.label}» es obligatorio`));
      if (f.type === 'number') {
        const n = parseNumber(raw);
        if (Number.isNaN(n)) return showError(new Error(`«${f.label}» debe ser un número`));
        result[f.name] = n;
      } else if (f.type === 'date' && raw && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return showError(new Error(`«${f.label}» debe tener formato AAAA-MM-DD`));
      } else if (f.type === 'url' && raw && !/^https?:\/\//i.test(raw)) {
        return showError(new Error(`«${f.label}» debe empezar por http:// o https://`));
      } else {
        result[f.name] = raw || null;
      }
    }
    setSaving(true);
    try {
      await onSubmit(result);
    } catch (e) {
      showError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      {fields.map((f) => (
        <View key={f.name} style={s.group}>
          <Text style={s.label}>
            {f.label}
            {f.required ? ' *' : ''}
          </Text>
          {f.type === 'select' ? (
            <Select value={values[f.name]} options={f.options ?? []} allowCustom={f.allowCustom} onChange={(v) => set(f.name, v)} />
          ) : f.type === 'image' ? (
            <ImageField value={values[f.name]} onChange={(v) => set(f.name, v)} />
          ) : f.type === 'date' ? (
            <View style={s.inline}>
              <TextInput
                style={[s.input, s.flex]}
                value={values[f.name]}
                onChangeText={(v) => set(f.name, v)}
                placeholder="AAAA-MM-DD"
              />
              <Btn title="Hoy" variant="secondary" onPress={() => set(f.name, today())} />
            </View>
          ) : (
            <TextInput
              style={s.input}
              value={values[f.name]}
              onChangeText={(v) => set(f.name, v)}
              keyboardType={f.type === 'number' ? 'decimal-pad' : f.type === 'url' ? 'url' : 'default'}
              autoCapitalize={f.type === 'url' ? 'none' : 'sentences'}
            />
          )}
        </View>
      ))}
      <View style={{ marginTop: 12 }}>
        <Btn title={saving ? 'Guardando…' : submitLabel} icon="checkmark" onPress={submit} disabled={saving} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 6 },
  inline: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    color: colors.text,
  },
});
