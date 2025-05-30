<template>
  <div class="navbar-forum">
    <div class="navbar-forum-inicio">
      <q-icon name="home" />
    </div>
    <div class="navbar-forum-itens-um"></div>
    <div class="navbar-forum-itens">
      <p style="margin-left: 19px;">Fórum</p>
    </div>
  </div>


    
      <div class="flex">
    <div class="topicos">
      <div class="topicos-recentes">
        <p>Tópicos recentes</p>
      </div>
      <div class="topicos-recentes-usuarios">
        <div v-for="(topico, index) in recentTopics" :key="index" class="topico-usuario">
          <div class="flex">
            <div class="topico-img">
              <img :src="topico.avatar" width="60" height="60" style="border-radius: 10px;">
            </div>
            <div class="topico-usuario-title">
              <p>{{ topico.title }}</p>
              <div class="topico-usuario-info">
                <p>
                  Por
                  <a style="color: black;">{{ topico.autor || 'Anônimo' }}</a>,
                  <a style="color: black;">{{ formatDate(topico.created_at) }}</a>,
                  em
                  <a style="color: black;">{{ topico.category }}</a>
                </p>
              </div>
              <div class="flex" style="margin-top: -17px; font-size: 14px;">
                <div class="topico-usuario-repostas">
                  <q-icon name="chat"></q-icon> {{ topico.replies || 0 }} respostas
                </div>
                <div class="topico-usuario-view">
                  <q-icon name="visibility"></q-icon> {{ topico.views || 0 }} visualizações
                </div>
              </div>
            </div>
            <div class="ultimo-container">
              <div class="ultima-resposta">
                <p>Última resposta</p>
                <div class="ultima-resposta-nick">
                  <p>{{ topico.last_reply_user || 'Nenhuma' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    

    <div class="nosso-ip">
      <div class="nosso-ip-container">
        <div class="nosso-ip-title">
          <p>Nosso IP</p>
        </div>
        <div class="nosso-ip-subtitle">
          <p>Clique para copiar nosso IP e adicione-o à sua lista de servidores do Minecraft.</p>
        </div>
        <button class="btn btn-primary btn-lg btn-block" id="sidebar-ip-1" data-clipboard-text="redesky.com">
          LUGIN.COM.BR
        </button>
        <div class="nosso-ip-subtitle-recomendacao">
          <p>Recomendamos que você utilize a versão 1.8.9 do Minecraft.</p>
        </div>
      </div>
      
      
      <div class="equipe-card" style="margin-top: 20px;">
        <div class="equipe-container">
          <div class="equipe">
            <p>Membros da equipe online</p>
          </div>
          <div v-for="(member, index) in teamMembers" :key="'member-'+index" class="equipe-tipo" @click="openStaffDetails(member)">
            <div class="flex">
              <div class="skin" style="margin-top: 5px;">
                <img :src="member.avatar" width="40" height="40" alt="[IMG]" style="border-radius: 10px;">
              </div>
              <div class="equipe-title" :style="{ color: getRoleColor(member.role) }" style="font-weight: normal;">
                <p>{{ member.name }}</p>
                <div class="equipe-titulo">
                  <p>{{ member.role }}</p>
                </div>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
      
  
  <div class="flex" style="margin-top: 20px;">
    <div class="topicos-categorias"  v-for="(categoryGroup, groupIndex) in categoryGroups" :key="'group-'+groupIndex">
      <div class="topicos-recentes">
        <p>{{ categoryGroup.title }}</p>
      </div>
      <div class="topicos-recentes-usuarios" style="margin-top: 10px; ">
        <div class="categorias" v-for="(category, index) in categoryGroup.categories" :key="'cat-'+index">
         <router-link :to="'/forum/categoria/' + category.name" class="flex" style="text-decoration: none; color: inherit;">
          <div class="categoria-title">
            <p>{{ category.name }}</p>
          </div>
          </router-link>
          <div class="categoria-subtitle">
            <p>{{ category.description }}</p>
          </div>
          
          <div class="ultimo-container" style="margin-top: -40px;">
              <div class="ultima-resposta">
                <p>{{ category.posts }} mensagens</p>
              </div>
              
            </div>
            
            
      </div>
    
      </div>
    </div>
    

      
      
      
    </div>

</template>

<script>
import { ref } from 'vue';
import ViewStaff from '../components/ViewStaff.vue';

export default {
  name: 'ForumPage',
  components: {
    ViewStaff
  },
  setup() {
    return {
      staffDialog: ref(false),
      selectedStaff: ref(null)
    }
  },
  data() {
    return {
      loading: true,
      teamMembers: [],
      recentTopics: [],
      mainForums: [],      
      teamForums: [],  
      categoryGroups: [], // Inicializado vazio, será preenchido pela API
      stats: {
        posts: 0,
        members: 0,
        guests: 0
      },
      error: null
    }
  },
  created() {
    this.loadData();
  },
  methods: {
    openStaffDetails(member) {
      this.selectedStaff = member;
      this.staffDialog = true;
    },
    getRoleColor(role) {
      const roleColors = {
        'Master': '#e67e22',     
        'Gerente': '#c0392b',    
        'Admin': '#e74c3c',     
        'Moderador': '#27ae60',  
        'Ajudante': '#f1c40f'    
      };
      return roleColors[role] || '#95a5a6'; 
    },
    async loadData() {
      this.loading = true;
      this.error = null;
      try {
        await Promise.all([
          this.loadTeamMembers(),
          this.loadRecentTopics(),
          this.loadForumCategories(), // Isso agora vai carregar os categoryGroups
          this.loadStats()
        ]);
        
        // Carrega tópicos para cada categoria
        await Promise.all([
          this.loadCategoryTopics(this.mainForums),
          this.loadCategoryTopics(this.teamForums)
        ]);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        this.error = "Não foi possível carregar alguns dados do fórum.";
      } finally {
        this.loading = false;
      }
    },
    async loadTeamMembers() {
      try {
        const res = await fetch('http://localhost:3001/api/team');
        if (!res.ok) throw new Error('Erro ao carregar equipe');
        let members = await res.json();

        const roleOrder = ['Master', 'Gerente', 'Admin', 'Moderador', 'Ajudante'];
        members.sort((a, b) => {
          return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
        });

        this.teamMembers = members;
      } catch (error) {
        console.error('Erro ao carregar membros da equipe:', error);
        this.teamMembers = [];
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      const formatTime = (d) => d.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const formatDayMonth = (d) => d.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long'
      });
      
      if (diffInSeconds < 60) {
        return 'agora mesmo';
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return `ontem às ${formatTime(date)}`;
      }
      
      if (diffInDays < 7) {
        return `há ${diffInDays} dias`;
      }
      
      return `${formatDayMonth(date)} às ${formatTime(date)}`;
    },
    async loadRecentTopics() {
      try {
        const res = await fetch('http://localhost:3001/api/forum/recent-topics?limit=7');
        if (!res.ok) throw new Error('Erro ao carregar tópicos recentes');
        this.recentTopics = await res.json();
      } catch (error) {
        console.error('Erro ao carregar tópicos recentes:', error);
        this.recentTopics = [];
      }
    },
    async loadForumCategories() {
      try {
        // Carrega categorias do tipo "main" e "team" da API
        const [mainRes, teamRes] = await Promise.all([
          fetch('http://localhost:3001/api/forum/categories?type=main'),
          fetch('http://localhost:3001/api/forum/categories?type=team')
        ]);
        
        if (!mainRes.ok) throw new Error('Erro ao carregar categorias principais');
        if (!teamRes.ok) throw new Error('Erro ao carregar categorias de moderação');
        
        this.mainForums = await mainRes.json();
        this.teamForums = await teamRes.json();
        
        // Organiza as categorias em grupos para exibição
        this.categoryGroups = [
          {
            title: 'Geral',
            categories: this.mainForums.filter(cat => ['Anúncios e Novidades', 'Tutoriais', 'Reporte de bugs'].includes(cat.name))
          },
          {
            title: 'Comunidade',
            categories: this.mainForums.filter(cat => ['Denuncias', 'Revisões', 'Reportar abuso de membro da equipe'].includes(cat.name))
          },
          {
            title: 'Moderação',
            categories: this.teamForums
          }
        ];
        
      } catch (error) {
        console.error('Erro ao carregar categorias do fórum:', error);
        this.mainForums = [];
        this.teamForums = [];
        this.categoryGroups = [];
        this.error = "Não foi possível carregar as categorias do fórum. O resto do conteúdo será exibido.";
      }
    },
    async loadStats() {
      try {
        const res = await fetch('http://localhost:3001/api/forum/stats');
        if (!res.ok) throw new Error('Erro ao carregar estatísticas');
        this.stats = await res.json();
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        this.stats = { posts: 0, members: 0, guests: 0 };
      }
    },
    async loadCategoryTopics(forums) {
      try {
        const categoryTopics = await Promise.all(
          forums.map(forum => 
            fetch(`http://localhost:3001/api/forum/topics/${encodeURIComponent(forum.name)}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          )
        );
        
        // Atualiza os fóruns com a contagem de tópicos e postagens
        forums.forEach((forum, index) => {
          forum.threads = categoryTopics[index]?.length || 0;
          forum.posts = categoryTopics[index]?.reduce((sum, topic) => sum + (topic.replies || 0) + 1, 0) || 0;
        });
        
        // Atualiza também as categorias nos grupos
        this.categoryGroups.forEach(group => {
          group.categories.forEach(cat => {
            const forum = forums.find(f => f.name === cat.name);
            if (forum) {
              cat.threads = forum.threads;
              cat.posts = forum.posts;
            }
          });
        });
      } catch (error) {
        console.error('Erro ao carregar tópicos por categoria:', error);
      }
    }
  }
}
</script>
<style scoped>
.categoria-mensagens {
  align-items: right;
}
.categoria-subtitle {
      font-size: 14px;
      color: #676767;
      margin-top: -16px;
}
.categoria-title {
      color: #2b2b2b;
    font-size: 16px;
    font-weight: 500;
}
.equipe-titulo {
    margin-top: -20px;
    color:gray;
    font-size: 15px;
    font-weight: normal;
  }
  .equipe-title {
    color: orange;
    font-size: 17px;
  }
  .equipe-tipo:hover {

    cursor: pointer;
    padding: 0em;
    text-align: left;
    padding-top: 0px;
    margin-top: -8px;
  }
  .equipe-tipo {
    padding: 0em;
    text-align: left;
    padding-top: 0px;
    margin-top: -8px;
  }
.equipe-card {
  width: 385px;
    background: white;
    border-radius: 3px;
    box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
}
.equipe-container {
  margin: 0 auto;
  text-align: left;
  padding: 1em;
}
.equipe {
   font-size: 22px;
    display: block;
    color: black;
    font-weight: 300;
}
.btn-primary {
    color: #fff;
    background-color: #0095fd;
}
.btn-lg, .btn-group-lg > .btn {
    padding: 12px 25px;
    font-size: 16px;
}
.btn {
    border-radius: 5px;
    border: 0;
    text-decoration: none !important;
    font-weight: 300;
}
.btn-block {
    display: block;
    width: 100%;
}
.nosso-ip-subtitle-recomendacao {
  font-size: 16px;
  margin-top: 20px;
    display: block;
    color: rgb(75, 75, 75);
    font-weight: 300;
}
.nosso-ip-subtitle {
  font-size: 16px;
    display: block;
    color: gray;
    font-weight: 300;
}
.nosso-ip-title {
  font-size: 22px;
  font-weight: bold;
  margin-top: -10px;
  margin-bottom: 15px;
}
.nosso-ip-container {
  margin: 0 auto;
  padding: 50px;
  text-align: center;
}
.nosso-ip {
  width: 385px;
    height: 340px;
    background: white;
    border-radius: 3px;
    margin-top: 20px;
    box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
}
.ultimo-container {
  display: flex;
  flex-direction: column;
  justify-content: right;
  align-items: right;
  margin-top: 10px;
  text-align: right;
  margin-left: auto;
}
.ultima-resposta-nick {
  margin-top: -17px;
}
.ultima-resposta {
  font-size: 14px;
      padding: 0;
    color: #676767;
    font-weight: 300;
}
.topico-usuario-repostas {
  color: gray;
}
.topico-usuario-view {
  color: gray;
}
.topico-usuario-info {
      font-size: 14px;
    font-weight: 300;
    margin-bottom: 3px;
    color: rgb(97, 97, 97);
    margin-top: -20px;
    float: none;
}
.topico-usuario-title {
  font-size: 16px;
  font-weight: 100;
}
.flex {
  display: flex;
  gap: 15px;
}
.topico-usuario:last-child {
  border-bottom: none;
}

.topico-usuario {
    border-bottom: 0.5px solid rgb(238, 238, 238);
    padding: 0.5em 0;
    margin-top: 5px;
}
.topicos-recentes-usuarios {
    padding: 1.4em;
}
.topico-img {
    width: 60px;
    background-image: url("https://cbx-prod.b-cdn.net/COLOURBOX25634126.jpg?width=800&height=800&quality=70");
    height: 60px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 10px;
}
.topicos-recentes {
    padding: 20px;
    margin-bottom: -30px;
    padding-bottom: 5px;
    background: #fff;
    color: #2b2b2b;
    border: none;
    font-size: 22px;
    font-weight: 100;
}
.topicos-categorias {
    width: 815px;
    background: white;
    border-radius: 3px;
    box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
}
.topicos {
    width: 815px;
    height: 690px;
    background: white;
    border-radius: 3px;
    margin-top: 20px;
    box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
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

</style>
