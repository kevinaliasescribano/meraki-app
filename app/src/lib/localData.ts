import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import initialDb from '@/data/initialDb.json';
import type { Db, TableName, Venta } from './types';

const STORAGE_KEY = 'meraki.db.v1';
const KEYS: Record<TableName, string> = {
  Mercadillos: 'idMercadillo', Productos: 'idProducto', Ventas: 'idVenta', Inventario: 'idObjeto',
  Compras: 'idCompra', ComponentesProducto: 'idComponente', ResumenVentas: 'idResumenVenta',
};
const FIELDS: Record<TableName, Record<string, 'text' | 'number' | 'date' | 'image' | 'ref'>> = {
  Mercadillos: { idMercadillo: 'text', Nombre: 'text', Fecha: 'date', CosteInscripcion: 'number' },
  Productos: { idProducto: 'text', Nombre: 'text', Peso: 'number', Tipo: 'text', Precio: 'number', Imagen: 'image' },
  Ventas: { idVenta: 'text', Mercadillo: 'ref', Producto: 'ref', Cantidad: 'number', PrecioVenta: 'number' },
  Inventario: { idObjeto: 'text', Nombre: 'text', StockInicial: 'number', PrecioUnidad: 'number', EnlaceCompra: 'text' },
  Compras: { idCompra: 'text', Fecha: 'date', Producto: 'ref', CantidadComprada: 'number', PrecioUnidad: 'number', Proveedor: 'text' },
  ComponentesProducto: { idComponente: 'text', Producto: 'ref', Material: 'ref', CantidadPorUnidad: 'number' },
  ResumenVentas: { idResumenVenta: 'text', Mercadillo: 'ref', Producto: 'ref', Cantidad: 'number', Ingreso: 'number', Coste: 'number', Beneficio: 'number' },
};
const REFERENCES: Partial<Record<TableName, Record<string, { table: TableName; label: string }>>> = {
  Ventas: { Mercadillo: { table: 'Mercadillos', label: 'Nombre' }, Producto: { table: 'Productos', label: 'Nombre' } },
  Compras: { Producto: { table: 'Inventario', label: 'Nombre' } },
  ComponentesProducto: { Producto: { table: 'Productos', label: 'Nombre' }, Material: { table: 'Inventario', label: 'Nombre' } },
  ResumenVentas: { Mercadillo: { table: 'Mercadillos', label: 'Nombre' }, Producto: { table: 'Productos', label: 'Nombre' } },
};
const REQUIRED: Partial<Record<TableName, string[]>> = {
  Mercadillos: ['Nombre'], Productos: ['Nombre'], Ventas: ['Mercadillo', 'Producto'],
  Inventario: ['Nombre'], Compras: ['Producto'], ComponentesProducto: ['Producto', 'Material'],
};

const clone = (db: Db): Db => JSON.parse(JSON.stringify(db)) as Db;
const emptyDb = (): Db => clone(initialDb as Db);

function openWebStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MerakiLocal', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('json');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function storageGet(key: string) {
  if (Platform.OS !== 'web') return AsyncStorage.getItem(key);
  return openWebStorage()
    .then((db) => new Promise<string | null>((resolve, reject) => {
      const request = db.transaction('json', 'readonly').objectStore('json').get(key);
      request.onsuccess = () => resolve(typeof request.result === 'string' ? request.result : null);
      request.onerror = () => reject(request.error);
    }))
    .catch(() => window.localStorage.getItem(key));
}

function storageSet(key: string, value: string) {
  if (Platform.OS !== 'web') return AsyncStorage.setItem(key, value);
  return openWebStorage()
    .then((db) => new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('json', 'readwrite');
      transaction.objectStore('json').put(value, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    }))
    .catch(() => window.localStorage.setItem(key, value));
}

