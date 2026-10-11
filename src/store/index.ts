import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import expensesReducer, {
  addExpense,
  deleteExpense,
  resetToSampleData,
} from './expensesSlice';
import { saveExpensesToStorage, saveMembersToStorage } from '../utils/storage';

/**
 * Redux Toolkit Listener Middleware handles storage persistence side effects
 * completely outside of the reducers, keeping all reducers predictable and pure.
 */
export const persistenceMiddleware = createListenerMiddleware();

persistenceMiddleware.startListening({
  matcher: isAnyOf(addExpense, deleteExpense, resetToSampleData),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    saveExpensesToStorage(state.expenses.expenses);
    saveMembersToStorage(state.expenses.members);
  },
});

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(persistenceMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
