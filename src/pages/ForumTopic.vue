<template>
 <div class="navbar-forum">
    <div class="navbar-forum-inicio">
      <q-icon name="home" />
    </div>
    <div class="navbar-forum-itens-um"></div>
    <router-link
      to="/forum"
      style="text-decoration: none;"
    > 
      <div class="navbar-forum-itens-forum">
        <p style="margin-left: 19px;">Fórum</p>
      </div>
    </router-link>
     
    <div class="navbar-forum-itens-um"></div>
    
    <router-link
      :to="`/forum/categoria/${topicData.categoria}`"
      style="text-decoration: none;"
    >
      <div 
        class="navbar-forum-itens-forum" 
      >
        <div 
          :class="{ 'navbar-forum-itens': !subcategory }" 
          :style="!subcategory ? { height: '100px', marginLeft: '-10px', marginTop: '-12px' } : {}"
        >
          <p style="margin-left: 19px;">{{ topicData.categoria }}</p>
        </div>
      </div>
    </router-link>
  </div>
  
  <div class="forum-layout">
    <div class="forum-main">
      <div class="subforum">
        <div class="subforum-header">
          <div class="subforum-title">
            <p>{{ topicData.titulo }}</p>
          </div>
          <div class="subforum-link" style="display: flex; align-items: center; gap: 10px;">
          </div>
        </div>
        <div class="subforum-subtitle">
          <p>Tópico em '<a style="color: black">{{ topicData.categoria }}</a>' criado por <a style="color: black">{{ topicData.autor }}</a>, {{ formatTopicDate(topicData.criado_em) }}.</p>
        </div>
        <div class="fechado" v-if="topicData.trancado === 'sim'">
          <p>Estado do tópico:</p>
          <p>Fechado para novas respostas.</p>
        </div>
        <div class="flex" style="margin-top: -30px;">
          <q-btn-dropdown 
            flat
            color="blue"
            label="Multimoderações"
            class="multimoderacao"
            no-caps
          >
            <q-list dark class="multimoderacao-itens">
              
              <q-item clickable v-close-popup @click="prepareMultimoderacao('denuncia_aceita')" class="multimoderacao-itens-item">
                <q-item-section>
                  <p><q-icon name="check"></q-icon> Denúncia aceita</p>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="prepareMultimoderacao('denuncia_analise')" class="multimoderacao-itens-item">
                <q-item-section>
                  <p><q-icon name="pending"></q-icon> Denúncia em análise</p>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="prepareMultimoderacao('acusado_punido')" class="multimoderacao-itens-item">
                <q-item-section>
                  <p><q-icon name="close"></q-icon> Acusado já punido</p>
                </q-item-section>                  
              </q-item>
              <q-item clickable v-close-popup @click="prepareMultimoderacao('nao_infracao')" class="multimoderacao-itens-item">
                <q-item-section>
                  <p><q-icon name="close"></q-icon> Não caracteriza infração</p>
                </q-item-section>                  
              </q-item>
              <q-item clickable v-close-popup @click="prepareMultimoderacao('prova_editada')" class="multimoderacao-itens-item">
                <q-item-section>
                  <p><q-icon name="close"></q-icon> Prova editada</p>
                </q-item-section>                  
              </q-item>
              <q-item clickable v-close-popup @click="prepareMultimoderacao('provas_insuficientes')" class="multimoderacao-itens-item">
                <q-item-section>
                  <p><q-icon name="close"></q-icon> Provas insuficientes</p>
                </q-item-section>                  
              </q-item>
            </q-list>
          </q-btn-dropdown>

        <!-- Substitua o ícone de engrenagem atual por: -->
