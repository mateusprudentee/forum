import { createRouter, createWebHistory } from 'vue-router'
import Forum from '../pages/Forum.vue'
import Inicio from '../pages/Inicio.vue'
import Punicoes from '../pages/PunicoesPage.vue'

const routes = [
  { path: '/', component: Inicio },
  { path: '/forum', component: Forum },
  { path: '/punicoes', component: Punicoes }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

