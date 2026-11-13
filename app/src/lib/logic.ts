import type { Componente, Db, Material, Mercadillo, ResumenVenta, Venta } from './types';

const sum = (values: (number | null | undefined)[]) => values.reduce<number>((acc, v) => acc + (v ?? 0), 0);

export const importe = (v: Venta) => (v.Cantidad ?? 0) * (v.PrecioVenta ?? 0);

export function statsMercadillo(db: Db, m: Mercadillo) {
  const ventas = db.Ventas.filter((v) => v.Mercadillo === m.idMercadillo);
  const totalVentas = sum(ventas.map(importe));
  return {
    ventas,
    unidadesVendidas: sum(ventas.map((v) => v.Cantidad)),
    totalVentas,
    totalBeneficio: totalVentas - (m.CosteInscripcion ?? 0),
  };
}

export const unidadesVendidasProducto = (db: Db, idProducto: string) =>
  sum(db.Ventas.filter((v) => v.Producto === idProducto).map((v) => v.Cantidad));

export const consumoTotal = (db: Db, c: Componente) =>
  (c.CantidadPorUnidad ?? 0) * unidadesVendidasProducto(db, c.Producto);

/** Stock = inicial + compras − consumo por componentes − ventas de productos con el mismo nombre. */
export function stockMaterial(db: Db, m: Material) {
  const compras = sum(db.Compras.filter((c) => c.Producto === m.idObjeto).map((c) => c.CantidadComprada));
  const consumo = sum(db.ComponentesProducto.filter((c) => c.Material === m.idObjeto).map((c) => consumoTotal(db, c)));
  const ventasDirectas = sum(
    db.Productos.filter((p) => p.Nombre === m.Nombre).map((p) => unidadesVendidasProducto(db, p.idProducto)),
  );
  return (m.StockInicial ?? 0) + compras - consumo - ventasDirectas;
}

export const stockColor = (cantidad: number) => (cantidad < 5 ? '#d32f2f' : cantidad < 10 ? '#ef8a00' : '#2e7d32');

export const costeUnidadProducto = (db: Db, idProducto: string) =>
  sum(
    db.ComponentesProducto.filter((c) => c.Producto === idProducto).map((c) => {
      const material = db.Inventario.find((m) => m.idObjeto === c.Material);
      return (material?.PrecioUnidad ?? 0) * (c.CantidadPorUnidad ?? 1);
    }),
  );

export const cantidadVendidaResumen = (db: Db, r: ResumenVenta) =>
  sum(db.Ventas.filter((v) => v.Mercadillo === r.Mercadillo && v.Producto === r.Producto).map((v) => v.Cantidad));

export const byId = <T,>(rows: T[], key: keyof T, id?: string | null) =>
  id ? rows.find((r) => r[key] === id) : undefined;

const sortByLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label, 'es');

export const options = {
  mercadillos: (db: Db) =>
    db.Mercadillos.map((m) => ({ value: m.idMercadillo, label: m.Nombre })).sort(sortByLabel),
  productos: (db: Db) => db.Productos.map((p) => ({ value: p.idProducto, label: p.Nombre })).sort(sortByLabel),
  materiales: (db: Db) => db.Inventario.map((m) => ({ value: m.idObjeto, label: m.Nombre })).sort(sortByLabel),
};

export const nombre = {
  mercadillo: (db: Db, id?: string | null) => byId(db.Mercadillos, 'idMercadillo', id)?.Nombre ?? '—',
  producto: (db: Db, id?: string | null) => byId(db.Productos, 'idProducto', id)?.Nombre ?? '—',
  material: (db: Db, id?: string | null) => byId(db.Inventario, 'idObjeto', id)?.Nombre ?? '—',
};
