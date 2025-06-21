<template>
  <div class="container">
    <div class="usuarios">
      <div class="flex">
        <div class="usuarios-container">
          <div class="usuarios-title">
            <p>Boas vindas ao Lugin</p>
            <div class="usuarios-subtitle">
              <p>Registre com sua conta do Minecraft</p>
              <p style="margin-top: -10px; font-weight: bold; margin-bottom: -15px;">
                Atenção: o nick e a senha são as mesmas do jogo em redeboom.com. Para dúvidas, acesse boom.com/duvida
              </p>
            </div>
            <q-input
              v-model="form.username"
              style="width: 100%; margin-top: 40px;"
              label="Nick"
              outlined

            />
            <q-input
              v-model="form.email"
              style="width: 100%; margin-top: 10px;"
              label="Email"
              outlined
              type="email"
         
            />
            <q-input
              v-model="form.password"
              style="width: 100%; margin-top: 10px;"
              label="Senha"
              type="password"
              outlined
             
            />
            <q-input
              v-model="form.confirmPassword"
              style="width: 100%; margin-top: 10px;"
              label="Repita a senha"
              type="password"
              outlined
             
            />
            <p style="font-size: 12px;color:gray;font-weight: normal; text-align: left; margin-top: 20px;margin-bottom: -5px;">
              Ao entrar você concorda com nossos Termos de uso e Política de Privacidade e que sua conta é única e pertencente sua. Além disso, garante que segue as diretrizes da comunidade. A utilização da conta é de inteira responsabilidade do usuário.
            </p>
            
            <!-- Área de mensagens -->
            <div 
              v-if="message.text"
              :class="['message-box', message.type]"
            >
              {{ message.text }}
              <span v-if="message.countdown">Redirecionando em {{ message.countdown }}s...</span>
            </div>
            
            <q-btn
              color="orange"
              label="Registrar"
              style="font-weight: bold; width: 100%; margin-top: 20px;"
              @click="handleRegister"
              :loading="loading"
            />
            <q-btn
              color="green"
              outline
              label="Já possuo conta"
              style="font-weight: bold; width: 100%; margin-top: 20px;"
              @click="goToLogin"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    
    const form = ref({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    
    const loading = ref(false)
    const message = ref({
      text: '',
      type: '',
      countdown: 0
    })
    
    const showMessage = (type, text, redirect = false) => {
      message.value = { text, type, countdown: 0 }
      
      if (redirect) {
        message.value.countdown = 3
        const timer = setInterval(() => {
          message.value.countdown--
          if (message.value.countdown <= 0) {
            clearInterval(timer)
            router.push('/forum')
          }
        }, 1000)
      }
    }
    
    const validateForm = () => {
      if (!form.value.username || !form.value.email || 
          !form.value.password || !form.value.confirmPassword) {
        showMessage('error', 'Todos os campos são obrigatórios')
        return false
      }
      
      if (form.value.password !== form.value.confirmPassword) {
        showMessage('error', 'As senhas não coincidem')
        return false
      }
      
      if (form.value.password.length < 6) {
        showMessage('error', 'A senha deve ter pelo menos 6 caracteres')
        return false
      }
      
      if (!/.+@.+\..+/.test(form.value.email)) {
        showMessage('error', 'Email inválido')
        return false
      }
      
      return true
    }
    
 const handleRegister = async () => {
  if (!validateForm()) return
  
  loading.value = true
  message.value = { text: '', type: '' }
  
  try {
    const avatarUrl = `https://cravatar.eu/helmavatar/${encodeURIComponent(form.value.username)}/190.png`;
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: form.value.username,
        email: form.value.email,
        password: form.value.password,
        minecraftNick: form.value.username,
        avatar: avatarUrl
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro no registro')
    }

    // AUTOLOGIN após registro - Adicione esta parte
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: form.value.username,
        password: form.value.password
      })
    })

    if (!loginResponse.ok) {
      throw new Error('Erro no login automático')
    }

    const loginData = await loginResponse.json()
    
    // Salva o token e os dados do usuário
    localStorage.setItem('authToken', loginData.token)
    localStorage.setItem('user', JSON.stringify(loginData.user))
    
    showMessage('success', 'Registro e login realizados com sucesso!', true)
    router.push('/forum') // Redireciona diretamente para o perfil
  } catch (error) {
    let errorMessage = error.message
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Não foi possível conectar ao servidor'
    }
    
    showMessage('error', errorMessage)
  } finally {
    loading.value = false
  }
}
    
    const goToLogin = () => {
      router.push('/login')
    }
    
    return {
      form,
      loading,
      message,
      handleRegister,
      goToLogin
    }
  }
}
</script>

<style scoped>
.usuarios-subtitle {
  font-size: 14px;
  color: black;
  font-weight: 100;
  margin-top: -15px;
}
.usuarios-container {
  width: 100%;
}
.usuarios-title {
  padding: 1em;
  font-weight: 800;
  font-size: 19px;
  color: #0088cc;
  text-align: center;
}
.usuarios {
  box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
  padding: 1em;
  background: white;
  margin-top: 20px;
  width: 500px;
  margin: 0 auto;
  margin-top: 20px;
  height: 100%;
  border-radius: 5px;
}

/* Estilos para as mensagens */
.message-box {
  padding: 12px;
  margin-top: 20px;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
}

.message-box.success {
  background-color: #e6f7e6;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.message-box.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.message-box span {
  display: block;
  font-size: 0.9em;
  margin-top: 5px;
  font-weight: normal;
}
</style>