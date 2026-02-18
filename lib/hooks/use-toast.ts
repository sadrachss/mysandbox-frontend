import * as React from 'react';

const TOAST_TIMEOUT = 4000;

type ToastVariant = 'default' | 'destructive' | 'success';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'DISMISS_TOAST'; id: string };

let toastCount = 0;

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return toastCount.toString();
}

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, 3) };
    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };
    default:
      return state;
  }
};

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: ToastAction) {
  memoryState = toastReducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

function toast({ title, description, variant = 'default' }: ToastOptions) {
  const id = genId();
  dispatch({
    type: 'ADD_TOAST',
    toast: { id, title, description, variant },
  });

  setTimeout(() => {
    dispatch({ type: 'DISMISS_TOAST', id });
  }, TOAST_TIMEOUT);

  return id;
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (id: string) => dispatch({ type: 'DISMISS_TOAST', id }),
  };
}

export { useToast, toast };
export type { Toast, ToastVariant };
