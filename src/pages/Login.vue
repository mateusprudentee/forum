<template>
  <div class="container">
    <div class="usuarios">
      <div class="flex">
        <div class="usuarios-container">
          <div class="usuarios-title">
            <p>Boas vindas ao Lugin</p>
            <div class="usuarios-subtitle">
              <p>Entre em sua conta do Minecraft</p>
            </div>
            <q-input
              v-model="form.username"
              style="width: 100%; margin-top: 40px;"
              label="Nick ou email"
              outlined
            />
            <q-input
              v-model="form.password"
              style="width: 100%; margin-top: 15px;"
              label="Senha"
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
              color="positive"
              label="Entrar"
              style="font-weight: bold; width: 100%; margin-top: 20px;"
              @click="handleLogin"
              :loading="loading"
            />
            <q-btn
              color="orange"
              outline
              label="Ainda não tenho conta"
              style="font-weight: bold; width: 100%; margin-top: 20px;"
              @click="goToRegister"
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
  name: 'Login',
  setup() {
    const router = useRouter()
    
    const form = ref({
      username: '',
      password: ''
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
      if (!form.value.username || !form.value.password) {
        showMessage('error', 'Nick/email e senha são obrigatórios')
        return false
      }
      return true
    }
    
    const handleLogin = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro no login');
    }
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redireciona para a rota original ou para o perfil
    const redirect = router.currentRoute.value.query.redirect || '/forum';
    router.push(redirect);
    
  } catch (error) {
    showMessage('error', error.message || 'Falha no login');
  } finally {
    loading.value = false;
  }
};
    
    const goToRegister = () => {
      router.push('/register')
    }
    
    return {
      form,
      loading,
      message,
      handleLogin,
      goToRegister
    }
  }
}
</script>

<style scoped>
/* Estilos anteriores mantidos */
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.usuarios-subtitle {
  font-size: 14px;
  color: black;
  font-weight: 100;
  margin-top: -15px;
  text-align: center;
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

.flex {
  display: flex;
  justify-content: center;
}

/* Estilos para as mensagens (iguais ao Register.vue) */
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