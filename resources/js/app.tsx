import '../css/app.css'
import './bootstrap'

import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

const appName = import.meta.env.VITE_APP_NAME || 'FeeYangu'

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob('./pages/**/*.tsx')
    ),
  setup({ el, App, props }) {
    const root = createRoot(el)
    root.render(
      <ThemeProvider>
        <LanguageProvider>
          <App {...props} />
        </LanguageProvider>
      </ThemeProvider>
    )
  },
  progress: {
    color: '#4B5563',
  },
})