export async function loadDb(): Promise<Db> {
  const stored = await storageGet(STORAGE_KEY);
  if (!stored) return emptyDb();
  try {
    const parsed = JSON.parse(stored) as Partial<Db>;
    const seed = emptyDb();
    return {
      Mercadillos: Array.isArray(parsed.Mercadillos) ? parsed.Mercadillos : seed.Mercadillos,
      Productos: Array.isArray(parsed.Productos) ? parsed.Productos : seed.Productos,
      Ventas: Array.isArray(parsed.Ventas) ? parsed.Ventas : seed.Ventas,
      Inventario: Array.isArray(parsed.Inventario) ? parsed.Inventario : seed.Inventario,
      Compras: Array.isArray(parsed.Compras) ? parsed.Compras : seed.Compras,
      ComponentesProducto: Array.isArray(parsed.ComponentesProducto) ? parsed.ComponentesProducto : seed.ComponentesProducto,
      ResumenVentas: Array.isArray(parsed.ResumenVentas) ? parsed.ResumenVentas : seed.ResumenVentas,
    };
  } catch {
    await storageSet(STORAGE_KEY, JSON.stringify(emptyDb()));
    return emptyDb();
  }
}

export function persistDb(db: Db) {
  return storageSet(STORAGE_KEY, JSON.stringify(db));
}

export function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function validateReferences(table: TableName, row: Record<string, unknown>, db: Db) {
  for (const name of REQUIRED[table] ?? []) {
    if (row[name] == null || row[name] === '') throw new Error(`El campo ${name} es obligatorio`);
  }
  for (const [name, reference] of Object.entries(REFERENCES[table] ?? {})) {
    const value = row[name];
    if (value != null && !db[reference.table].some((item) => (item as unknown as Record<string, unknown>)[KEYS[reference.table]] === value)) {
      throw new Error(`${name}: no existe el registro seleccionado`);
    }
  }
}

export function saveRecord(db: Db, table: TableName, id: string | undefined, values: Record<string, unknown>): Db {
  const next = clone(db);
  const rows = next[table] as unknown as Record<string, unknown>[];
  const key = KEYS[table];
  const index = id ? rows.findIndex((row) => row[key] === id) : -1;
  const existing = index >= 0 ? rows[index] : undefined;
  const row = { ...existing, ...values, [key]: existing?.[key] ?? values[key] ?? newId() };
  validateReferences(table, row, next);
  if (table === 'ResumenVentas') row.Beneficio = Number(row.Ingreso ?? 0) - Number(row.Coste ?? 0);
  if (index >= 0) rows[index] = row;
  else rows.push(row);
  return next;
}

export function deleteRecord(db: Db, table: TableName, id: string): Db {
  const next = clone(db);
  const deletedSale = table === 'Ventas' ? next.Ventas.find((row) => row.idVenta === id) : undefined;
  for (const [source, references] of Object.entries(REFERENCES) as [TableName, Record<string, { table: TableName; label: string }>][]) {
    for (const [field, reference] of Object.entries(references)) {
      if (reference.table === table && (next[source] as unknown as Record<string, unknown>[]).some((row) => row[field] === id)) {
        throw new Error(`No se puede borrar: está en uso en ${source}`);
      }
    }
  }
  const key = KEYS[table];
  (next[table] as unknown as Record<string, unknown>[]) = (next[table] as unknown as Record<string, unknown>[]).filter((row) => row[key] !== id);
  if (deletedSale) {
    next.ResumenVentas = next.ResumenVentas.filter(
      (row) => row.Mercadillo !== deletedSale.Mercadillo || row.Producto !== deletedSale.Producto,
    );
  }
  return next;
}

export function registerSale(db: Db, input: Partial<Venta>): { db: Db; venta: Venta } {
  const next = clone(db);
  const sale = { Mercadillo: input.Mercadillo, Producto: input.Producto, Cantidad: input.Cantidad ?? 1, PrecioVenta: input.PrecioVenta } as Record<string, unknown>;
  validateReferences('Ventas', sale, next);
  const product = next.Productos.find((item) => item.idProducto === sale.Producto);
  const price = Number(sale.PrecioVenta ?? product?.Precio ?? 0);
  const quantity = Number(sale.Cantidad ?? 1);
  const unitCost = next.ComponentesProducto.filter((item) => item.Producto === sale.Producto).reduce((total, item) => {
    const material = next.Inventario.find((entry) => entry.idObjeto === item.Material);
    return total + (material?.PrecioUnidad ?? 0) * (item.CantidadPorUnidad ?? 1);
  }, 0);
  next.ResumenVentas.push({
    idResumenVenta: newId(), Mercadillo: sale.Mercadillo as string, Producto: sale.Producto as string,
    Cantidad: quantity, Ingreso: quantity * price, Coste: unitCost * quantity,
    Beneficio: quantity * price - unitCost * quantity,
  });
  const existing = next.Ventas.find((item) => item.Mercadillo === sale.Mercadillo && item.Producto === sale.Producto);
  let venta: Venta;
  if (existing) {
    existing.Cantidad = (existing.Cantidad ?? 0) + quantity;
    venta = existing;
  } else {
    venta = { idVenta: newId(), Mercadillo: sale.Mercadillo as string, Producto: sale.Producto as string, Cantidad: quantity, PrecioVenta: price };
    next.Ventas.push(venta);
  }
  return { db: next, venta };
}

