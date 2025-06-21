<template>
  <div class="navbar-forum">
    <div class="navbar-forum-inicio">
      <q-icon name="home" />
    </div>
    <div class="navbar-forum-itens-um"></div>
    <router-link to="/membros" style="text-decoration: none;">
      <div class="navbar-forum-itens-forum">
        <p style="margin-left: 19px;">Membros</p>
      </div>
    </router-link>
    <div class="navbar-forum-itens-um"></div>
    <div class="navbar-forum-itens">
      <p style="margin-left: 19px;">{{ userData.username }}</p>
    </div>
  </div>
  
  <div class="forum-layout">
    <div class="forum-main">
      <div v-if="loading" class="skeleton-loading">
        <!-- Efeito de carregamento -->
      </div>
      
      <div v-else class="subforum">
        <div class="topic-container">
          <div class="left-side">
            <p class="username" :style="{ color: roleColor, fontWeight: 'bold' }">{{ userData.username }}</p>
            <div style="position: relative; width: 210px; height: 210px;">
              <img :src="roleImage" :alt="userData.username" style="position: absolute; top: 0; left: 0; width: 210px; height: 220px; z-index: 2;">
              <img :src="userData.avatar" :alt="userData.username" style="position: absolute; top: 0; left: 0; width: 210px; height: 210px; z-index: 1; border-radius: 20px;">
            </div>

            <div class="user-info" style="margin-top: 30px;">
              <div class="orientacao-estatistica">
                <div class="orientacao-left">
                  <p>Visto em</p>
                  <p>Membro desde</p>
                  <p>Postagens</p>
                  <p>Curtidas</p>
                  <p>Troféus</p>
                  <p>Alertas</p>
                </div>
                <div class="orientacao-left-left">
                  <p>{{ formatLastActivity(userData.last_login) || 0 }}</p>
                  <p>{{ formatDate(userData.data_criacao) }}</p>
                  <p>{{ userData.post_count || 0 }}</p>
                  <p>{{ userData.likes_received || 0 }}</p>
                  <p>{{ userData.trofeus || 0 }}</p>
                  <p>{{ userData.alertas || 0 }}</p>
                </div>
              </div>
            </div>
            <div class="flex">
              <div class="curtidas-e-botao">
               <div class="curtidas">
    <b>{{ userData.seguidores || 0 }}</b>
    <p style="font-size: 16px; font-weight: normal;">seguidores</p>
  </div>
              </div>
              <div class="seguir">
                <div class="seguir-container">
                 <template v-if="!isOwnProfile">
    <button class="btn btn-primary" @click="toggleFollow">
      {{ isFollowing ? 'Deixar de seguir' : 'Seguir' }}
    </button>
  </template>
                  <template v-else>
                    <div class="curtidas" style="margin-top: -5px;">
                      <b>{{ userData.seguindo || 0 }}</b>
                      <p style="font-size: 16px; font-weight: normal;">seguindo</p>
                    </div>
                  </template>
                </div>
              </div>
            </div>
    
          </div>
          
          
         
          
          <div class="right-side">
            
            <div class="topic-content-wrapper">
              <div class="categorias-info">
                <div class="flex" style="gap: 20px;">
                  <div class="categorias-perfil">
                    <p><b>Publicações pessoais</b></p>
                  </div>
                  <div class="categorias-perfil">
                    <p>Atividade recente</p>
                  </div>
                  <div class="categorias-perfil">
                    <p>Conteúdo</p>
                  </div>
                  <div class="categorias-perfil">
                    <p>Informações</p>
                  </div>
                </div>
              </div>
            </div>
           

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Perfil',
  props: {
    username: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const followLoading = ref(false)
    const currentUserId = ref(null)
    const currentUsername = ref('')
    const isFollowing = ref(false)
    const userData = ref({
      id: null,
      username: '',
      email: '',
      minecraft_nick: '',
      avatar: '',
      data_criacao: '',
      role: '',
      post_count: 0,
      likes_received: 0,
      seguidores: 0,
      seguindo: 0,
      trofeus: 0,
      alertas: 0,
      last_login: new Date().toISOString()
    })

    // Mapeamento das imagens e cores por role
    const roleImages = {
      'Master': 'https://i.imgur.com/vKSn1Rf.png',
      'Gerente': 'https://i.imgur.com/PrNmct9.png',
      'Admin': 'https://i.imgur.com/Ija4A2v.png',
      'Moderador': 'https://i.imgur.com/2j0a8Kb.png',
      'Ajudante': 'https://i.imgur.com/NceVmwS.png'
    }

    const roleColors = {
      'Master': '#ffc400',
      'Gerente': '#d00000',
      'Admin': '#ff5555',
      'Moderador': '#00ae09',
      'Ajudante': '#e0ff00'
    }

    // Computed properties
    const roleImage = computed(() => roleImages[userData.value.role] || 'https://i.imgur.com/PrNmct9.png')
    const roleColor = computed(() => roleColors[userData.value.role] || '#000000')
    const isOwnProfile = computed(() => currentUsername.value === props.username)

    // Funções auxiliares
    const formatDate = (dateString) => {
      if (!dateString) return 'Nunca'
      const date = new Date(dateString)
      const now = new Date()
      const day = date.getDate()
      const month = date.toLocaleString('pt-BR', { month: 'long' })
      const year = date.getFullYear()
      
      return date.getFullYear() === now.getFullYear() 
        ? `${day} de ${month}` 
        : `${day} de ${month} de ${year}`
    }

    const formatLastActivity = (dateString, isOnline = false) => {
      if (isOnline) return 'agora mesmo'
      if (!dateString) return 'Nunca'
      
      const now = new Date()
      const lastActivity = new Date(dateString)
      if (lastActivity > now) return 'agora mesmo'
      
      const diffInSeconds = Math.floor((now - lastActivity) / 1000)
      if (diffInSeconds < 0) return 'agora mesmo'
      if (diffInSeconds < 60) return `há ${diffInSeconds}s`
      
      const diffInMinutes = Math.floor(diffInSeconds / 60)
      if (diffInMinutes < 60) return `há ${diffInMinutes} min`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `há ${diffInHours} h`
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `há ${diffInDays} dia${diffInDays !== 1 ? 's' : ''}`
      
      return formatDate(dateString)
    }

    // Função principal para seguir/deixar de seguir
    // Função principal para seguir/deixar de seguir
const toggleFollow = async () => {
  try {
    followLoading.value = true;
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/login');
      return;
    }

    const response = await fetch(`http://localhost:3001/api/seguir/${encodeURIComponent(props.username)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao seguir usuário');
    }

    const data = await response.json();
    isFollowing.value = data.following;
    userData.value.seguidores = data.followers;

    // Recarregar os dados para garantir consistência
    await fetchUserData();

  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    alert(error.message || 'Erro ao atualizar o status de seguimento');
  } finally {
    followLoading.value = false;
  }
}

// Função para verificar follow status
const checkIfFollowing = async () => {
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    const response = await fetch(
      `http://localhost:3001/api/seguir/check/${encodeURIComponent(props.username)}`, 
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao verificar follow');
    }

    const data = await response.json();
    isFollowing.value = data.following;

  } catch (error) {
    console.error('Erro ao verificar follow:', error);
    // Não mostrar alerta para evitar poluição visual
  }
}

  

    // Carregar dados do perfil
    const fetchUserData = async () => {
      try {
        loading.value = true
        const authToken = localStorage.getItem('authToken')
        if (!authToken) {
          router.push('/login')
          return
        }

        // Dados do usuário logado
        const meResponse = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        if (!meResponse.ok) throw new Error('Erro ao carregar perfil')
        
        const meData = await meResponse.json()
        currentUserId.value = meData.id
        currentUsername.value = meData.username

        // Dados do perfil visualizado
        const profileResponse = await fetch(`http://localhost:3001/api/members/${encodeURIComponent(props.username)}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        if (!profileResponse.ok) throw new Error('Perfil não encontrado')
        
        const profileData = await profileResponse.json()

        // Atualizar dados locais
        userData.value = {
          ...profileData.member,
          avatar: profileData.member.avatar || `https://cravatar.eu/helmavatar/${encodeURIComponent(profileData.member.minecraft_nick || profileData.member.username)}/190.png`,
          post_count: profileData.member.post_count || 0,
          likes_received: profileData.member.likes_received || 0,
          last_login: profileData.member.last_login || new Date().toISOString()
        }

        // Verificar follow status
        await checkIfFollowing()

      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        router.push('/404')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchUserData()
    })

    return {
      loading,
      followLoading,
      userData,
      isOwnProfile,
      isFollowing,
      toggleFollow,
      formatDate,
      formatLastActivity,
      roleImage,
      roleColor
    }
  }
}
</script>

