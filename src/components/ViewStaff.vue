<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ViewStaff',
  emits: ['close'],
  props: {
    staff: {
      type: Object,
      default: () => ({})
    },
    isOnline: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const isLoading = ref(true)
    const staffData = ref({})
    const error = ref(null)
    
    // Adicionado: Mapeamento de molduras por cargo
    const roleFrames = {
      'Master': 'https://i.imgur.com/vKSn1Rf.png',
      'Gerente': 'https://i.imgur.com/PrNmct9.png',
      'Admin': 'https://i.imgur.com/Ija4A2v.png',
      'Moderador': 'https://i.imgur.com/2j0a8Kb.png',
      'Ajudante': 'https://i.imgur.com/NceVmwS.png'
    }

    const getMemberIdentifier = () => {
      if (!props.staff) return null
      return props.staff.username || props.staff.name || props.staff.nickname
    }

    // Adicionado: Função para obter moldura baseada no cargo
    const getRoleFrame = (role) => {
      return roleFrames[role] || null
    }

    const loadStaffData = async () => {
      try {
        isLoading.value = true
        error.value = null
        
        const memberIdentifier = getMemberIdentifier()
        
        if (!memberIdentifier) {
          throw new Error('Identificador do membro não disponível')
        }
        
        const response = await fetch(`http://localhost:3001/api/members/${encodeURIComponent(memberIdentifier)}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Erro ao buscar dados')
        }
        
        const data = await response.json()
        
        if (!data || data.error) {
          throw new Error(data?.error || 'Dados inválidos retornados')
        }
        
        // Mescla dados da API com props básicos
        staffData.value = {
          ...props.staff,
          ...data.member,
          username: data.member?.username || memberIdentifier,
          name: data.member?.name || memberIdentifier
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        error.value = err.message
        staffData.value = {
          ...props.staff,
          username: getMemberIdentifier(),
          name: getMemberIdentifier()
        }
      } finally {
        isLoading.value = false
      }
    }

    const formatCreationDate = (dateString) => {
      if (!dateString) return 'Data não disponível'
      try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        return new Date(dateString).toLocaleDateString('pt-BR', options)
      } catch {
        return 'Data inválida'
      }
    }

    const formatLastSeen = (dateString) => {
      if (props.isOnline) return 'agora mesmo'
      if (!dateString) return 'nunca'
      
      try {
        const now = new Date()
        const lastSeen = new Date(dateString)
        const diffInSeconds = Math.floor((now - lastSeen) / 1000)
        
        if (diffInSeconds < 0) return 'agora mesmo'
        if (diffInSeconds < 60) return `há ${diffInSeconds}s`
        
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        if (diffInMinutes < 60) return `há ${diffInMinutes}min`
        
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `há ${diffInHours}h`
        
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 30) return `há ${diffInDays}d`
        
        const diffInMonths = Math.floor(diffInDays / 30)
        if (diffInMonths < 12) return `há ${diffInMonths}m`
        
        const diffInYears = Math.floor(diffInDays / 365)
        return `há ${diffInYears}a`
      } catch {
        return 'data inválida'
      }
    }

    const lastSeenText = ref('')
    let updateInterval
    
    const updateLastSeen = () => {
      lastSeenText.value = formatLastSeen(staffData.value.last_login || props.staff.last_login)
    }
    
    onMounted(() => {
      loadStaffData().then(() => {
        updateLastSeen()
        updateInterval = setInterval(updateLastSeen, 60000)
      })
    })
    
    onUnmounted(() => {
      clearInterval(updateInterval)
    })

    const handleClose = () => {
      emit('close')
    }

    return {
      handleClose,
      formatCreationDate,
      lastSeenText,
      isLoading,
      staffData,
      error,
      getRoleFrame // Adicionado: Exportando a função
    }
  }
}
</script>

<template>
  <div class="view-staff-dialog">
    <div class="dialog-overlay" @click="handleClose"></div>
    
    <div class="dialog-content">
      <div v-if="isLoading" class="loading-indicator">
        Carregando dados do membro...
      </div>
      
      <div v-else class="informacoes">
        <div class="flex" style="gap: 20px;">
          <router-link 
              v-if="staffData.username || staffData.name"
              :to="`/perfil/${staffData.username || staffData.name}`" 
              style="text-decoration: none; color: black;"
            >
          <div class="foto-perfil" style="position: relative; width: 170px; height: 170px;">
            <!-- Avatar -->

            
            <img 
              :src="staffData.avatar || '/default-avatar.png'" 
              width="180" 
              height="180" 
              alt="Avatar" 
              style="border-radius: 5px; margin-left: -10px;"
            >
            <!-- Moldura sobreposta -->
            <img 
              v-if="staffData.role && getRoleFrame(staffData.role)"
              :src="getRoleFrame(staffData.role)"
              style="
                position: absolute;
                top: 0;
                left: 0;
                width: 182px;
                height: 195px;
                margin-left: -11px;
                margin-top: -3px;
                pointer-events: none;
              "
              alt="Moldura"
            >
          </div>
          </router-link>
         
          <div class="nick">
            <router-link 
              v-if="staffData.username || staffData.name"
              :to="`/perfil/${staffData.username || staffData.name}`" 
              style="text-decoration: none; color: black;"
            >
              <p>{{ staffData.name || staffData.username || 'Nome não disponível' }}</p>
            </router-link>
            <p v-else>Nome não disponível</p>

            <div class="flex" style="gap: 15px;">
              <router-link 
                v-if="staffData.username || staffData.name"
                :to="`/perfil/${staffData.username || staffData.name}`" 
                style="text-decoration: none; color: black;"
              >
                <div class="paginas">
                  <p>Página de Perfil</p>
                </div>
              </router-link>
              <div v-else class="paginas">
                <p>Página de Perfil</p>
              </div>
              
              <router-link 
                v-if="staffData.username || staffData.name"
                :to="`/mensagens/${staffData.username || staffData.name}`" 
                style="text-decoration: none; color: black;"
              >
                <div class="paginas">
                  <p>Enviar mensagem</p>
                </div>
              </router-link>
              <div v-else class="paginas">
                <p>Enviar mensagem</p>
              </div>
              
              <router-link 
                v-if="staffData.username || staffData.name"
                :to="`/perfil/${staffData.username || staffData.name}`" 
                style="text-decoration: none; color: black;"
              >
                <div class="paginas">
                  <p>Seguir</p>
                </div>
              </router-link>
              <div v-else class="paginas">
                <p>Seguir</p>
              </div>
            </div>
            
            <div class="paginas" style="margin-top: 1px; font-size: 15px; color: rgba(44, 44, 44, 0.5);">
              <p>
                Membro desde: {{ formatCreationDate(staffData.data_criacao || staffData.created_at) }} 
                Postagens: {{ staffData.postagens || staffData.post_count || 0 }}
              </p>
              <p style="margin-top: -20px;">
                Curtidas recebidas: {{ staffData.curtidas || staffData.likes_received || 0 }}  
                Pontos de troféu: {{ staffData.trofeus || 0 }} 
                Alertas: {{ staffData.alertas || 0 }}
              </p>
              <p style="margin-top: -20px;">
                Seguidores: {{ staffData.seguidores || 0 }}  
                Seguindo: {{ staffData.seguindo || 0 }}
                <span v-if="staffData.ID">ID: {{ staffData.ID }}</span>
              </p>
              <p>
                {{ staffData.name || staffData.username }} foi visto pela última vez: {{ lastSeenText }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.view-staff-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .dialog-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(0px);
  }
  
  .dialog-content {
    position: relative;
    width: 700px;
    min-height: 230px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    border: 1px solid #333;
    
    .loading-indicator {
      padding: 2em;
      text-align: center;
    }
  }
}

.paginas-dois {
  font-weight: 100;
  font-size: 16px;
  margin-top: -20px;
}

.paginas {
  font-weight: 100;
  font-size: 16px;
  margin-top: -20px;
}

.nick {
  font-size: 25px;
  font-weight: bold;
}

.informacoes {
  padding: 2em;
}

.foto-perfil {
  padding: 0em;
  width: 170px;
  height: 170px;
  border-radius: 5px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.flex {
  display: flex;
}
</style>