function parseRows(csv: string): string[][] {
  const source = csv.replace(/^\uFEFF/, '');
  const firstLine = source.split(/\r?\n/, 1)[0];
  const separator = (firstLine.match(/;/g) ?? []).length > (firstLine.match(/,/g) ?? []).length ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { cell += '"'; index++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === separator) { row.push(cell); cell = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[index + 1] === '\n') index++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((items) => items.some((item) => item.trim() !== ''));
}

function parseNumber(value: string): number | null {
  let text = value.trim().replace(/[^\d,.\-]/g, '');
  if (!text) return null;
  if (text.includes(',') && text.includes('.')) {
    text = text.lastIndexOf(',') > text.lastIndexOf('.') ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
  } else if (text.includes(',')) text = text.replace(',', '.');
  const number = Number(text);
  if (Number.isNaN(number)) throw new Error(`Número no válido: ${value}`);
  return number;
}

function parseDate(value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) throw new Error(`Fecha no válida: ${value}`);
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

export function importCsv(db: Db, table: TableName, csv: string): { db: Db; count: number } {
  const [header, ...records] = parseRows(csv);
  if (!header?.length) throw new Error('El CSV debe incluir una fila de cabeceras');
  const columns = header.map((column) => column.trim());
  const next = clone(db);
  const rows = next[table] as unknown as Record<string, unknown>[];
  const key = KEYS[table];
  records.forEach((record, rowIndex) => {
    try {
      const values: Record<string, unknown> = {};
      columns.forEach((name, index) => {
        if (!(name in FIELDS[table])) return;
        const raw = (record[index] ?? '').trim();
        const type = FIELDS[table][name];
        if (type === 'number') values[name] = parseNumber(raw);
        else if (type === 'date') values[name] = parseDate(raw);
        else values[name] = raw || null;
      });
      const id = values[key] == null ? undefined : String(values[key]);
      for (const [field, reference] of Object.entries(REFERENCES[table] ?? {})) {
        const value = values[field];
        if (value == null) continue;
        const target = next[reference.table].find((item) => {
          const row = item as unknown as Record<string, unknown>;
          return row[KEYS[reference.table]] === value || row[reference.label] === value;
        }) as unknown as Record<string, unknown> | undefined;
        if (!target) throw new Error(`${field}: no se encuentra «${String(value)}»`);
        values[field] = target[KEYS[reference.table]];
      }
      const existing = id ? rows.find((row) => row[key] === id) : undefined;
      const merged = { ...existing, ...values, [key]: existing?.[key] ?? id ?? newId() };
      validateReferences(table, merged, next);
      if (table === 'ResumenVentas') merged.Beneficio = Number(merged.Ingreso ?? 0) - Number(merged.Coste ?? 0);
      if (existing) Object.assign(existing, merged);
      else rows.push(merged);
    } catch (error) {
      throw new Error(`Fila ${rowIndex + 2}: ${(error as Error).message}`);
    }
  });
  return { db: next, count: records.length };
}

export function exportCsv(db: Db, table: TableName) {
  const columns = Object.keys(FIELDS[table]);
  const escape = (value: unknown) => `"${(value == null ? '' : String(value)).replace(/"/g, '""')}"`;
  const rows = db[table] as unknown as Record<string, unknown>[];
  return `\uFEFF${[columns.map(escape).join(','), ...rows.map((row) => columns.map((column) => escape(row[column])).join(','))].join('\r\n')}`;
}