<style scoped>
.categorias-perfil {
    font-size: 18px;
    font-weight: 100;
}
.categorias-info {
    margin-top: 10px;
}
.curtir-agora {
    display: inline-block;
    margin-top: 10px;
}
.curtidas-e-botao {
  padding: 1em ;
  margin-left: -10px;
}
.seguir {
  margin-top: 20px;
  margin-left: 65px;
}
.curtidas {
    font-size: 18px;
    line-height: 18px;
  min-width: 80px; 
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    margin-right: 5px;
    color: rgb(0, 149, 253);
    margin-right: auto;
    font-weight: bold;

}
.fechado {
    color: #31708f;
    background-color: #d9edf7;
    border: 1px solid #bce8f1;
    padding: 17px;
    height: 64px;
    line-height: 5px;
    margin-bottom: 30px;
    border-radius: 4px;
}

.navbar-forum {
  width: 100%;
  margin-top: 20px;
  height: 50px;
  background-color: #041E34;
  border-radius: 5px;
  color: white;
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
}
.orientacao-left-left {
  flex-direction: column;
  justify-content: right;
  align-items: right;
  text-align: right;
  margin-left: auto;
  float: right;
    font-weight: 300;
    color: rgb(103, 103, 103);
    font-size: 16px;
}
.orientacao {
  text-transform: uppercase;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  width: 290px;
  margin: 0 auto;
}
.orientacao-estatistica {
  margin: 0 auto;
  padding: 0 25px;
  display: flex;
  line-height: 5px;
}
.orientacao-left {
    float: left;
    font-weight: bold;
    color: rgb(103, 103, 103);
    font-size: 16px;
}
.navbar-forum-inicio {
  width: 60px;
  font-size: 17px;
  height: 100%;
  background: #041E34;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.navbar-forum-itens-um {
  position: relative;
    width: 3px;
  background: #041E34;
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: normal;
}
.navbar-forum-inicio::after {
  content: "";
  position: absolute;
  top: 0;
  right: -15px;
  width: 0;
  height: 0;
  border-top: 30px solid transparent;
  border-bottom: 30px solid transparent;
  border-left: 15px solid #00A8FF;
  z-index: 2;
}

