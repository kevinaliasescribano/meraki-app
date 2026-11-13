import { useRouter } from 'expo-router';
import { confirm, showError } from '@/components/ui';
import { useData } from './data';
import type { TableName } from './types';

export function useRemove() {
  const { deleteRecord } = useData();
  const router = useRouter();
  return async (table: TableName, id: string, goBack = false) => {
    const message = table === 'Ventas'
      ? '¿Seguro que quieres borrar este registro? También se eliminarán sus entradas del resumen de ventas.'
      : '¿Seguro que quieres borrar este registro?';
    if (!(await confirm(message))) return;
    try {
      await deleteRecord(table, id);
      if (goBack) router.back();
    } catch (e) {
      showError(e);
    }
  };
}

/** Guarda (crea o actualiza) y vuelve a la pantalla anterior. */
export function useSave(table: TableName, id?: string) {
  const { saveRecord } = useData();
  const router = useRouter();
  return async (values: object) => {
    await saveRecord(table, id, values as Record<string, unknown>);
    router.back();
  };
}
