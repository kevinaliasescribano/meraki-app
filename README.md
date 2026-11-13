# Meraki

Gestión local de mercadillos, ventas, productos e inventario (réplica de la app AppSheet documentada en `doc/`).

- `app/`: interfaz Expo (React + React Native + React Native Web) con Expo Router. Funciona en web (instalable como PWA), Android e iOS sin servidor.
- Los datos iniciales están en `app/src/data/initialDb.json`. Cada navegador guarda su copia JSON en IndexedDB; Android e iOS usan el almacenamiento privado de la app. Las imágenes se almacenan junto a los datos.

## Puesta en marcha

```bash
# Navegador
cd app && npm install && npm run web

# Expo Go / móvil (escanear QR)
cd app && npm start
```

## Producción / instalar en el smartphone

```bash
cd app && npm run build:web
npx eas-cli@latest build -p android --profile preview
```

Los datos se guardan por dispositivo y no se sincronizan entre navegador, Android e iOS. Exporta CSV regularmente desde **Más → Importar / exportar** para tener una copia o moverlos a otro dispositivo. No usamos cookies porque su límite de tamaño es demasiado pequeño para tablas e imágenes.

## Migrar datos desde Google Sheets

Exporta cada hoja como CSV y en la app ve a **Más → Importar / exportar CSV**. Importa en este orden: Mercadillos, Productos, Inventario, Ventas, Compras, ComponentesProducto, ResumenVentas. Las referencias a mercadillos/productos/materiales por nombre se convierten automáticamente a su id.
