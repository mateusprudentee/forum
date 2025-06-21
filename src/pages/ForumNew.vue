<template>
  <div class="navbar-forum">
    <div class="navbar-forum-inicio">
      <q-icon name="home" />
    </div>
    <div class="navbar-forum-itens-um"></div>
    <router-link to="/forum" style="text-decoration: none;">
      <div class="navbar-forum-itens-forum">
        <p style="margin-left: 19px;">Fórum</p>
      </div>
    </router-link>
    <div class="navbar-forum-itens-um"></div>
    <router-link 
  :to="`/forum/categoria/${encodeURIComponent(currentCategory)}`" 
  style="text-decoration: none;"
>
  <div class="navbar-forum-itens-forum">
    <p v-if="currentCategory" style="margin-left: 20px;">
      {{ currentCategory }}
    </p>
  </div>
</router-link>

    <div class="navbar-forum-itens-um"></div>
    <div class="navbar-forum-itens">
      <p v-if="currentCategory" style="margin-left: 20px;">
        Novo tópico
      </p>
    </div>
  </div>

  <div class="forum-layout">
    <div class="forum-main">
      <div class="forum-baixo" style="height: 75px;">
        <div class="flex">
          <div class="forum-card-post">
            <q-input
              v-model="newTopicTitle"
              placeholder="Título do tópico"
              class="title-input"
              borderless
            />
          </div>
        </div>
      </div>

      <div class="forum-baixo" style="margin-top: -10px">
        <div class="forum-baixo-topicos">
          <QuillEditor
            v-model:content="newTopicContent"
            content-type="html"
            theme="snow"
            placeholder="Escreva sua mensagem aqui..."
            style="font-family: 'Ubuntu', sans-serif; min-height: 300px; background-color: white; border-radius: 0px; margin-bottom: 20px; text-align: left; font-weight: normal ;
font-size: 18px;
    color: rgb(86, 88, 103);"
          />
        </div>
      </div>

      <div class="forum-baixo" style="margin-top: -10px; justify-content: flex-end;">
        <q-btn
          label="CRIAR TÓPICO"
          color="primary"
          @click="createNewTopic"
          :disable="!newTopicTitle || !newTopicContent"
        />
        <q-btn
          label="Cancelar"
          flat
          color="white"
          @click="cancelNewTopic"
          class="q-ml-sm"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useQuasar } from 'quasar'

export default {
  name: 'ForumNew',
  components: {
    QuillEditor
  },
  setup() {
    
    const route = useRoute()
    const router = useRouter()
    const $q = useQuasar()

    const newTopicTitle = ref('')
    const newTopicContent = ref('')
    const currentCategory = ref(route.params.category || route.query.category || '')
    const isLoggedIn = ref(false)
    const currentUser = ref(null)

    // Verificar status de autenticação ao montar o componente
    onMounted(() => {
      checkAuthStatus()
    })

const checkAuthStatus = async (silent = false) => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  if (!token) {
    cleanupAuth();
    return false;
  }

  try {
    const response = await fetch('http://localhost:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Verificação MELHORADA da resposta
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Falha na autenticação');
    }

    // Obtém os dados SEM transformação (assume formato direto do backend)
    const userData = await response.json();
    
    // Verificação dos campos ESSENCIAIS
    if (!userData || !userData.id || !userData.username) {
      throw new Error('Dados do usuário incompletos');
    }

    // Atualiza os estados
    currentUser.value = userData;
    isLoggedIn.value = true;
    localStorage.setItem('userData', JSON.stringify(userData));
    
    return true;

  } catch (error) {
    console.error('Erro na verificação:', error.message);
    cleanupAuth();
    
    if (!silent) {
      alert(error.message.includes('expirou') ? 'Sessão expirada' : error.message);
      router.push('/login');
    }
    return false;
  }
};

// Função auxiliar para limpar autenticação
const cleanupAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  isLoggedIn.value = false;
  currentUser.value = null;
};

