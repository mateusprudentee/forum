<template>
  <div class="app-container">
    <!-- Top Navbar -->
    <div class="navbar-cima">
      <div class="container">
        <div class="logo-left">
          <p>{{ playerCount}}</p>
        </div>
        <div class="logo-left-subtitle">
          <p>Jogadores Online</p>
          <p style="margin-top: -20px; color: yellow">Clique para jogar!</p>
        </div>
        <div class="logo"></div>
      </div>
    </div>

    <!-- Main Navbar -->
    <div class="navbar">
      <div class="container">
        <div class="navbar-wrapper">
          <!-- Itens padrão -->
          <div class="navbar-itens-group">
            <router-link
              v-for="item in navbarItens.filter(i => i.label !== 'CONTA' && i.label !== 'MAIS')"
              :key="item.label"
              :to="item.link"
              class="navbar-itens"
              style="text-decoration: none;"
            >
              <p>
                <q-icon
                  v-if="item.icon"
                  :name="item.icon"
                  style="font-size: 19px; margin-top: -3px; text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);"
                />
                {{ item.label }}
              </p>
            </router-link>

          <div class="navbar-itens mais-hover">
  <p>
    MAIS
    <q-icon name="arrow_drop_down" />
  </p>
  <div class="dropdown-content">
    <router-link to='/punicoes/' style="text-decoration: none;"> 
    <div class="dropdown-itens">
      <p style="color: rgb(51, 51, 51);;
  font-weight: normal; font-size: 14px"><q-icon name="chevron_right" style="font-size: 21px;"> </q-icon> Punições</p>
   
  </div>
   </router-link>
    
    <router-link to='/equipe/' style="text-decoration: none;"> 
    <div class="dropdown-itens">
      <p style="color: rgb(51, 51, 51);;
  font-weight: normal; font-size: 14px"><q-icon name="chevron_right" style="font-size: 21px;"> </q-icon> Equipe</p>
    </div>
    </router-link>
    <a href="/forum/categoria/An%25C3%25BAncios%2520e%2520Novidades/Regras?id=80" style="text-decoration: none;">
    <div class="dropdown-itens">
     <p style="color: rgb(51, 51, 51);;
  font-weight: normal; font-size: 14px"><q-icon name="chevron_right" style="font-size: 21px;"> </q-icon> Regras</p>
    </div>
    </a>
  </div>
</div>

          </div>

          <!-- Item CONTA fixado à direita -->
          <!-- Substitua o bloco navbar-conta por este: -->
<div class="navbar-conta">
  <div class="navbar-itens conta-hover" style="width: 160px;">
    <p>
      <q-icon
        name="person"
        style="font-size: 19px; margin-top: -3px; margin-right: 0px; text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);"
      />
      MINHA CONTA
      <q-icon name="arrow_drop_down" />
    </p>
    <div class="dropdown-content conta-dropdown">
      <div class="conta-header">
        <div class="conta-avatar">
          <q-avatar size="60px" style="border-radius: 10px;">
            <img :src="userAvatar" alt="Avatar">
          </q-avatar>
        </div>
        <div class="conta-info">
          <p class="conta-nick" style="color: black; font-weight: normal;">{{ userNick }}</p>
          <p class="conta-role" style="color: gray; font-weight: normal;">{{ userRole }}</p>
        </div>
      </div>
      <div class="conta-menu">
        <router-link :to="`/perfil/${userNick}`" class="conta-menu-item">
  <q-icon name="person" />&nbsp; Perfil
</router-link>

        <router-link to="/mensagens" class="conta-menu-item">
          <q-icon name="mail" />&nbsp; Mensagens
        </router-link>
        <router-link to="/configuracoes" class="conta-menu-item">
          <q-icon name="settings" />&nbsp; Configurações
        </router-link>
        <br>
        <div class="conta-menu-item" @click="handleLogout">
          <q-icon name="logout" />&nbsp; Sair 
        </div>
      </div>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Dropdown menu logic
const dropdownOpen = ref(false)
const maisBtn = ref(null)
const maisBtnOffset = ref(0)

// Player count logic
const playerCount = ref('0')

// User account data
const userData = ref({
  username: '',
  role: 'Visitante',
  avatar: '',
  created_at: new Date().toISOString()
})

// Computed properties for user data
const userNick = computed(() => userData.value.username || 'Visitante')
const userRole = computed(() => userData.value.role)
const userAvatar = computed(() => userData.value.avatar || 'https://mc-heads.net/avatar/Steve')
const accountCreated = computed(() => {
  const date = new Date(userData.value.created_at)
  return date.toLocaleDateString('pt-BR')
})

// Navbar items
const navbarItens = [
  { label: 'INÍCIO', link: '/' },
  { label: 'LOJA', link: '/loja', icon: 'star' },
  { label: 'FÓRUM', link: '/forum' },
  { label: 'AJUDA', link: '/ajuda' },
  { label: 'DISCORD', link: '/discord' },
  { label: 'MAIS', link: '/mais', dropdown: true },
  { label: 'CONTA', link: '/conta' }
]

let intervalId = null

// Toggle dropdown function
function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    nextTick(() => {
      if (maisBtn.value) {
        maisBtnOffset.value = maisBtn.value.getBoundingClientRect().left - maisBtn.value.offsetParent.getBoundingClientRect().left
      }
    })
  }
}