.btn {
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    line-height: 16px;
    background-color: #0095fd;
    margin-bottom: 12px;
}
.btn-primary {
    color: #fff;
    background-color: #0095fd;
}
.btn {
    border-radius: 5px;
    border: 0;
    text-decoration: none !important;
    font-weight: 300;
}
.navbar-forum-itens-um {
  position: relative;
    width: 3px;
  background: #041E34;
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: normal;
}
.navbar-forum-itens {
  position: relative;
  font-size: 16px;
  color:rgb(255, 255, 255);
  text-align: center;
  padding: 0 0.7em;
  text-overflow: ellipsis;
  background: #00A8FF;
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 50;
  margin-left: 5px;
}
.navbar-forum-itens-forum {
  position: relative;
  font-size: 16px;
  color:rgb(255, 255, 255);
  text-align: center;
  padding: 0 0.7em;
  text-overflow: ellipsis;
  background: #041E34;
  height: 100%;
  margin-top: 13px;
  display: flex;
  align-items: center;
  font-weight: 50;
  margin-left: 5px;
}

.navbar-forum-itens-um::after {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border-top: 30px solid transparent;
  border-bottom: 30px solid transparent;
  border-left: 20px solid #041E34;
  position: absolute;
  top: -10;
  right: -17px;
  z-index: 2;
}

