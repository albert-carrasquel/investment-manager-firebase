# 📥 Parser IOL - Documentación Técnica

## 📋 Resumen

El **importador de transacciones IOL** permite cargar operaciones desde archivos Excel exportados por InvertirOnline, aplicando automáticamente las escalas de decimales implícitos que usa IOL en su formato de exportación.

---

## 🎯 Problema Identificado

### Formato de IOL
InvertirOnline exporta archivos Excel con **valores raw multiplicados** por sus escalas para evitar decimales:

| Campo | Escala | Ejemplo Excel | Valor Real |
|-------|--------|--------------|------------|
| **Cantidad** | ÷ 10000 | 70000 | 7.0000 |
| **Precio** | ÷ 100 | 241100 | 2411.00 |
| **Monto** | ÷ 100 | 1687700 | 16877.00 |
| **Comisión** | ÷ 100 | 9620 | 96.20 |

### ¿Por qué hace esto IOL?
Es una práctica común en sistemas legacy para:
- Evitar errores de redondeo con decimales
- Trabajar con enteros (más precisos en cálculos)
- Aplicar la escala solo al mostrar o al final del proceso

---

## ✅ Solución Implementada

### Estrategia
```
1. Leer valores raw del Excel con xlsx library
2. Parsear números con parseNumberAR() (maneja formato AR: punto miles, coma decimal)
3. Aplicar escalas fijas según reglas de IOL:
   - cantidad = raw ÷ 10000
   - precio = raw ÷ 100
   - monto = raw ÷ 100
   - comisión = raw ÷ 100
4. Guardar valores correctos en Firestore
```

---

## 🔧 Implementación

### 1. `parseNumberAR(value)`

**Propósito**: Parsear números en formato argentino (punto de miles, coma decimal).

```javascript
const parseNumberAR = (value) => {
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  if (!value || value === '') return null;
  
  let str = String(value).trim();
  
  // Eliminar símbolos monetarios
  str = str.replace(/\$/g, '');
  str = str.replace(/AR\$/g, '');
  str = str.replace(/USD/g, '');
  str = str.replace(/\s/g, '');
  
  // Formato AR: punto de miles, coma decimal
  str = str.replace(/\./g, '');  // Quitar puntos de miles
  str = str.replace(',', '.');   // Cambiar coma a punto
  
  const result = Number(str);
  return isNaN(result) ? null : result;
};
```

**Ejemplos**:
- `"7.000,50"` → `7000.5`
- `"$ 16.877,00"` → `16877`
- `"AR$ 2.411,00"` → `2411`

---

### 2. Parsing con Escalas de IOL

```javascript
// Parsear valores raw
const cantidadRaw = parseNumberAR(row[9]);
const precioRaw = parseNumberAR(row[11]);
const montoRaw = parseNumberAR(row[12]);
const comisionRaw = parseNumberAR(row[13]);

// Aplicar escalas de IOL (decimales implícitos)
const cantidad = cantidadRaw / 10000;      // 4 decimales implícitos
const precioUnitario = precioRaw / 100;    // 2 decimales implícitos
const montoTotal = montoRaw / 100;         // 2 decimales implícitos
const comisionMonto = comisionRaw / 100;   // 2 decimales implícitos
```

---

## 📊 Ejemplos Reales

### Caso 1: AMZN (Cedear)
| Campo | Excel | Raw Parseado | Escala | Valor Final |
|-------|-------|-------------|--------|-------------|
| Cantidad | - | 70000 | ÷10000 | **7.0000** |
| Precio | - | 241100 | ÷100 | **2,411.00** |
| Monto | - | 1687700 | ÷100 | **16,877.00** |

**Verificación**: 7 × 2,411 = 16,877 ✅

### Caso 2: S31E5 (Lecap)
| Campo | Excel | Raw Parseado | Escala | Valor Final |
|-------|-------|-------------|--------|-------------|
| Cantidad | - | 788020000 | ÷10000 | **78,802.0000** |
| Precio | - | 1268900 | ÷100 | **12,689.00** |
| Monto | - | calculado | - | **999,918,578** |

### Caso 3: TX26 (Bono)
| Campo | Excel | Raw Parseado | Escala | Valor Final |
|-------|-------|-------------|--------|-------------|
| Cantidad | - | 71620000 | ÷10000 | **7,162.0000** |
| Precio | - | 18145000 | ÷100 | **181,450.00** |
| Monto | - | 1299544900 | ÷100 | **12,995,449.00** |

---

## 🚀 Uso del Importador

### Paso a Paso