// Fetch player count function
const fetchPlayerCount = async () => {
  try {
    const response = await axios.get('https://api.mcsrvstat.us/2/hylex.net')
    
    if (response.data?.players?.online !== undefined) {
      playerCount.value = response.data.players.online.toLocaleString()
    } else {
      playerCount.value = 'Erro'
    }
  } catch (error) {
    console.error('Erro ao buscar jogadores online:', error)
    playerCount.value = 'Erro'
    setTimeout(fetchPlayerCount, 30000)
  }
}

// Load user data from localStorage
const loadUserData = () => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser)
      userData.value = {
        username: parsedUser.username || '',
        role: parsedUser.role || 'Membro',
        avatar: parsedUser.avatar || `https://mc-heads.net/avatar/${parsedUser.username || 'Steve'}`,
        created_at: parsedUser.created_at || new Date().toISOString()
      }
    } catch (e) {
      console.error('Erro ao carregar dados do usuário:', e)
    }
  }
}

// Handle logout
const handleLogout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  userData.value = {
    username: '',
    role: 'Visitante',
    avatar: '',
    created_at: new Date().toISOString()
  }
  router.push('/login')
}

onMounted(() => {
  fetchPlayerCount()
  intervalId = setInterval(fetchPlayerCount, 60000)
  loadUserData()
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>
<style>

.mais-hover {
  position: relative;
}
/* Adicione ao final do seu <style> */
.conta-hover {
  position: relative;
}

.conta-hover .conta-dropdown {
  display: none;
  position: absolute;
  top: 61px;
  right: 0;
  width: 220px;
}

.conta-hover:hover .conta-dropdown {
  display: block;
}

.conta-header {
  padding: 15px;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.conta-avatar {
  margin-right: 15px;
}

.conta-info {
  flex-grow: 1;
}

.conta-nick {
  font-weight: bold;
  margin: 0;
  color: #333;
  font-size: 16px;
}

.conta-role {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.conta-menu {
  padding: 1em 0;
  justify-content: center;
  align-items: center;
  text-align: center;
  line-height: 10px;

}

.conta-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: gray;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
  transition: background-color 0.2s;
}

.conta-menu-item:hover {
  background-color: #f8f9fa;
}

.conta-menu-item q-icon {
  margin-right: 10px;
  font-size: 18px;
}
.mais-hover .dropdown-content {
  display: none;
  position: absolute;
  top: 61px; /* 20px abaixo da navbar (altura 61px) */
  left: 0;
}

.mais-hover:hover .dropdown-content {
  display: block;
}
.dropdown-itens:hover {
  padding: 10px;
  background: rgb(245, 245, 245);
  height: 40px;
}
.dropdown-itens {
  padding: 10px;
  height: 40px;
}
/* Estrutura do dropdown (não está implementado visualmente ainda) */
.dropdown-content {
  background: white;
  width: 200px;
;
  position: absolute;
      font-size: 14px;
  margin-top: -5px;
  z-index: 1;
  margin-left: 0px;
  color: black;
      border: 1px solid #ccc;
    border: 1px solid rgba(0, 0, 0, .15);
    -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
    box-shadow: rgba(0, 0, 0, 0.176) 0px 6px 12px;
}

/* Navbar wrapper principal */
.navbar-wrapper {
  display: flex;
  width: 100%;
  align-items: center;
}

.navbar-itens-group {
  display: flex;
}

.navbar-conta {
  margin-left: auto;
  text-align: center;
}

/* Estilo dos itens da navbar */
.navbar-itens {
  display: flex;
  align-items: center;
  width: 85px;
  cursor: pointer;
  justify-content: center;
  height: 57px;
  padding: 1em 0;
  position: relative;
}

.navbar-itens:hover {
  background-color: #0097E5;
  transition: background-color 0.3s ease;
}

.navbar-itens p {
  font-size: 16px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  margin: 0;
}

/* Barra superior com imagem de fundo */
.navbar-cima {
  background-image: url(//web.archive.org/web/20211002161248im_/https://cdn.redesky.com/media/general/header.jpg);
  background-position: center center;
  background-color: #0d0d0d;
  position: relative;
  height: 169px;
  background-repeat: no-repeat;
}

/* Logo centralizada */
.logo {

  background-size: contain;
  background-position: center;
  height: 400px;
  margin: 0 auto;
  margin-top: -250px;
  cursor: pointer;
  background-repeat: no-repeat;
  width: 100%;
  transition: all 0.3s ease;
  background-image: url("https://i.imgur.com/s8XU6X5.png");
  vertical-align: middle;
}

.logo:hover {
  filter: brightness(1.2) drop-shadow(0 0 1px rgba(255, 255, 255, 0.103));
}

.logo-left {
  font-size: 32px;
  color: white;
  padding: 0.7em 0;
  font-weight: bold;
}

.logo-left-subtitle {
  font-size: 16px;
  color: white;
  margin-top: -40px;
  font-weight: 400;
}

/* Navbar principal azul */
.navbar {
  background: #00A8FF;
  border-top: #3fb1ec solid 1px;
  border-bottom: 3px solid #007ab8;
  width: 100%;
  height: 61px;
}

/* Container genérico */
.container {
  max-width: 1215px;
  margin: 0 auto;
}

/* Estilização base da página */
html, body {
  font-family: 'Ubuntu', sans-serif;
  font-weight: 400;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #ECECEC;
  box-sizing: border-box;
}

#app, .app-container {
  min-height: 100vh;
  background-color: #ECECEC;
  margin: 0;
  font-family: 'Ubuntu', sans-serif;
  padding: 0;
}
</style>
