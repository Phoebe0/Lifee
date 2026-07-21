import { ref } from 'vue'

export function useAsyncTask<TArgs extends unknown[], TResult>(
  task: (...args: TArgs) => Promise<TResult>
) {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function run(...args: TArgs) {
    loading.value = true
    error.value = null

    try {
      return await task(...args)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('unknown error')
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    run
  }
}