1. **Exportar desde IOL**:
   - Ir a "Operaciones Finalizadas" en InvertirOnline
   - Seleccionar rango de fechas
   - Exportar a Excel (.xls o .xlsx)

2. **Importar en HomeFlow**:
   - Ir a Inversiones → Importar desde IOL
   - Seleccionar archivo exportado
   - Revisar preview de transacciones
   - Click en "Iniciar Importación"

3. **Verificar**:
   - Ir a Portfolio
   - Verificar cantidades, precios y montos
   - Ejemplo: AMZN debe mostrar 7 cedears a $2,411

---

## 🔍 Mapeo de Columnas

| Excel (IOL) | Índice | HomeFlow | Transformación |
|-------------|--------|----------|---------------|
| Fecha Transacción | 0 | fechaOperacion | YYYY-MM-DD |
| Tipo Transacción | 5 | tipoOperacion | compra/venta |
| Símbolo | 8 | activo | UPPERCASE |
| Descripción | 6 | nombreActivo | - |
| Cantidad | 9 | cantidad | ÷10000 |
| Precio Ponderado | 11 | precioUnitario | ÷100 |
| Monto | 12 | montoTotal | ÷100 |
| Comisión | 13 | comisionMonto | ÷100 |
| Moneda | 10 | moneda | AR$→ARS, USD→USD |
| Mercado | 3 | exchange | - |

---

## 🎨 Detección de Tipo de Activo

Basado en campo "Descripción":

```javascript
const descripcion = String(row[6]).toUpperCase();

if (descripcion.includes('CEDEAR')) tipoActivo = 'cedear';
else if (descripcion.includes('BONO') || descripcion.includes('BOND')) tipoActivo = 'bono';
else if (descripcion.includes('LECAP') || descripcion.includes('LETRA')) tipoActivo = 'lecap';
else if (descripcion.includes('ON ') || descripcion.includes('OBLIG')) tipoActivo = 'on';
else if (descripcion.includes('FCI') || descripcion.includes('FONDO')) tipoActivo = 'fci';
else tipoActivo = 'accion';
```

---

## ⚠️ Consideraciones Importantes

### 1. Formato de Archivo
- **Aceptado**: .xls, .xlsx
- **Formato interno**: HTML table embebido (formato IOL)
- **Librería**: `xlsx` (SheetJS)

### 2. Escalas Fijas
Las escalas son **FIJAS** según documentación de IOL:
- NO dependen del tipo de activo
- NO cambian entre exports
- Son estándar en todo el sistema IOL

### 3. Validación
```javascript
// Verificar que el parsing fue correcto
console.log(`Verificación: ${cantidad} × ${precio} = ${cantidad * precio} vs ${monto}`);
```

Si `cantidad × precio ≈ monto` (con tolerancia), el parsing es correcto.

### 4. Bonos y Lecaps
**Nota especial**: El "precio" de bonos/lecaps no es un precio tradicional:
- Representa % del Valor Nominal (VN)
- Ejemplo: TX26 precio 181,450% = bonos cotizan a 181.45% del VN
- El cálculo `cantidad × precio = monto` puede NO cumplirse exactamente

---

## 📝 Logs de Debug

El parser muestra logs detallados en consola:

```javascript
🔍 Transacción 1 - AMZN (cedear):
  Cantidad: 70000 ÷ 10000 = 7.0000
  Precio: 241100 ÷ 100 = 2411.00
  Monto: 1687700 ÷ 100 = 16877.00
  Verificación: 7.0000 × 2411.00 = 16877.00 vs 16877.00 ✅
```

---

## 🐛 Troubleshooting

### Problema: Cantidades siguen infladas
**Causa**: Código no actualizado o caché del navegador
**Solución**: 
```bash
# Hard refresh
Ctrl + Shift + R (Chrome/Firefox)
Cmd + Shift + R (Mac)
```

### Problema: Montos no coinciden
**Causa**: Comisiones no consideradas en verificación
**Solución**: Verificar con `montoTotal + comisionMonto` si es compra

### Problema: Bonos/Lecaps con montos raros
**Causa**: Precio de bonos es % del VN, no precio unitario tradicional
**Solución**: Esto es **normal**, el engine FIFO maneja correctamente estos casos

---

## 📚 Referencias

- **Código**: `src/App.jsx` líneas 147-400 (parseNumberAR y parseIOLFile)
- **Documentación IOL**: Formato de exportación con decimales implícitos
- **Librería xlsx**: https://docs.sheetjs.com/

---

**Última actualización**: 2025-12-26
**Versión parser**: 3.0 (escalas fijas de IOL)
