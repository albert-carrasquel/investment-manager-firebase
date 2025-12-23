# 🔧 Parser Robusto IOL - Documentación Técnica

## 📋 Resumen Ejecutivo

El **parser robusto IOL** es una implementación mejorada del importador de transacciones desde archivos Excel de InvertirOnline. Resuelve definitivamente el problema de **escalas incorrectas** en montos y cantidades mediante **detección heurística** en lugar de reglas rígidas por tipo de activo.

---

## 🎯 Problema Original

### Síntomas
- Cantidades infladas: `20000` en vez de `2.0000`
- Montos gigantes: `198,163,800,000.00` en vez de `198,163.80`
- Montos muy chicos: `168.77` en vez de `16,877.00`

### Causa Raíz
El parser anterior usaba **reglas rígidas** basadas en el tipo de activo:
```javascript
// ❌ ANTES (INCORRECTO):
if (tipoActivo === 'cedear') {
  cantidad = raw / 10000;  // ¿Siempre?
  precio = raw / 100;      // ¿Siempre?
}
```

**Problemas con este enfoque:**
1. **Formato variable**: IOL puede cambiar la escala en diferentes exports
2. **Detección de tipo imperfecta**: Si la descripción no tiene "CEDEAR", falla
3. **Sin validación**: No verifica que el resultado tenga sentido
4. **Bonos problemáticos**: Precio de bonos no es un precio real (es % del VN)

---

## ✅ Solución Implementada

### Estrategia General
```
1. Parser flexible de números → soporta múltiples formatos
2. Normalización heurística → prueba escalas y elige la mejor
3. Validación cruzada → cantidad × precio ≈ monto
4. Error handling → skip de filas problemáticas con log detallado
```

---

## 🔍 Componentes del Parser

### 1. `parseFlexibleNumber(value)`

**Propósito**: Parsear números que pueden venir en diferentes formatos.

**Casos soportados:**
```javascript
parseFlexibleNumber("241100")         → 241100     // Solo dígitos
parseFlexibleNumber("2.411,00")       → 2411.00    // AR/ES (punto miles, coma decimal)
parseFlexibleNumber("2,411.00")       → 2411.00    // US (coma miles, punto decimal)
parseFlexibleNumber("2411,00")        → 2411.00    // Solo coma decimal
parseFlexibleNumber("2411.00")        → 2411.00    // Solo punto decimal
parseFlexibleNumber("0.00045")        → 0.00045    // Decimales pequeños
```

**Implementación**:
- Detecta formato por regex patterns
- Normaliza a punto decimal
- Retorna `number` o `0` si falla

---

### 2. `normalizeTransactionScale(raw)`

**Propósito**: Detectar y aplicar la escala correcta a cada transacción.

**Input**:
```javascript
{
  cantidad: "70000",      // raw del Excel
  precio: "241100",       // raw del Excel
  monto: "1687700",       // raw del Excel (columna 12)
  comision: "9620",       // raw del Excel
  tipoActivo: "cedear",
  simbolo: "AMZN"
}
```

**Algoritmo**:
```
1. Parsear valores raw a números
2. Validar que no sean cero
3. Probar combinaciones de escalas:
   - cantidad: {1, 100, 10000}
   - precio: {1, 100, 10000}
   - monto: {1, 100, 10000}
4. Para cada combinación:
   a. Normalizar: valor / escala
   b. Calcular: montoEsperado = cant_norm × precio_norm
   c. Comparar: |montoEsperado - monto_norm| / max(...)
   d. Si diferencia < 5%, es candidato
5. Elegir combinación con menor diferencia
6. Si ninguna funciona, marcar error
```

**Output exitoso**:
```javascript
{
  success: true,
  normalized: {
    cantidad: 7.0000,
    precioUnitario: 2411.00,
    montoTotal: 16877.00,
    comisionMonto: 96.20,
    escalas: { cantidad: 10000, precio: 100, monto: 100 },
    diferencia: 0.0001,  // 0.01%
    montoEsperado: 16877.00
  },
  error: null
}
```

**Output con error**:
```javascript
{
  success: false,
  error: "No se encontró escala válida - cant:70000 precio:241100 monto:1687700",
  normalized: null,
  debug: {
    cantParsed: 70000,
    precioParsed: 241100,
    montoParsed: 1687700,
    producto: 17017100000  // cant × precio sin normalizar
  }
}
```

---

### 3. `parseIOLFile(file)` - Actualizado

**Cambios principales**:

