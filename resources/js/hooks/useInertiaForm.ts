import { router } from '@inertiajs/react'
import { FormEventHandler } from 'react'

interface UseInertiaFormOptions {
  onSuccess?: () => void
  onError?: (errors: Record<string, string>) => void
  preserveScroll?: boolean
  preserveState?: boolean
}

export function useInertiaForm<T extends Record<string, any>>(
  initialData: T,
  options: UseInertiaFormOptions = {}
) {
  const submit = (method: 'post' | 'put' | 'patch' | 'delete', url: string) => {
    return (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      
      router[method](url, initialData, {
        onSuccess: options.onSuccess,
        onError: options.onError,
        preserveScroll: options.preserveScroll !== false,
        preserveState: options.preserveState !== false,
      })
    }
  }

  return {
    data: initialData,
    submit,
    post: (url: string) => submit('post', url),
    put: (url: string) => submit('put', url),
    patch: (url: string) => submit('patch', url),
    delete: (url: string) => submit('delete', url),
  }
}
