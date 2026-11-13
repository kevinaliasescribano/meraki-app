import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { deleteRecord as deleteLocalRecord, importCsv as importLocalCsv, loadDb, persistDb, registerSale as registerLocalSale, saveRecord as saveLocalRecord } from './localData';
import type { Db, TableName, Venta } from './types';

interface DataContextValue {
  db: Db;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  saveRecord: (table: TableName, id: string | undefined, values: Record<string, unknown>) => Promise<void>;
  deleteRecord: (table: TableName, id: string) => Promise<void>;
  registrarVenta: (venta: Partial<Venta>) => Promise<void>;
  importCsv: (table: TableName, csv: string) => Promise<number>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db>({ Mercadillos: [], Productos: [], Ventas: [], Inventario: [], Compras: [], ComponentesProducto: [], ResumenVentas: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dbRef = useRef(db);
  const queue = useRef<Promise<void>>(Promise.resolve());

  const reload = useCallback(async () => {
    try {
      const loaded = await loadDb();
      dbRef.current = loaded;
      setDb(loaded);
      setError(null);
    } catch (e) {
      setError((e as Error).message || 'No se pudieron cargar los datos locales');
    } finally {
      setLoading(false);
    }
  }, []);

  const commit = useCallback(<T,>(operation: (current: Db) => { next: Db; result: T }) => {
    const pending = queue.current.then(async () => {
      const { next, result } = operation(dbRef.current);
      await persistDb(next);
      dbRef.current = next;
      setDb(next);
      setError(null);
      return result;
    });
    queue.current = pending.then(() => undefined, () => undefined);
    return pending;
  }, []);

  const save = useCallback((table: TableName, id: string | undefined, values: Record<string, unknown>) =>
    commit((current) => ({ next: saveLocalRecord(current, table, id, values), result: undefined })), [commit]);
  const remove = useCallback((table: TableName, id: string) =>
    commit((current) => ({ next: deleteLocalRecord(current, table, id), result: undefined })), [commit]);
  const sale = useCallback((values: Partial<Venta>) =>
    commit((current) => {
      const result = registerLocalSale(current, values);
      return { next: result.db, result: undefined };
    }), [commit]);
  const importTable = useCallback((table: TableName, csv: string) =>
    commit((current) => {
      const result = importLocalCsv(current, table, csv);
      return { next: result.db, result: result.count };
    }), [commit]);

  useEffect(() => {
    reload();
  }, [reload]);

  return <DataContext.Provider value={{ db, loading, error, reload, saveRecord: save, deleteRecord: remove, registrarVenta: sale, importCsv: importTable }}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de DataProvider');
  return ctx;
}
