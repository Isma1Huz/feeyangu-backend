// Global Inertia Types
import { User as AuthUser } from './index'

export interface PageProps<T = Record<string, unknown>> {
  auth: {
    user: AuthUser | null
  }
  flash: {
    success?: string
    error?: string
    warning?: string
    info?: string
  }
  errors?: Record<string, string>
  ziggy?: unknown
}

export type InertiaSharedProps<T = Record<string, unknown>> = PageProps & T

// Auth User extended with school info
export interface AuthenticatedUser extends AuthUser {
  school?: {
    id: number
    name: string
  }
}

export interface PaginatedData<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
}