/* Borda clara da seta (simula separação) */
.navbar-forum-itens-um::before {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border-top: 33px solid transparent;
  border-bottom: 33px solid transparent;
  border-left: 22px solid #ececec;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 100%;
  z-index: 1;
}
/* Seta azul escura à direita */
.navbar-forum-itens::after {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border-top: 30px solid transparent;
  border-bottom: 30px solid transparent;
  border-left: 20px solid #00A8FF;
  position: absolute;
  top: -10;
  right: -17px;
  z-index: 2;
}

/* Borda clara da seta (simula separação) */
.navbar-forum-itens::before {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border-top: 33px solid transparent;
  border-bottom: 33px solid transparent;
  border-left: 22px solid #ececec;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 100%;
  z-index: 1;
}

.navbar-forum-itens p {
  margin: 0;
  color: white;
}
.curtir-down {
  background: rgba(0, 140, 255, 0.199);
  padding: 0.4em;
  margin-left: -10px;
  border-radius: 20px;
}
.curtir {
  background: rgba(255, 145, 0, 0.199);
  padding: 0.4em;
  border-radius: 20px;
}
.multimoderacao-itens-item {
  background: rgb(29, 29, 29);
  text-align: left;
  color: rgb(150, 150, 150);
  border: 1px solid rgba(128, 128, 128, 0.11);
}
.multimoderacao-itens {
  font-family: 'Ubuntu', sans-serif;
}
.multimoderacao {
  border-radius: 20px;
  color: black;
  display: flex;
  margin-bottom: -10px;
  justify-content: flex-end;
  margin-left: auto;
  justify-content: right;
  align-items: right;
  background:rgba(255, 255, 255, 0.055);
}

.reply {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.body--dark .q-field--filled .q-field__native,
.body--dark .q-field--filled .q-field__input,
.body--dark .q-field--filled .q-editor__content {
  color: white !important;
}
/* Estilos para o input no tema escuro */
.custom-dark-input .q-field__native,
.custom-dark-input .q-field__input {
  color: white !important;
}

.custom-dark-input .q-field__control {
  background: #1e1e1e;
  color: white;
}

.custom-dark-input .q-field__placeholder {
  color: rgba(255, 255, 255, 0.6) !important;
}

/* Se estiver usando editor rich text (quill) */
.custom-dark-input .quill-editor {
  color: white !important;
}

.custom-dark-input .ql-editor {
  color: white !important;
}
.breadcrumbs {
  padding: 0em;
  margin-left: -5px;
}
.q-breadcrumbs__separator {
  color: gray;
}
.breadcrumb-container {
  color: grey;
  font-size: 14px;
}

.custom-breadcrumb {
  padding: 0;
}
.custom-breadcrumb :deep(.q-breadcrumbs__separator) {
  color: rgb(82, 82, 82); /* Mesma cor do texto */
  padding: 0 4px;
}

.breadcrumb-item {
  color: rgb(82, 82, 82);
  padding: 0 4px;
  text-decoration: none;
}

.breadcrumb-item:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: grey;
  padding: 0 2px;
}

.breadcrumb-item.current {
  color: rgb(82, 82, 82);
  text-decoration: underline;
  
}
.campo-resposta-input {
  padding: 1em;
}
.botoes-resposta {
  align-items: right;
  justify-content: right;
  align-self: right;
  align-items: right;
  margin-top: 20px;
  color: rgb(107, 107, 107);

  display: flex;
  flex-direction: row;
  gap: 10px;
}
.campo-resposta {
  width: 100%;
  min-height: 100px;
  background: white;
  border-radius: 8px;
}
.left-info {
    margin-bottom: -30px;
    text-align: left;
    padding: 0;
    margin-top: 60px;
    font-size: 12px;
    color: gray;
    line-height: 10px;
    flex-grow: 1;
  }
  