<div class="curtir-agora" style="margin-left: 5px; ">
  <q-btn-dropdown 
    flat 
    icon="settings"
    style="font-size: 10px; margin-top: 10px; " 
    class="btn btn-primary"
    no-caps
  >
    <q-list dark class="multimoderacao-itens" style="padding: 0.5em; ">
      <q-item clickable v-close-popup @click="toggleTopicLock">
        <q-item-section>
          <p style="color: gray; font-size: 16px; margin-top: 10px;">
            <q-icon :name="topicData.trancado === 'sim' ? 'lock_open' : 'lock'" />
            &nbsp; {{ topicData.trancado === 'sim' ? 'Destrancar' : 'Trancar' }}
          </p>
        </q-item-section>
      </q-item>

      <q-item clickable v-close-popup @click="openDeleteDialog" style="margin-top: -20px;">
        <q-item-section>
          <p style="color: gray; font-size: 16px; margin-top: 10px;">
            <q-icon name="delete"/>
            &nbsp; Excluir 
          </p>
        </q-item-section>
      </q-item>

       <q-item clickable v-close-popup @click="openDeleteDialog" style="margin-top: -20px;">
        <q-item-section>
          <p style="color: gray; font-size: 16px; margin-top: 10px;">
            <q-icon name="star"/>
            &nbsp; Destacar
          </p>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</div>
        </div>
      </div>

      <div class="topic-container">
        <div class="left-side">
          <router-link :to="`/perfil/${topicData.autor}`" 
              style="text-decoration: none; color: black;"
            >
          <p class="username" :style="{ color: roleColor(topicData.autor_cargo), fontWeight: 'bold' }">{{ topicData.autor }}</p>
         </router-link>
          <router-link :to="`/perfil/${topicData.autor}`" 
              style="text-decoration: none; color: black;"
            >
          <div style="position: relative; width: 210px; height: 210px;">
    <img :src="roleImage(topicData.autor_cargo)" :alt="topicData.autor" style="position: absolute; top: 0; left: 0; width: 210px; height: 220px; z-index: 2;">
    <img :src="topicData.avatar" :alt="topicData.autor" style="position: absolute; top: 0; left: 0; width: 210px; height: 210px; z-index: 1; border-radius: 20px;">
  </div>
  </router-link>
            <div class="user-info">
            <div class="orientacao-estatistica">
              <div class="orientacao-left">
                <p>Membro desde</p>
                <p>Postagens</p>
                <p>Curtidas</p>
              </div>
              <div class="orientacao-left-left">
                <p>{{ formatMemberSince(topicData.data_criacao) }}</p>
                <p>{{ topicData.postagens }}</p>
                <p>{{ topicData.curtidas }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="right-side">
          <div class="topic-content-wrapper">
            <div class="topic-text" v-if="topicData.content" v-html="topicData.content"></div>
            <div class="topic-text" v-else>
              <p>Nenhum conteúdo disponível para este tópico.</p>
            </div>
            
            <div class="topic-stats">
              <span>
                <q-icon name="schedule" />  
                <q-checkbox 
                  v-model="topicCheckbox" 
                  dense 
                  size="xs" 
                  @click="openDeleteDialog" 
                />  
                {{ topicData.autor }}, {{ formatTopicDate(topicData.criado_em) }}
              </span>
            </div>
            
            <div class="curtidas-e-botao">
              <div class="curtidas">
                <b>0</b>
                <p style="font-size: 16px; font-weight: normal;">curtidas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de respostas -->
        <div class="replies-container" v-if="replies.length > 0">
    <div class="reply" v-for="reply in replies" :key="reply.id">
      <div class="left-side">
        <router-link :to="`/perfil/${reply.author}`" 
              style="text-decoration: none; color: black;"
            >
        <p class="username" :style="{ color: roleColor(reply.author_role), fontWeight: 'bold' }">{{ reply.author }}</p>
        </router-link>
        <router-link :to="`/perfil/${reply.author}`" 
              style="text-decoration: none; color: black;"
            >
        <div style="position: relative; width: 210px; height: 210px;">
        <img :src="roleImage(reply.author_role)" :alt="reply.author" style="position: absolute; top: 0; left: 0; width: 210px; height: 220px; z-index: 2;">
        <img :src="reply.author_avatar" :alt="reply.author" style="position: absolute; top: 0; left: 0; width: 210px; height: 210px; z-index: 1; border-radius: 20px;">
      </div>
      </router-link>
              <div class="user-info">
          <div class="orientacao-estatistica">
            <div class="orientacao-left">
              <p>Membro desde</p>
              <p>Postagens</p>
              <p>Curtidas</p>
            </div>
            <div class="orientacao-left-left">
              <p>{{ formatMemberSince(reply.author_created_at) }}</p>
              <p>{{ reply.author_posts || 0 }}</p>
              <p>{{ reply.author_likes || 0 }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="right-side">
        <div class="topic-content-wrapper">
          <div class="topic-text" v-html="reply.content"></div>
          
          <div class="topic-stats">
            <span>
              <q-checkbox 
                v-model="reply.selected" 
                dense 
                size="xs" 
                @click="openDeleteDialogMessage(reply)" 
              />
              <q-icon name="schedule" /> 
              {{ formatDate(reply.created_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

      <!-- Formulário de resposta -->
       <div class="right-side-resposta" v-if="topicData.trancado !== 'sim' && isLoggedIn">
    <div class="responder">
      <p>Responder</p>
    </div>
    <div class="campo-resposta">
      <div class="campo-resposta-input">
        <div class="q-dark" style="padding: 0; background: white;">
          <q-input
            v-model="replyContent"
            :toolbar="editorToolbar"
            type="textarea"
            outlined
            style="min-height: 50px;"
            placeholder=""
            class="custom-dark-input"
          />
        </div>
      </div>
    </div>
    <div class="botoes-resposta">
      <q-btn 
        color="primary" 
        label="COMENTAR"
        @click="submitReply"
        :loading="replying"
        :disable="!replyContent"
      ></q-btn>
    </div>
  </div>
    <!-- Adicionar esta seção para usuários não logados -->
  <div class="login-prompt" v-if="topicData.trancado !== 'sim' && !isLoggedIn" style="text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; margin-top: 20px;">
    <p>Você precisa <router-link to="/login">fazer login</router-link> para responder a este tópico.</p>
  </div>


      <div class="fechado" style="margin-top: 20px;" v-if="topicData.trancado === 'sim'">
          <p>Estado do tópico:</p>
          <p>Fechado para novas respostas.</p>
        </div>
    </div>
  </div>

   <!-- Diálogo de confirmação para rodar multimoderação -->
  <q-dialog v-model="showMultimoderacao" >
    <q-card style="width: 1000px;">
      <q-card-section>
        <div class="text-h6" style="margin-bottom: 8px;
  text-align: left;
  font-family: 'Ubuntu', sans-serif;
  font-size: 18px;
  padding: 0.3em;
  border-radius: 10px;
  font-weight: normal; background: rgb(83 83 83); color: white;">Rodar multimoderação para o tópico {{ topicData.titulo }}</div>
      </q-card-section>

      

      <q-card-actions align="center" style="margin-top: -10px;">
        <q-btn outlined label="Rodar multimoderação" color="primary" style="font-weight: bold;"v-close-popup @click="sendPredefinedReply(currentMultimoderacaoType)" />
        <q-btn flat label="Cancelar" color="negative" style="font-weight: bold;" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>


  <!-- Diálogo de confirmação para deletar tópico -->
  <q-dialog v-model="showDeleteDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6" style="margin-bottom: 8px;
  text-align: center;
  font-family: 'Ubuntu', sans-serif;
  font-size: 18px;
  font-weight: bold;">Deseja excluir o tópico?</div>
      </q-card-section>

      <q-card-section class="q-pt-none" style="margin-bottom: 8px;
  text-align: center;
  font-family: 'Ubuntu', sans-serif;
  font-size: 16px;
  font-weight: normal; margin-top: -25px;">
        Esta ação é irreversível e imediata
      </q-card-section>

      <q-card-actions align="center" style="margin-top: -20px;">
        <q-btn flat label="Cancelar" color="primary" v-close-popup @click="topicCheckbox = false" />
        <q-btn outlined label="Deletar" color="negative" v-close-popup @click="deleteTopic" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- Diálogo de confirmação para deletar mensagem -->
<q-dialog v-model="showDeleteMessageDialog">
  <q-card>
    <q-card-section>
      <div class="text-h6" style="margin-bottom: 8px;
        text-align: center;
        font-family: 'Ubuntu', sans-serif;
        font-size: 18px;
        font-weight: bold;">
        Deseja excluir esta mensagem?
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none" style="margin-bottom: 8px;
      text-align: center;
      font-family: 'Ubuntu', sans-serif;
      font-size: 16px;
      font-weight: normal; margin-top: -25px;">
      Esta ação é irreversível e imediata
    </q-card-section>

    <q-card-actions align="center" style="margin-top: -20px;">
      <q-btn flat label="Cancelar" color="primary" v-close-popup />
      <q-btn outlined label="Deletar" color="negative" v-close-popup @click="deleteMessage" />
    </q-card-actions>
  </q-card>
</q-dialog>
</template>

<script>
export default {
  name: 'ForumTopic',
  props: ['id', 'subcategory'],
  data() {
    return {
      roleImages: {
        'Master': 'https://i.imgur.com/vKSn1Rf.png',
        'Gerente': 'https://i.imgur.com/PrNmct9.png',
        'Admin': 'https://i.imgur.com/Ija4A2v.png',
        'Moderador': 'https://i.imgur.com/2j0a8Kb.png',
        'Ajudante': 'https://i.imgur.com/NceVmwS.png'
      },
      roleColors: {
        'Master': '#ffc400',
        'Gerente': '#d00000',
        'Admin': '#ff5555',
        'Moderador': '#00ae09',
        'Ajudante': '#e0ff00'
      },
      showDeleteMessageDialog: false,
      selectedReply: null,
      loading: true,
      replying: false,
      isLoggedIn: false,
      currentUser: null,
      topicCheckbox: false,
      showDeleteDialog: false,
      showMultimoderacao: false,
      currentMultimoderacaoType: '',
      currentMultimoderacaoLabel: '',
      replyContent: '',
      topicData: {
        titulo: '',
        avatar: '',
        categoria: '',
        visualizacoes: 0,
        autor: '',
        autor_cargo: '',
        respostas: 0,
        content: '',
        posts_autor: 0,
        criado_em: '',
        data_criacao: null,
        postagens: 0,
        curtidas: 0,
        ultimo_login: null
      },
      replies: [],
      editorToolbar: [
        ['bold', 'italic', 'strike', 'underline'],
        ['unordered', 'ordered'],
        ['link'],
        ['quote'],
        ['undo', 'redo']
      ],
      predefinedMessages: {
        denuncia_analise: `
<b>Denúncia em análise.</b>
\n
Agradecemos sua colaboração na denuncia de jogadores que infringem nossas regras. Sua denúncia está em análise e em breve terá uma resposta.
        `,
        denuncia_aceita: `
<b>Denúncia aceita e acusado punido.</b>
\n
Agradecemos sua colaboração na denuncia de jogadores que infringem nossas regras. O jogador encontra-se punido. Consulte o status da punição através de nossa página de punições em https://redeboom.com/punicoes.
        `,
        acusado_punido: `
<b>Acusado já punido.</b>
\n
Verificamos que o jogador denunciado já se encontra punido pela infração reportada. Agradecemos sua colaboração.
        `,
        nao_infracao: `
<b>Não caracteriza infração.</b>
\n
Após análise, verificamos que a situação reportada não caracteriza infração às nossas regras. Caso tenha dúvidas, consulte nosso regulamento em https://redeboom.com/regras.
        `,
        prova_editada: `
<b>Prova editada.</b>
\n
Identificamos que as provas enviadas foram editadas ou adulteradas, o que invalida a denúncia. Envie novamente as provas originais sem edições.
        `,
        provas_insuficientes: `
<b>Provas insuficientes.</b>
\n
As provas enviadas são insuficientes para comprovar a infração. Caso possua mais evidências, envie-as para análise.
        `
      },
      multimoderacaoLabels: {
        denuncia_analise: 'Denúncia em análise',
        denuncia_aceita: 'Denúncia aceita',
        acusado_punido: 'Acusado já punido',
        nao_infracao: 'Não caracteriza infração',
        prova_editada: 'Prova editada',
        provas_insuficientes: 'Provas insuficientes'
      }
    }
  },
  computed: {
    roleImage() {
      return (role) => {
        return this.roleImages[role] || 'https://i.imgur.com/PrNmct9.png';
      }
    },
    roleColor() {
      return (role) => {
        return this.roleColors[role] || '#000000';
      }
    },
   formattedTopicLink() {
  if (!this.topicData.titulo || !this.topicData.categoria) return '';
  
  const formattedCategory = encodeURIComponent(
    this.topicData.categoria.replace(/\s+/g, '-').toLowerCase()
  );
  
  const formattedTitle = encodeURIComponent(
    this.topicData.titulo.replace(/\s+/g, '-').toLowerCase()
  );
  
  // Sempre gera link sem subcategoria - o router vai lidar com isso
  return `/forum/view/${formattedCategory}/${formattedTitle}?id=${this.id}`;
},
    formattedDate() {
      if (!this.topicData.criado_em) return '';
      const date = new Date(this.topicData.criado_em);
      return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },
  },
  created() {
    this.checkAuthStatus();
    this.loadTopicData();
    this.loadReplies();
  },
  methods: {
    
    slugToName(slug) {
      if (!slug) return '';
      return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    getDefaultAvatar(username) {
      return `https://cravatar.eu/helmavatar/${encodeURIComponent(username)}/190.png`;
    },

    formatMemberSince(dateString) {
      if (!dateString) return 'Nunca';
      
      const date = new Date(dateString);
      const now = new Date();
      const day = date.getDate();
      
      const monthNames = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      if (date.getFullYear() === now.getFullYear()) {
        return `${day} de ${month}`;
      }
      return `${day} de ${month} de ${year}`;
    },
    
    formatLastActivity(dateString) {
      if (!dateString) return 'Nunca';
      
      const now = new Date();
      const lastActivity = new Date(dateString);
      const diffInSeconds = Math.floor((now - lastActivity) / 1000);
      
      if (diffInSeconds < 60) {
        return `há ${diffInSeconds}s`;
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `há ${diffInMinutes} min`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `há ${diffInHours} h`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `há ${diffInDays} dia${diffInDays !== 1 ? 's' : ''}`;
      }
      
      return this.formatDate(dateString);
    },

    openDeleteDialogMessage(reply) {
      this.selectedReply = reply;
      this.showDeleteMessageDialog = true;
    },
  
    async deleteMessage() {
      try {
        const response = await fetch(`http://localhost:3001/api/forum/delete/reply/${this.selectedReply.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Falha ao deletar mensagem');

        this.replies = this.replies.filter(r => r.id !== this.selectedReply.id);
        this.topicData.respostas = Math.max(0, this.topicData.respostas - 1);
        
      } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
      } finally {
        this.showDeleteMessageDialog = false;
        this.selectedReply = null;
      }
    },
  
    async toggleTopicLock() {
      try {
        const newStatus = this.topicData.trancado === 'sim' ? 'não' : 'sim';
        
        const response = await fetch(`http://localhost:3001/api/forum/topic/${this.id}/lock`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({
            trancado: newStatus
          })
        });

        if (!response.ok) throw new Error('Falha ao alterar status do tópico');

        const result = await response.json();
        this.topicData.trancado = result.trancado;
      } catch (error) {
        console.error('Erro ao alterar status do tópico:', error);
      }
    },

    prepareMultimoderacao(type) {
      this.currentMultimoderacaoType = type;
      this.currentMultimoderacaoLabel = this.multimoderacaoLabels[type] || type;
      this.showMultimoderacao = true;
    },
    
    openDeleteDialog() {
      this.showDeleteDialog = true;
    },

    async deleteTopic() {
      try {
        const response = await fetch(`http://localhost:3001/api/forum/delete/topic/${this.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Falha ao deletar tópico');

        setTimeout(() => {
          this.$router.push('/forum');
        }, 1000);
      } catch (error) {
        console.error('Erro ao deletar tópico:', error);
      } finally {
        this.topicCheckbox = false;
      }
    },
    
    formatTopicDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = date.getDate();
      const monthNames = [
        'Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.',
        'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} de ${month} ${year}`;
    },
    
   async loadTopicData() {
  this.loading = true;
  try {
    if (!this.id) throw new Error('ID do tópico não fornecido');
    
    // Primeiro verifica se a categoria tem subcategorias
    const hasSubcategories = await this.checkIfCategoryHasSubcategories();
    
    // Se a categoria não tem subcategorias, mas tem um parâmetro de subcategoria na URL
    if (!hasSubcategories && this.subcategory) {
      // Remove a subcategoria da URL sem recarregar a página
      this.$router.replace({
        name: 'ForumTopic',
        params: {
          category: this.$route.params.category,
          topic: this.$route.params.topic
        },
        query: { id: this.id }
      });
      return;
    }
    
    const response = await fetch(`http://localhost:3001/api/forum/topic/${this.id}`);
    if (!response.ok) throw new Error('Erro ao carregar tópico');
    
    const data = await response.json();
    
    // Buscar informações adicionais do membro
    const memberResponse = await fetch(`http://localhost:3001/api/members/${encodeURIComponent(data.autor)}`);
    
    let memberData = {
      membro_desde: null,
      postagens: 0,
      curtidas: 0,
      ultimo_login: null
    };
    
    if (memberResponse.ok) {
      const memberResponseData = await memberResponse.json();
      memberData = {
        membro_desde: memberResponseData.member?.created_at || null,
        postagens: memberResponseData.member?.post_count || 0,
        curtidas: memberResponseData.member?.likes_received || 0,
        ultimo_login: memberResponseData.member?.last_login || null
      };
    }
    
    this.topicData = {
      titulo: data.titulo || 'Sem título',
      avatar: data.avatar || this.getDefaultAvatar(data.autor),
      categoria: data.categoria || 'Sem categoria',
      visualizacoes: data.visualizacoes || 0,
      autor: data.autor || 'Anônimo',
      autor_cargo: data.autor_cargo || 'Membro',
      respostas: data.respostas || 0,
      content: data.content || 'Nenhum conteúdo disponível',
      posts_autor: data.posts_autor || 0,
      criado_em: data.criado_em || new Date().toISOString(),
      trancado: data.trancado || 'não',
      data_criacao: memberData.membro_desde,
      postagens: memberData.postagens,
      curtidas: memberData.curtidas,
      ultimo_login: memberData.ultimo_login
    };
    
    // Incrementar visualizações
    await fetch(`http://localhost:3001/api/forum/topic/${this.id}/view`, {
      method: 'POST'
    });
    
  } catch (error) {
    console.error('Erro ao carregar tópico:', error);
  } finally {
    this.loading = false;
  }
},

async checkIfCategoryHasSubcategories() {
  try {
    if (!this.topicData.categoria && !this.$route.params.category) return false;
    
    const categoryToCheck = this.topicData.categoria || this.$route.params.category;
    const response = await fetch(
      `http://localhost:3001/api/forum/category-has-subcategories/${encodeURIComponent(categoryToCheck.toLowerCase())}`
    );
    
    if (!response.ok) return false;
    const data = await response.json();
    return data.hasSubcategories;
  } catch (error) {
    console.error('Erro ao verificar subcategorias:', error);
    return false;
  }
},
    
    async loadReplies() {
      try {
        const response = await fetch(`http://localhost:3001/api/forum/topic/${this.id}/replies`);
        if (!response.ok) throw new Error('Erro ao carregar respostas');
        
        const replies = await response.json();
        
        this.replies = await Promise.all(replies.map(async reply => {
          try {
            const userResponse = await fetch(
              `http://localhost:3001/api/members/${encodeURIComponent(reply.author)}`
            );
            
            if (!userResponse.ok) {
              throw new Error('Erro ao carregar dados do membro');
            }

            const { member } = await userResponse.json();
            
            return {
              ...reply,
              selected: false,
              author_avatar: member.avatar,
              author_created_at: member.created_at,
              last_login: member.last_login,
              author_posts: member.post_count,
              author_likes: member.likes_received,
              author_role: member.role
            };
            
          } catch (error) {
            console.error('Erro ao carregar dados do autor:', error);
            return {
              ...reply,
              selected: false,
              author_avatar: this.getDefaultAvatar(reply.author),
              author_created_at: null,
              last_login: null,
              author_posts: 0,
              author_likes: 0,
              author_role: 'Membro'
            };
          }
        }));
        
      } catch (error) {
        console.error('Erro ao carregar respostas:', error);
      }
    },

    async checkAuthStatus() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.isLoggedIn = false;
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          this.currentUser = await response.json();
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        this.isLoggedIn = false;
      }
    },

    async submitReply() {
      if (!this.isLoggedIn) {
        return;
      }

      if (this.topicData.trancado === 'sim') {
        return;
      }

      if (!this.replyContent.trim()) return;
      
      this.replying = true;
      try {
        const response = await fetch(`http://localhost:3001/api/forum/topic/${this.id}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            author: this.currentUser.username,
            author_id: this.currentUser.id,
            content: this.replyContent,
            author_avatar: this.currentUser.avatar,
            author_created_at: this.currentUser.created_at,
            last_login: this.currentUser.last_login,
            author_posts: this.currentUser.post_count || 0,
            author_likes: this.currentUser.likes_received || 0
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro ao enviar resposta');
        }

        const newReply = await response.json();
        
        this.replies.unshift({
          ...newReply,
          selected: false,
          author: this.currentUser.username,
          author_id: this.currentUser.id,
          author_avatar: this.currentUser.avatar || this.getDefaultAvatar(this.currentUser.username),
          author_created_at: this.currentUser.created_at,
          last_login: this.currentUser.last_login,
          author_posts: this.currentUser.post_count || 0,
          author_likes: this.currentUser.likes_received || 0,
          author_role: this.currentUser.role || 'Membro'
        });
        
        this.topicData.respostas += 1;
        this.replyContent = '';
      } catch (error) {
        console.error('Erro ao enviar resposta:', error);
      } finally {
        this.replying = false;
      }
    },

    async sendPredefinedReply(type) {
      if (!this.predefinedMessages[type]) return;
      
      if (!this.isLoggedIn) {
        return;
      }

      this.replying = true;
      try {
        const lockResponse = await fetch(`http://localhost:3001/api/forum/topic/${this.id}/lock`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            trancado: 'sim'
          })
        });

        if (!lockResponse.ok) throw new Error('Falha ao trancar tópico');

        this.topicData.trancado = 'sim';

        const replyResponse = await fetch(`http://localhost:3001/api/forum/topic/${this.id}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            author: this.currentUser.username,
            author_id: this.currentUser.id,
            content: this.predefinedMessages[type].trim(),
            author_avatar: this.currentUser.avatar,
            author_created_at: this.currentUser.created_at,
            last_login: this.currentUser.last_login,
            author_posts: this.currentUser.post_count || 0,
            author_likes: this.currentUser.likes_received || 0
          })
        });

        if (!replyResponse.ok) {
          const errorData = await replyResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro ao enviar resposta');
        }

        const newReply = await replyResponse.json();
        
        this.replies.unshift({
          ...newReply,
          author: this.currentUser.username,
          author_id: this.currentUser.id,
          author_avatar: this.currentUser.avatar || this.getDefaultAvatar(this.currentUser.username),
          author_created_at: this.currentUser.created_at,
          last_login: this.currentUser.last_login,
          author_posts: this.currentUser.post_count || 0,
          author_likes: this.currentUser.likes_received || 0,
          author_role: this.currentUser.role || 'Moderador'
        });
        
        this.topicData.respostas += 1;
      } catch (error) {
        console.error('Erro detalhado:', error);
      } finally {
        this.replying = false;
        this.showMultimoderacao = false;
      }
    },
    
    copyTopicLink() {
      const linkToCopy = `boom.me${this.formattedTopicLink}`;
      navigator.clipboard.writeText(linkToCopy)
        .then(() => {
        })
        .catch(err => {
          console.error('Falha ao copiar link:', err);
        });
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  },
  watch: {
    id() {
      this.loadTopicData();
      this.loadReplies();
    },
    subcategory(newVal) {
    if (newVal) {
      this.checkIfCategoryHasSubcategories().then(hasSubcategories => {
        if (!hasSubcategories) {
          this.$router.replace({
            name: 'ForumTopic',
            params: {
              category: this.$route.params.category,
              topic: this.$route.params.topic
            },
            query: { id: this.id }
          });
        }
      });
    }
  }
  }
};
</script>

<style scoped>
.curtir-agora {
    display: inline-block;
    margin-top: 10px;
}
.curtidas {
    font-size: 18px;
    line-height: 18px;
    text-align: center;
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
  width: 250px;
  margin: 0 auto;
}
.orientacao-estatistica {
  margin: 0 auto;
  padding: 0 10px;
  display: flex;
  line-height: 10px;
}
.orientacao-left {
    float: left;
    font-weight: 500;
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
    background-color: #5f5f5f;
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
  height: 50px;
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
  background: rgb(255, 255, 255);
  text-align: left;
  height: 0px;
  padding: 10px;
  color: rgb(150, 150, 150);
}
.multimoderacao-itens:hover {
  font-family: 'Ubuntu', sans-serif;
  padding: 0.4em;
}
.multimoderacao-itens {
  font-family: 'Ubuntu', sans-serif;
  padding: 0.4em;
}
.multimoderacao {
  border-radius: 20px;
  color: black;
  display: flex;
  margin-bottom: -10px;
  justify-content: flex-end;
  margin-left: auto;
      height: 40px;
      margin-top: 20px;
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
  width: 280px;
  height: 300px;
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
  width: 204px;
  height: 192px;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  margin-bottom: 15px;
}

.user-info {
 width: 270px;
 margin-top: 25px;
     
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
  padding: 1em;
  margin-bottom: -30px;
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
    box-sizing: border-box;
    padding: 14px 14px 0px;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.5) 0px 3px 12px -3px;
    width: 100%;
}

.topic-text {
  text-align: left;
font-size: 18px;
    line-height: 1.6;
    color: rgb(86, 88, 103);
  line-height: 1.6;
  width: 100%; /* Usa 100% do container pai */
  max-width: 900px; /* Define um limite máximo */
  flex-grow: 1;
  padding: 30px;
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