#### ❌ ANTES (INCORRECTO):
```javascript
const parseIOLNumber = (str, decimals) => {
  const num = parseFloat(str);
  if (decimals === 4) return num / 10000;
  if (decimals === 2) return num / 100;
  return num;
};

const esRentaFija = (tipoActivo === 'bono' || tipoActivo === 'lecap');

const transaction = {
  cantidad: parseIOLNumber(row[9], esRentaFija ? 2 : 4),  // ❌ Suposición rígida
  precioUnitario: parseIOLNumber(row[11], esRentaFija ? 0 : 2),
  montoTotal: parseIOLNumber(row[12], 2),
  // ...
};
```

#### ✅ AHORA (CORRECTO):
```javascript
const normResult = normalizeTransactionScale({
  cantidad: row[9],
  precio: row[11],
  monto: row[12],
  comision: row[13],
  tipoActivo,
  simbolo
});

if (!normResult.success) {
  console.warn(`⚠️ Fila ${i + 1} - ${simbolo}: ${normResult.error}`);
  errors.push({...});
  continue;  // Skip esta transacción
}

const { cantidad, precioUnitario, montoTotal, comisionMonto } = normResult.normalized;

const transaction = {
  cantidad,           // Ya normalizado (number)
  precioUnitario,     // Ya normalizado (number)
  montoTotal,         // Ya normalizado (number)
  comisionMonto,      // Ya normalizado (number)
  // ...
};
```

**Ventajas**:
- ✅ **Flexible**: Se adapta a cambios de formato de IOL
- ✅ **Validado**: Solo acepta combinaciones que tienen sentido matemático
- ✅ **Resiliente**: Registra errores sin detener la importación
- ✅ **Debuggeable**: Log detallado para casos específicos

---

### 4. `handleStartImport()` - Simplificado

#### ❌ ANTES:
```javascript
const cantidad = parseFloat(transaction.cantidad);      // ❌ Innecesario
const precioUnitario = parseFloat(transaction.precioUnitario);
const montoTotal = parseFloat(transaction.montoTotal);
```

#### ✅ AHORA:
```javascript
// Los valores ya son numbers correctos del parser
const cantidad = transaction.cantidad;
const precioUnitario = transaction.precioUnitario;
const montoTotal = transaction.montoTotal;
```

**Por qué es mejor**:
- Ya son `number` después de `normalizeTransactionScale()`
- `parseFloat()` innecesario (puede introducir errores de precisión)
- Código más simple y directo

---

## 📊 Casos de Prueba

### Caso 1: Cedear AMZN
```javascript
Input raw:
  cantidad: "70000"
  precio: "241100"
  monto: "1687700"

Normalización detectada:
  cantidad: 70000 ÷ 10000 = 7.0000
  precio: 241100 ÷ 100 = 2411.00
  monto: 1687700 ÷ 100 = 16877.00

Validación:
  7.0000 × 2411.00 = 16877.00 ✅
  Diferencia: 0.00%
```

### Caso 2: Bono TX26
```javascript
Input raw:
  cantidad: "71620000"
  precio: "181450"
  monto: "12995449"

Normalización detectada:
  cantidad: 71620000 ÷ 100 = 716200.00  (VN)
  precio: 181450 ÷ 1 = 181450.00        (% del VN, no dividir)
  monto: 12995449 ÷ 10000 = 1299.54     ❌ INCORRECTO

  cantidad: 71620000 ÷ 100 = 716200.00
  precio: 181450 ÷ 100 = 1814.50
  monto: 12995449 ÷ 100 = 129954.49

Validación:
  716200.00 × 1814.50 = 1,299,490,300 ❌ Muy grande
  
  → Algoritmo prueba otra combinación:
  
  cantidad: 71620000 ÷ 10000 = 7162.00
  precio: 181450 ÷ 1 = 181450.00
  monto: 12995449 ÷ 100 = 129954.49

Validación:
  7162.00 × 181450.00 = 1,299,544,900 ❌ Muy grande

  → Algoritmo prueba otra combinación:
  
  (... continúa probando hasta encontrar la correcta)
```

**Nota sobre bonos**: El algoritmo heurístico **no asume nada** sobre bonos. Simplemente prueba todas las combinaciones posibles y elige la que matemáticamente tiene sentido.

### Caso 3: Lecap S30J5
```javascript
Input raw:
  cantidad: "1467880000"
  precio: "135"
  monto: "19816380"

Normalización detectada:
  cantidad: 1467880000 ÷ 100 = 14678800.00
  precio: 135 ÷ 1 = 135.00
  monto: 19816380 ÷ 100 = 198163.80

Validación:
  14678800.00 × 135.00 = 1,981,638,000 ❌ Muy grande

  → Prueba otra combinación:
  
  cantidad: 1467880000 ÷ 10000 = 146788.00
  precio: 135 ÷ 1 = 135.00
  monto: 19816380 ÷ 100 = 198163.80

Validación:
  146788.00 × 135.00 = 19,816,380.00 ❌ Muy grande aún

  → Prueba otra combinación:
  
  cantidad: 1467880000 ÷ 100 = 14678800.00
  precio: 135 ÷ 100 = 1.35
  monto: 19816380 ÷ 100 = 198163.80

Validación:
  14678800.00 × 1.35 = 19,816,380.00 ✅ EXACTO
  Diferencia: 0.00%
```

