import { useSyncExternalStore } from "react"

const stores = new Map()

function createStore(key, initialValue, isValid) {
    let snapshot

    try {
        const storedValue = window.localStorage.getItem(key)
        if (storedValue === null) {
            snapshot = { value: initialValue, error: "" }
        } else {
            const value = JSON.parse(storedValue)
            snapshot = isValid(value)
                ? { value, error: "" }
                : {
                      value: initialValue,
                      error: "Os dados salvos neste navegador estão inválidos.",
                  }
        }
    } catch {
        snapshot = {
            value: initialValue,
            error: "Não foi possível ler os dados salvos neste navegador.",
        }
    }

    const listeners = new Set()

    function notify() {
        listeners.forEach((listener) => listener())
    }

    function handleStorage(event) {
        if (event.key !== key && event.key !== null) return

        try {
            if (event.newValue === null) {
                snapshot = { value: initialValue, error: "" }
            } else {
                const value = JSON.parse(event.newValue)
                snapshot = isValid(value)
                    ? { value, error: "" }
                    : {
                          value: initialValue,
                          error: "Os dados salvos neste navegador estão inválidos.",
                      }
            }
        } catch {
            snapshot = {
                ...snapshot,
                error: "Não foi possível ler os dados salvos neste navegador.",
            }
        }
        notify()
    }

    return {
        getSnapshot: () => snapshot,
        subscribe(listener) {
            listeners.add(listener)
            window.addEventListener("storage", handleStorage)

            return () => {
                listeners.delete(listener)
                if (listeners.size === 0) {
                    window.removeEventListener("storage", handleStorage)
                }
            }
        },
        setValue(nextValue) {
            const value =
                typeof nextValue === "function"
                    ? nextValue(snapshot.value)
                    : nextValue

            try {
                window.localStorage.setItem(key, JSON.stringify(value))
                snapshot = { value, error: "" }
            } catch {
                snapshot = {
                    value,
                    error: "Não foi possível salvar os dados neste navegador.",
                }
            }

            notify()
        },
    }
}

export default function useLocalStorageState(key, initialValue, isValid) {
    if (!stores.has(key)) {
        stores.set(key, createStore(key, initialValue, isValid))
    }

    const store = stores.get(key)
    const snapshot = useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        store.getSnapshot,
    )

    return [snapshot.value, store.setValue, snapshot.error]
}
