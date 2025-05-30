import { createApp } from 'vue'
import App from './App.vue'

import { Quasar } from 'quasar'
import * as AllQuasarComponents from 'quasar'
import * as AllQuasarDirectives from 'quasar'
import quasarLang from 'quasar/lang/pt-BR'
import quasarIconSet from 'quasar/icon-set/material-icons'
import router from './router'

// Estilos
import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'

const app = createApp(App)

// Filtra apenas os componentes válidos
const components = {}
for (const key in AllQuasarComponents) {
  if (key.startsWith('Q')) {
    components[key] = AllQuasarComponents[key]
  }
}

// Filtra apenas diretivas (v-ripple, v-close-popup etc.)
const directives = {}
for (const key in AllQuasarDirectives) {
  if (key.startsWith('ClosePopup') || key.startsWith('Ripple') || key.startsWith('Touch') || key.startsWith('Intersection')) {
    directives[key] = AllQuasarDirectives[key]
  }
}

app.use(Quasar, {
  components,
  directives,
  plugins: {}, // Adicione plugins aqui se quiser: Dialog, Notify, etc.
  lang: quasarLang,
  iconSet: quasarIconSet
})

app.use(router)
app.mount('#app')