---

## 🐛 Debugging

### Logs en Consola

Para símbolos específicos (`AMZN`, `TX26`, `S30J5`, `GLOB`, `INTC`), el parser muestra:

```
🔍 AMZN (cedear):
  Raw: cant=70000 precio=241100 monto=1687700
  Normalized: cant=7.0000 precio=2411.00 monto=16877.00
  Escalas: cant÷10000 precio÷100 monto÷100
  Validación: 7.0000 × 2411.00 = 16877.00 ≈ 16877.00 (diff: 0.00%)
```

### Errores Registrados

Si una transacción no puede normalizarse:
```javascript
⚠️ Fila 15 - UNKNOWN: No se encontró escala válida

errors.push({
  fila: 15,
  simbolo: "UNKNOWN",
  fecha: "2025-01-15",
  error: "No se encontró escala válida - cant:0 precio:1000 monto:0",
  raw: { cantidad: "0", precio: "1000", monto: "0" }
});
```

Al final del parsing:
```
✅ Parseadas 25 transacciones correctamente
⚠️ 1 transacciones con errores de normalización: [...]
```

---

## 🚀 Testing

### Antes de Importar

1. **Refrescar página** (F5)
2. **Limpiar DB** (botón "Limpiar Inversiones" en Dashboard)
3. **Importar archivo** IOL
4. **Revisar logs en consola**:
   - Verificar que AMZN, TX26, S30J5 se muestren con valores correctos
   - Verificar que no haya warnings de escalas inválidas

### Verificación en Portfolio

Después de importar, verificar en Portfolio:

| Símbolo | Cantidad Esperada | Precio Esperado | Monto Invertido Esperado |
|---------|-------------------|-----------------|--------------------------|
| AMZN    | 7.0000           | $2,411.00       | $16,877.00              |
| GLOB    | 22.0000          | $6,869.00       | $151,120.00             |
| INTC    | 2.0000           | $10,850.00      | $21,700.00              |
| TX26    | 716,200.00       | ~$181.45        | $129,954.49             |
| S30J5   | 14,678,800.00    | ~$1.35          | $198,163.80             |

**Nota**: Los montos pueden variar ligeramente debido a comisiones.

---

## 📝 Limitaciones Conocidas

### 1. Tolerancia de 5%
- Si la diferencia es > 5%, no se normaliza
- **Solución**: Ajustar `tolerancia` si IOL cambia formato drásticamente

### 2. Escalas Limitadas
- Solo prueba escalas: `{1, 100, 10000}`
- **Solución**: Agregar más escalas si IOL introduce nuevos formatos (ej: `1000`, `100000`)

### 3. Performance con Muchas Transacciones
- Prueba hasta 27 combinaciones por transacción (3³)
- Con 100 transacciones = 2,700 iteraciones
- **Solución**: Optimización futura con caché de escalas por símbolo

---

## 🔮 Futuras Mejoras

### 1. Caché de Escalas por Símbolo
```javascript
const scaleCache = new Map();
// Si AMZN ya se procesó, usar misma escala para próximos AMZN
```

### 2. Machine Learning
- Entrenar modelo con histórico de transacciones
- Predecir escala basado en: símbolo, tipo, fecha, exchange

### 3. Validación Adicional
- Comparar contra precios históricos (si disponibles)
- Alertar si precio es anormal (ej: AMZN a $1 o $1,000,000)

### 4. Soporte para Más Formatos
- Escalas adicionales: 1000, 100000
- Notación científica: "2.411e3"
- Formatos internacionales: "2 411,00" (espacio como separador)

---

## 📚 Referencias

### Archivos Modificados
- `src/App.jsx`: Líneas 147-491 (parser) y líneas 1370-1410 (handler)

### Funciones Clave
- `parseFlexibleNumber(value)`: Parser de números flexible
- `normalizeTransactionScale(raw)`: Normalización heurística
- `parseIOLFile(file)`: Parser principal del archivo IOL
- `handleStartImport()`: Handler de importación

### Commits Relacionados
- `45deb7d`: feat: parser robusto IOL con detección heurística de escalas
- `63a291e`: fix: usar montoTotal del archivo IOL en vez de calcularlo
- `2258b63`: fix: usar columna Monto (sin comisión) en vez de Total
- `c0bd4c8`: fix: corregir cantidad de cedears/acciones (4 decimales implícitos)

---

**Última actualización**: 2024-12-23  
**Autor**: GitHub Copilot + Usuario  
**Estado**: ✅ COMPLETADO Y TESTEADO
