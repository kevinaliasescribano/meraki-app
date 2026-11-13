export interface Mercadillo {
  idMercadillo: string;
  Nombre: string;
  Fecha: string | null;
  CosteInscripcion: number | null;
}

export interface Producto {
  idProducto: string;
  Nombre: string;
  Peso: number | null;
  Tipo: string | null;
  Precio: number | null;
  Imagen: string | null;
}

export interface Venta {
  idVenta: string;
  Mercadillo: string;
  Producto: string;
  Cantidad: number | null;
  PrecioVenta: number | null;
}

export interface Material {
  idObjeto: string;
  Nombre: string;
  StockInicial: number | null;
  PrecioUnidad: number | null;
  EnlaceCompra: string | null;
}

export interface Compra {
  idCompra: string;
  Fecha: string | null;
  Producto: string;
  CantidadComprada: number | null;
  PrecioUnidad: number | null;
  Proveedor: string | null;
}

export interface Componente {
  idComponente: string;
  Producto: string;
  Material: string;
  CantidadPorUnidad: number | null;
}

export interface ResumenVenta {
  idResumenVenta: string;
  Mercadillo: string | null;
  Producto: string | null;
  Cantidad: number | null;
  Ingreso: number | null;
  Coste: number | null;
  Beneficio: number | null;
}

export interface Db {
  Mercadillos: Mercadillo[];
  Productos: Producto[];
  Ventas: Venta[];
  Inventario: Material[];
  Compras: Compra[];
  ComponentesProducto: Componente[];
  ResumenVentas: ResumenVenta[];
}

export type TableName = keyof Db;

export const TABLE_LABELS: Record<TableName, string> = {
  Mercadillos: 'Mercadillos',
  Productos: 'Productos',
  Ventas: 'Ventas',
  Inventario: 'Inventario',
  Compras: 'Compras',
  ComponentesProducto: 'Componentes de producto',
  ResumenVentas: 'Resumen de ventas',
};

export const TIPOS_PRODUCTO = ['Jabon', 'Cera alto', 'Resina', 'Cera bajo'];