const createNewTopic = async () => {
  // Verifica autenticação primeiro
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    alert('Sessão expirada. Por favor, faça login novamente.');
    router.push('/login');
    return;
  }

  // Validação dos campos
  if (!newTopicTitle.value.trim() || !newTopicContent.value.trim()) {
    alert('Por favor, preencha todos os campos obrigatórios');
    return;
  }

  try {
    // Obtém os dados do usuário - agora usando currentUser que foi atualizado pelo checkAuthStatus
    if (!currentUser.value || !currentUser.value.username) {
      throw new Error('Dados do usuário não encontrados');
    }

    const response = await fetch('http://localhost:3001/api/forum/topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        title: newTopicTitle.value,
        category: currentCategory.value,
        content: newTopicContent.value,
        author: currentUser.value.username // Usa o username do usuário logado
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar tópico');
    }

    const result = await response.json();
    router.push(`/forum`);
    
  } catch (error) {
    console.error('Erro ao criar tópico:', error);
    alert(error.message);
  }
};


    // Função para pré-preencher os campos quando a categoria for "Denuncias"
    const prefillDenunciaFields = () => {
      if (currentCategory.value.toLowerCase() === 'denuncias') {
        newTopicContent.value = 
          'Nick: \n' +
          'Motivo: \n' +
          'Prova (Imgur ou YouTube): \n\n';
      }
    }

    // Observar mudanças na categoria
    watch(currentCategory, (newVal) => {
      if (newVal.toLowerCase() === 'denuncias') {
        prefillDenunciaFields()
      }
    })

    // Chamar a função quando o componente é montado
    prefillDenunciaFields()
    const cancelNewTopic = () => {
      router.push({
        name: 'ForumView',
        params: {
          category: currentCategory.value
        }
      })
    }

    return {
      newTopicTitle,
      newTopicContent,
      currentCategory,
      isLoggedIn,
      currentUser,
      createNewTopic,
      cancelNewTopic
    }
  }
}
</script>
  <style scoped>
  .title-input {
  width: 100%;
  margin-top: -10px;
}

  .forum-baixo-topicos {
        font-size: 22px;
    font-weight: 100;
    margin-bottom: -20px;
    color: #2b2b2b;
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
.topico-por-em {
  font-size: 14px;
    font-weight: 300;
    margin-bottom: 3px;
    color: rgb(97, 97, 97);
    margin-top: -20px;
    float: none;
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
.afterDiscussionListHandle {
    margin-top: 36px;
}
.afterDiscussionListHandle {
    margin-top: 20px;
}
.pageNavLinkGroup {
    display: table;
    table-layout: fixed;
    box-sizing: border-box;
    font-size: 12px;
    margin: 8px 0;
    line-height: 26px;
}
.pagination {
    margin: 0;
}
.pagination {
    display: inline-block;
    padding-left: 0;
    margin: 20px 0;
    border-radius: 4px;
}
.pagination > .active > a {
    cursor: pointer !important;
}
.pagination > .active > a, .pagination > .active > span, .pagination > .active > a:hover, .pagination > .active > span:hover, .pagination > .active > a:focus, .pagination > .active > span:focus {
    background-color: #0085ff;
    border-color: #007ab8;
}
.pagination > .active > a, .pagination > .active > span, .pagination > .active > a:hover, .pagination > .active > span:hover, .pagination > .active > a:focus, .pagination > .active > span:focus {
    z-index: 3;
    color: #fff;
    cursor: default;
    background-color: #337ab7;
    border-color: #337ab7;
}
.pagination > li > a, .pagination > li > span {
    font-size: 16px;
}
.pagination > li > a, .pagination > li > span {
    color: #fff;
}
.pagination > li > a, .pagination > li > span {
    position: relative;
    float: left;
    padding: 6px 12px;
    margin-left: -1px;
    line-height: 1.42857143;
    color: #337ab7;
    text-decoration: none;
    border: none;
    border-radius: 5px;
    background-color: #676767;
    margin: 0 5px;
}
.pagination > li {
    display: inline;
}
li {
    list-style: none;
}
.pagination > .active > a, .pagination > .active > span, .pagination > .active > a:hover, .pagination > .active > span:hover, .pagination > .active > a:focus, .pagination > .active > span:focus {
    background-color: #0085ff;
    border-color: #007ab8;
}

element.style {
}
.pagination > li > a, .pagination > li > span {
    font-size: 16px;
}
.pagination > li > a, .pagination > li > span {
    color: #fff;
}
.pagination > li > a, .pagination > li > span {
    position: relative;
    float: left;
    padding: 6px 12px;
    margin-left: -1px;
    line-height: 1.42857143;
    color: white;
    text-decoration: none;
    border: none;
    border-radius: 5px;
    background-color: #676767;
    margin: 0 5px;
}
.pagination > .disabled > span, .pagination > .disabled > span:hover, .pagination > .disabled > span:focus, .pagination > .disabled > a, .pagination > .disabled > a:hover, .pagination > .disabled > a:focus {
    color: #fff;
    background-color: #676767;
}
.pagination > li:last-child > a, .pagination > li:last-child > span {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}
.pagination > .active > a {
    cursor: pointer !important;
}
.pagination > .active > a, .pagination > .active > span, .pagination > .active > a:hover, .pagination > .active > span:hover, .pagination > .active > a:focus, .pagination > .active > span:focus {
    background-color: #0085ff;
    border-color: #007ab8;
}
.mostrando {
      margin-top: 16px;
    color: #676767;
}
.ultima-resposta-nick {
  margin-top: -17px;
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

  .sem-permissao {
        margin-left: 10px;
    display: block;
    margin-left: auto;
        float: right;
        margin-top: -30px;
        font-size: 12px;
  }
   .topicos-views {
    margin-top: -15px;
    font-weight: normal;
    font-size: 14px;
    color: gray;
  }
  .skeleton-dark {
    background-color: rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px;
  }
  
  .topicos-title-baixo {
        font-weight: 300;
        color: black;
;
    flex-grow: 1;
    text-align: left;
    font-size: 16px;
  }
  
  .topicos-abaixo {
    color: gray;
    cursor: pointer;
    border-bottom: 0.5px solid rgb(238, 238, 238);
    padding-top: 0px;
  }
  .topicos-abaixo:last-child {
  border-bottom: none;
}
  .linha {
    width: 100%;
    margin-bottom: 35px;
    margin-top: -20px;
    height: 1px;
    background: rgba(128, 128, 128, 0.048);
  }
  
  .forum-baixo {
    width: 100%;
    margin-top: 20px;
    background-color: #fff;
    border-radius: 5px;
    -webkit-box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
    padding: 20px;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  
  .ultima-resposta-container {
    margin-top: 22px;
  }
  
  .ultima-resposta-pessoa {
    color: rgba(128, 128, 128, 0.486);
    margin-top: -20px;
  }
  
  .ultima-resposta {
    text-align: right;
    color: gray;
    padding-top: 0px;
    margin-top: 5px;
  }
  
  .flex {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .forum-card-post {
    font-size: 22px;
    width: 100%;
    font-weight: 100;
    color: #2b2b2b;
  }
  
  .forum-layout {
    display: flex;
    gap: 20px;
    width: 100%;
  }
  
  .forum-main {
    width: 100%;
  }
  
  .container {
    width: 1150px;
    font-family: 'Ubuntu', sans-serif;
    margin: 0 auto;
    text-align: center;
    margin-top: 10px;
    background-color: #000;
    padding-bottom: 20px; 
  }
  
  body {
    margin: 0;
    padding: 0;
    background-color: #000; 
  }
  
  .skin {
    margin-right: 10px;
  }
  </style>