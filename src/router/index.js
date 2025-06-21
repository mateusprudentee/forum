import { createRouter, createWebHistory } from 'vue-router'
import Forum from '../pages/Forum.vue'
import Inicio from '../pages/Inicio.vue'
import Punicoes from '../pages/PunicoesPage.vue'
import ForumView from '../pages/ForumView.vue'
import ForumTopic from '../pages/ForumTopic.vue'
import Perfil from '../pages/Perfil.vue'
import ForumNew from '../pages/ForumNew.vue'
import Equipe from '../pages/Equipe.vue'
import Login from '../pages/Login.vue'
import NotFound from '../pages/404.vue'
import Register from '../pages/Register.vue'
import Admin from '../pages/Admin.vue'
import axios from 'axios'
import Membros from '../pages/Members.vue'

const routes = [
  { path: '/', component: Inicio },
  { path: '/forum', component: Forum },
  { path: '/membros', component: Membros },
  { path: '/admin', component: Admin },
  { path: '/login', component: Login, meta: { requiresGuest: true } },
  { path: '/register', component: Register, meta: { requiresGuest: true } },
  { path: '/equipe', component: Equipe },
  { path: '/forum/new/:category', name: 'ForumNew', component: ForumNew, props: true, meta: { requiresAuth: true } },
 {
  path: '/perfil/:username',
  name: 'Perfil',
  component: Perfil,
  props: true,
  meta: { requiresValidUser: true }
},
  { path: '/punicoes', component: Punicoes },
  { path: '/forum/categoria/:category', name: 'ForumCategoryView', component: ForumView, props: true },
  { path: '/forum/categoria/:category/:subcategory', name: 'ForumSubcategoryView', component: ForumView, props: true },

  // ✅ Rota de tópico SEM categoria
  {
    path: '/forum/topico/:topic',
    name: 'ForumTopicNoCategory',
    component: ForumTopic,
    props: route => ({
      ...route.params,
      id: route.query.id
    })
  },
  
  // No seu router.js
{
  path: '/forum/view/:category/:topic',
  name: 'ForumTopic',
  component: ForumTopic,
  props: route => ({ 
    id: route.query.id,
    subcategory: null // Força subcategory como null para esta rota
  })
},
{
  path: '/forum/view/:category/:subcategory/:topic',
  name: 'ForumTopicWithSubcategory',
  component: ForumTopic,
  props: route => ({ 
    id: route.query.id,
    subcategory: route.params.subcategory 
  })
},

  { path: '/:pathMatch(.*)*', component: NotFound }
];


const router = createRouter({
  history: createWebHistory(),
  routes
})

// Middleware de autenticação
router.beforeEach(async (to, from, next) => {
  const authToken = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Verifica token válido para rotas protegidas
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authToken) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }

    try {
      // Verifica se o token ainda é válido
      const response = await axios.get('http://localhost:3001/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      // Atualiza os dados do usuário no localStorage se necessário
      if (response.data && !userData.id) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      // Token inválido ou expirado
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
  }

  // Rotas para visitantes (não logados)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (authToken) {
      return next('/perfil/' + userData.username);
    }
  }
  
  // Verifica se o usuário existe (para rotas de perfil)
  if (to.matched.some(record => record.meta.requiresValidUser)) {
    try {
      const username = to.params.username;
      const response = await axios.get(
        `http://localhost:3001/api/members/${encodeURIComponent(username)}`
      );
      
      if (!response.data) {
        return next('/404');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        return next('/404');
      }
      console.error('Erro ao verificar usuário:', error);
    }
  }
  
  next();
})

export default router