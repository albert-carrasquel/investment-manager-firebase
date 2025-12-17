# 🗺️ HomeFlow - Roadmap de Mejoras

Documento de seguimiento para implementación de mejoras prioritarias en HomeFlow.

---

## 🚀 **MEJORAS CRÍTICAS (Alta Prioridad)**

### ✅ 1. Dashboard / Vista General ⭐⭐⭐⭐⭐
**Estado**: ✅ COMPLETADO
**Problema**: Al entrar, el usuario no ve su situación financiera actual.
**Solución**: Agregar una vista principal con:
- [x] Total invertido (todas las inversiones activas)
- [x] P&L total de cartera
- [x] Balance cashflow del mes actual
- [x] Top 5 activos con mejor/peor rendimiento
- [x] Top 5 categorías de gastos del mes
- [x] Botones de acceso rápido a secciones
- [x] Posiciones abiertas (contador)
**Fecha inicio**: 2025-12-17 14:45
**Fecha fin**: 2025-12-17 15:10
**Implementación**:
- Nuevo estado `dashboardData` y `dashboardLoading`
- useEffect que calcula métricas en tiempo real
- UI con métricas de inversiones (5 cards)
- UI con métricas de cashflow del mes (3 cards)
- Layout de 2 columnas con Top 5 activos y Top 5 categorías
- Acciones rápidas para navegar a otras secciones
- Tab por defecto cambiado a 'dashboard' 

---

### 2. Posiciones Abiertas / Portfolio Actual ⭐⭐⭐⭐⭐
**Estado**: ⏳ PENDIENTE
**Problema**: No hay vista de "¿Qué tengo ahora?"
**Solución**: Pantalla de Portfolio que muestre:
- [ ] Por cada activo: cantidad actual, precio promedio de compra, valor actual (si integras API), P&L no realizado
- [ ] Agrupación por tipo de activo (Cripto, Acciones, Cedears)
- [ ] Diversificación en % del portfolio
**Estimación**: 2-3 días

---

### 3. Integración de Precios en Tiempo Real ⭐⭐⭐⭐
**Estado**: ⏳ PENDIENTE
**Problema**: No sabes el valor actual de tus inversiones.
**Solución**:
- [ ] APIs gratuitas: CoinGecko (crypto), Alpha Vantage (stocks), IOL API (mercado argentino)
- [ ] Calcular P&L no realizado: `(precioActual - precioPromedio) * cantidadActual`
- [ ] Mostrar en Portfolio y Dashboard
**Estimación**: 3-4 días
**Dependencias**: Requiere Portfolio implementado

---

### 4. Gráficos y Visualizaciones ⭐⭐⭐⭐
**Estado**: ⏳ PENDIENTE
**Problema**: Solo tablas, difícil entender tendencias.
**Solución** (con `recharts` o `chart.js`):
- [ ] Cashflow: Gráfico de barras mes a mes (ingresos vs gastos)
- [ ] Inversiones: Evolución del capital invertido en el tiempo
- [ ] P&L: Línea temporal del rendimiento acumulado
- [ ] Composición de portfolio: Gráfico de torta
**Estimación**: 2-3 días

---

### 5. Exportación de Datos ⭐⭐⭐⭐
**Estado**: ⏳ PENDIENTE
**Problema**: Para impuestos/contabilidad necesitas los datos fuera.
**Solución**:
- [ ] Botón "Exportar a Excel/CSV" en reportes
- [ ] Incluir: resumen ejecutivo, detalle de trades, cálculos FIFO
- [ ] Librería sugerida: `xlsx` o `papaparse`
**Estimación**: 1-2 días

---

## 📊 **MEJORAS IMPORTANTES (Media Prioridad)**

### 6. Filtros Avanzados en Portfolio
**Estado**: ⏳ PENDIENTE
- [ ] Por rango de fechas de compra
- [ ] Por rentabilidad (mostrar solo ganadores/perdedores)
- [ ] Por exchange

### 7. Alertas y Notificaciones
**Estado**: ⏳ PENDIENTE
- [ ] Recordatorio de dividendos/cupones
- [ ] Alertas de precio (si activo sube/baja X%)
- [ ] Resumen mensual automático

### 8. Análisis por Período Fiscal
**Estado**: ⏳ PENDIENTE
- [ ] Vista anual para declaración de impuestos
- [ ] Separación de ganancias de capital vs dividendos
- [ ] Cálculo automático de impuestos (configurable por país)

