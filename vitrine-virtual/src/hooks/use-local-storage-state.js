import { useSyncExternalStore } from "react"

const stores = new Map()

// Cria um armazenamento compartilhado e sincronizado com o localStorage.
function criarArmazenamento(chave, valorInicial, validar) {
    let snapshot

    try {
        const valorSalvo = window.localStorage.getItem(chave)
        if (valorSalvo === null) {
            snapshot = { value: valorInicial, error: "" }
        } else {
            const valor = JSON.parse(valorSalvo)
            snapshot = validar(valor)
                ? { value: valor, error: "" }
                : {
                      value: valorInicial,
                      error: "Os dados salvos neste navegador estão inválidos.",
                  }
        }
    } catch {
        snapshot = {
            value: valorInicial,
            error: "Não foi possível ler os dados salvos neste navegador.",
        }
    }

    const listeners = new Set()

    // Atualiza todos os componentes inscritos neste armazenamento.
    function notificarAssinantes() {
        listeners.forEach((listener) => listener())
    }

    // Sincroniza a página quando outra aba altera a mesma chave.
    function tratarEventoDeArmazenamento(event) {
        if (event.key !== chave && event.key !== null) return

        try {
            if (event.newValue === null) {
                snapshot = { value: valorInicial, error: "" }
            } else {
                const valor = JSON.parse(event.newValue)
                snapshot = validar(valor)
                    ? { value: valor, error: "" }
                    : {
                          value: valorInicial,
                          error: "Os dados salvos neste navegador estão inválidos.",
                      }
            }
        } catch {
            snapshot = {
                ...snapshot,
                error: "Não foi possível ler os dados salvos neste navegador.",
            }
        }
        notificarAssinantes()
    }

    return {
        // Fornece ao React a versão atual do estado salvo.
        obterSnapshot: () => snapshot,
        // Inscreve o componente e remove o ouvinte quando ele desmonta.
        inscrever(listener) {
            listeners.add(listener)
            window.addEventListener("storage", tratarEventoDeArmazenamento)

            return () => {
                listeners.delete(listener)
                if (listeners.size === 0) {
                    window.removeEventListener("storage", tratarEventoDeArmazenamento)
                }
            }
        },
        // Persiste um valor novo e notifica quem está inscrito.
        definirValor(proximoValor) {
            const value =
                typeof proximoValor === "function"
                    ? proximoValor(snapshot.value)
                    : proximoValor

            try {
                window.localStorage.setItem(chave, JSON.stringify(value))
                snapshot = { value, error: "" }
            } catch {
                snapshot = {
                    value,
                    error: "Não foi possível salvar os dados neste navegador.",
                }
            }

            notificarAssinantes()
        },
    }
}

// Expõe o estado salvo e uma função para atualizá-lo entre componentes.
export default function useEstadoNoArmazenamentoLocal(chave, valorInicial, validar) {
    if (!stores.has(chave)) {
        stores.set(chave, criarArmazenamento(chave, valorInicial, validar))
    }

    const store = stores.get(chave)
    const snapshot = useSyncExternalStore(
        store.inscrever,
        store.obterSnapshot,
        store.obterSnapshot,
    )

    return [snapshot.value, store.definirValor, snapshot.error]
}
