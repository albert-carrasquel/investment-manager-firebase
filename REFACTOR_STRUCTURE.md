# HomeFlow - Refactor Structure Documentation

## ✅ Completed Refactor Phase 1

### Created Modules

#### 1. `/src/config/`
- **firebase.js**: Centralized Firebase initialization (app, auth, db)
- **constants.js**: All application constants (DEV flags, user mappings, select options)

#### 2. `/src/services/`
- **firestorePaths.js**: Centralized collection paths
- **transactionsService.js**: CRUD operations for transactions/investments
- **cashflowService.js**: CRUD operations for gastos/ingresos  
- **reportsService.js**: Report generation with client-side filtering

#### 3. `/src/utils/`
- **formatters.js**: (existing, kept as-is) Currency, decimals, dates, amounts normalization
- **validators.js**: Form validation logic for transactions, cashflow, reports
- **normalizers.js**: Data normalization before Firestore save

#### 4. `/src/components/`
- **ConfirmationModal.jsx**: (existing)
- **TransactionItem.jsx**: (existing) 
- **MetricCard.jsx**: (existing)
- **Message.jsx**: NEW - Reusable message/toast component

### Updated Files

#### `/src/App.jsx`
- ✅ Updated imports to use config/ and services/ modules
- ✅ Removed duplicate constant definitions
- ⚠️ **PENDING**: Complete integration with services (useEffect hooks need update)
- ⚠️ **PENDING**: Replace inline validation with validators.js
- ⚠️ **PENDING**: Replace inline normalization with normalizers.js
- ⚠️ **CRITICAL**: Auth logic kept intact (DEV_BYPASS_AUTH working)

## 🔄 Next Steps (Phase 2 - Not Yet Implemented)

### Short-term (Required for full refactor)
1. Update `useEffect` hooks in App.jsx to use services instead of direct Firestore calls
2. Replace `handleAddTransaction` to use `normalizeTransactionForSave()` and `createTransaction()`
3. Replace `handleAddCashflow` to use `normalizeCashflowForSave()` and `createCashflow()`
4. Replace `handleAnnulCashflow` to use `normalizeAnnulationData()` and `annulCashflow()`
5. Replace `handleSearchReports` to use `searchReports()` from reportsService
6. Replace inline validation in handlers with `validate*Fields()` functions
7. Update Message component usage throughout App.jsx

### Medium-term (Nice to have)
1. Extract feature components:
   - `/src/features/investments/InvestmentsForm.jsx`
   - `/src/features/cashflow/CashflowForm.jsx`
   - `/src/features/reports/ReportsPanel.jsx`
2. Create custom hooks:
   - `useTransactions(appId)` - encapsulate Firestore subscription
   - `useCashflows(appId, limit)` - encapsulate last N cashflows
3. Create shared UI components:
   - `FormField.jsx` - reusable form input with validation
   - `Select.jsx` - reusable select component
   - `DatePicker.jsx` - reusable date input

### Long-term (Future improvements)
1. Add TypeScript for type safety
2. Add unit tests for services and utilities
3. Add integration tests for critical flows
4. Implement proper error boundaries
5. Add loading states and skeletons
6. Implement proper Toast/notification system
7. Add Analytics tracking
8. Implement proper security rules review (TODO markers added)

## 📁 Final Folder Structure

```
src/
├── config/
│   ├── firebase.js          ✅ Created
│   └── constants.js          ✅ Created
├── services/
│   ├── firestorePaths.js    ✅ Created
│   ├── transactionsService.js ✅ Created
│   ├── cashflowService.js   ✅ Created
│   └── reportsService.js    ✅ Created
├── utils/
│   ├── formatters.js        ✅ Existing (kept)
│   ├── validators.js        ✅ Created
│   └── normalizers.js       ✅ Created
├── hooks/
│   └── (pending future creation)
├── features/
│   └── (pending future creation)
├── components/
│   ├── ConfirmationModal.jsx ✅ Existing
│   ├── TransactionItem.jsx  ✅ Existing
│   ├── MetricCard.jsx       ✅ Existing
│   └── Message.jsx          ✅ Created
├── assets/
│   └── (existing)
├── App.jsx                   🔄 Partially refactored
├── App.css                   ✅ Unchanged
├── main.jsx                  ✅ Unchanged
└── index.css                 ✅ Unchanged
```

## ⚠️ Critical Notes

### Authentication/Login - DO NOT TOUCH
- DEV_BYPASS_AUTH logic is preserved
- Login flow unchanged
- No security implementation yet (TODOs added for future)
- Direct dev access still works as before

### Testing Checklist (After completing Phase 2)
- [ ] `npm run dev` - Dev server starts
- [ ] `npm run build` - Production build succeeds
- [ ] `npm run lint` - No errors
- [ ] DEV bypass still works (enter without login)
- [ ] Create transaction (compra)
- [ ] Create transaction (venta)  
- [ ] Create cashflow (gasto)
- [ ] Create cashflow (ingreso)
- [ ] Annul cashflow entry
- [ ] Run reports (inversiones)
- [ ] Run reports (cashflow)
- [ ] All filters work correctly

## 🎯 Benefits of This Refactor

1. **Modularity**: Clear separation of concerns
2. **Reusability**: Services and utils can be used across components
3. **Maintainability**: Easy to find and update specific functionality
4. **Testability**: Services can be unit tested independently
5. **Scalability**: Easy to add new features without bloating App.jsx
6. **Type Safety Ready**: Structure supports future TypeScript migration
7. **Performance**: No changes to runtime performance
8. **Backward Compatible**: All existing data works without migration

## 📝 Commit Strategy

### Phase 1 (Current)
```bash
git add src/config/ src/services/ src/utils/validators.js src/utils/normalizers.js src/components/Message.jsx
git commit -m "refactor: create modular structure with config, services, and utilities

- Create config/ for Firebase initialization and constants
- Create services/ for Firestore operations (transactions, cashflow, reports)
- Create validators.js and normalizers.js for form logic
- Create Message.jsx component for reusable notifications
- Update App.jsx imports to use new modules
- CRITICAL: Auth/login flow unchanged (DEV_BYPASS_AUTH preserved)"
```

### Phase 2 (Next - requires completing App.jsx integration)
```bash
git commit -m "refactor: integrate services and utilities in App.jsx

- Replace inline Firestore calls with service functions
- Replace inline validation with validators
- Replace inline normalization with normalizers
- Update all handlers to use new modules
- Maintain exact same functionality and UX"
```

## 🐛 Known Issues / TODOs

- [ ] Complete App.jsx integration with new services
- [ ] Remove unused imports after full integration
- [ ] Add JSDoc comments to all service functions
- [ ] Add error handling best practices documentation
- [ ] Create migration guide for future developers
- [ ] Add performance monitoring hooks
- [ ] Review and update Firestore security rules (security TODO)
- [ ] Add rate limiting considerations (security TODO)
- [ ] Document backup/restore procedures