### 9. Búsqueda y Filtrado Rápido
**Estado**: ⏳ PENDIENTE
- [ ] Barra de búsqueda global (por activo, descripción, monto)
- [ ] Filtros persistentes (guardar búsquedas favoritas)

### 10. Transacciones Recurrentes
**Estado**: ⏳ PENDIENTE
- [ ] Template para gastos fijos (alquiler, servicios)
- [ ] Programar ingresos mensuales (sueldo)
- [ ] Un clic para duplicar última transacción

---

## 🔧 **MEJORAS TÉCNICAS (Media-Baja Prioridad)**

### 11. Performance y Escalabilidad
**Estado**: ⏳ PENDIENTE
- [ ] Paginación en reportes (si tienes >1000 transacciones)
- [ ] Índices compuestos en Firestore para queries frecuentes
- [ ] Lazy loading de datos históricos

### 12. Modo Offline
**Estado**: ⏳ PENDIENTE
- [ ] Service Worker para PWA
- [ ] Guardar datos localmente con IndexedDB
- [ ] Sincronizar cuando vuelve conexión

### 13. Seguridad Mejorada
**Estado**: ⏳ PENDIENTE
- [ ] Audit log completo (quién modificó qué y cuándo)
- [ ] Backup automático mensual
- [ ] Encriptación de datos sensibles

### 14. Testing
**Estado**: ⏳ PENDIENTE
- [ ] Tests unitarios del engine FIFO (`reporting.js`)
- [ ] Tests de integración para flows críticos
- [ ] Tests E2E con Playwright/Cypress

---

## 💡 **FEATURES AVANZADAS (Baja Prioridad - "Nice to Have")**

### 15. Comparación de Performance
**Estado**: ⏳ PENDIENTE
- [ ] Benchmark contra índices (S&P500, MERVAL, Bitcoin)
- [ ] Calculadora de "¿Qué hubiera pasado si...?"

### 16. Gestión de Múltiples Carteras
**Estado**: ⏳ PENDIENTE
- [ ] Separar portfolio personal vs inversión de largo plazo
- [ ] Vista consolidada y por cartera individual

### 17. Integración Bancaria
**Estado**: ⏳ PENDIENTE
- [ ] Importar movimientos desde CSV de bancos
- [ ] Parsers para extractos comunes (Santander, Galicia, etc.)

### 18. Análisis de Riesgo
**Estado**: ⏳ PENDIENTE
- [ ] Volatilidad del portfolio
- [ ] Sharpe Ratio, Max Drawdown
- [ ] Correlación entre activos

### 19. Modo Multi-Usuario Mejorado
**Estado**: ⏳ PENDIENTE
- [ ] Permisos granulares (admin, viewer, editor)
- [ ] Vista familiar consolidada
- [ ] Chat/comentarios en transacciones

### 20. Integraciones con Exchanges
**Estado**: ⏳ PENDIENTE
- [ ] Importar trades automáticamente desde Binance API
- [ ] Sincronización en tiempo real

---

## 🎨 **DETALLES DE UX (Mejoras Menores)**

- [ ] Breadcrumbs (Home > Reportes > Inversiones)
- [ ] Loading states mejores (Skeletons en vez de spinners)
- [ ] Confirmaciones más claras (Modal con resumen)
- [ ] Feedback visual (Animaciones suaves)
- [ ] Modo oscuro completo consistente
- [ ] Shortcuts de teclado (Ctrl+K búsqueda, Esc cerrar)
- [ ] Tooltips explicativos (sobre "P&L", "FIFO", etc.)

---

## 📈 **MÉTRICAS DE ÉXITO**

- [ ] Tiempo de carga inicial < 2 segundos
- [ ] 100% de features críticas implementadas
- [ ] 0 errores en consola de producción
- [ ] Cobertura de tests > 70%
- [ ] Lighthouse score > 90

---

## 📝 **NOTAS Y DECISIONES**

### Decisión de Stack para Gráficos
- **Opción 1**: Recharts (más React-friendly, componentes declarativos)
- **Opción 2**: Chart.js (más ligero, más control)
- **Decisión**: TBD según complejidad de gráficos necesarios

### Decisión de API de Precios
- **Crypto**: CoinGecko API (gratuita, 50 req/min)
- **Stocks US**: Alpha Vantage (gratuita, 5 req/min, 500/día)
- **Mercado ARG**: IOL API o scraping de bolsar.com
- **Decisión**: TBD según disponibilidad y rate limits

---

**Última actualización**: 2025-12-17
**Próxima revisión**: Después de implementar Dashboard