.ultima-resposta-container {
      margin-top: 20px;
  }
  .ultima-resposta-pessoa {
    color: rgba(128, 128, 128, 0.486);
    margin-top: -20px;
  }
  .ultima-resposta {
    text-align: right;
    color: gray;
    padding-top: 0;
    margin-top: 5px;
  }
  .topicos-views {
    margin-top: -15px;
    font-weight: normal;
    font-size: 11px;
    color: gray;
  }
.subforum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.subforum-link {
  margin-left: 20px;
}
.subforum-subtitle {
  margin-top: -20px;
  color: rgb(103, 103, 103);
  font-size: 16px;
}
.subforum-title {
  font-weight: bold;
    font-size: 27px;
        color: rgb(43, 43, 43);
}
.subforum {
  text-align: left;
  color: white;
  margin-top: 10px;
}
.container {
  width: 1150px;
  font-family: 'Ubuntu', sans-serif;
  margin: 0 auto;
  margin-top: 20px;
  background-color: #000;
  padding-bottom: 20px;
}

.forum-layout {
  display: flex;
  gap: 20px;
  width: 100%;
}

.forum-main {
  width: 100%;
}

.topic-container {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.left-side {
  width: 380px;
  height: 100%;
      background-color: rgb(255, 255, 255);
    min-height: 420px;
    box-sizing: border-box;
    padding: 14px 14px 0px;
    border-radius: 5px;
        box-shadow: rgba(0, 0, 0, 0.5) 0px 3px 12px -3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: flex-start; /* Faz com que o left-side não estique */
}

.user-avatar {
  width: 264px;
  height: 192px;
  background-size: cover;
  background-position: center;
  border-radius: 5px;
  margin-bottom: 15px;
}

.user-info {
 width: 100%;
 margin-top: 10px;
     
}

.username {
  color: rgb(83, 83, 83);
    display: block;
    overflow: hidden;
    font-weight: 600;
    font-size: 19px;
}

.post-count {
  color: gray;
  font-size: 13px;
  margin: 5px 0;
}
.responder {
  color: black;
  font-weight: 300;
  font-size: 17px;
  text-align: left;
}
.right-side-resposta {
  background-color: rgb(255, 255, 255);
    min-height: 290px;
    box-sizing: border-box;
    padding: 14px 14px 0px;
    border-radius: 5px;
    margin-bottom: 30px;
    box-shadow: rgba(0, 0, 0, 0.5) 0px 3px 12px -3px;
    width: 925px;
    margin-left: auto;
    margin-top: 20px;
}
.right-side {
  background-color: rgb(255, 255, 255);
    min-height: 420px;
    color: black;
    box-sizing: border-box;
    padding: 14px 14px 0px;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.5) 0px 3px 12px -3px;
    width: 100%;
}

.topic-text {
  text-align: left;
font-size: 12px;
    line-height: 1.6;
    color: rgb(86, 88, 103);
  width: 100%; /* Usa 100% do container pai */
  max-width: 900px; /* Define um limite máximo */
  flex-grow: 1;
margin-top: 5px;
  word-wrap: break-word; /* Quebra palavras longas */
  overflow-wrap: break-word; /* Melhor suporte para quebra de palavras */
  overflow-x: hidden; /* Evita rolagem horizontal */
}

.topic-content-wrapper {
  display: flex;
  width: 100%; /* Ou um valor fixo, se necessário */
  max-width: 900px; /* Limita a largura máxima */
  flex-direction: column;
  min-height: 100%;
      padding: 0px;
      
}


.topic-text >>> p {
  margin: 10px 0;
}

.topic-text >>> ul {
  margin: 10px 0;
  padding-left: 20px;
}

.topic-stats {
      font-size: 12px;
    margin-bottom: 10px;
    padding-bottom: 8px;
        white-space: nowrap;
    display: inline-block;
    margin-left: 5px;
}

.topic-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.skeleton-dark {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px;
}
</style>