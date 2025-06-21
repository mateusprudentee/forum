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
         <router-link
            :to="{
              name: 'ForumTopic',
              params: {
                category: topico.category,
                topic: topico.title,
              },
              query: {
                id: topico.id
              }
            }"
            style="text-decoration: none; color: inherit;"
          >
          <div class="flex">
            <div class="topico-img">
              <img :src="topico.avatar" width="60" height="60" style="border-radius: 10px;">
            </div>
            
            <div class="topico-usuario-title">
              <p>{{ topico.title }}</p>
              <div class="topico-usuario-info">
                <p>
                  Por
                  <a style="color: black;">{{ topico.author || 'Anônimo' }}</a>,
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
  <p>{{ topico.last_reply_user || 'Nenhuma' }}, {{ formatDate(topico.last_reply_date || topico.created_at) }}</p>
</div>
              </div>
            </div>
          </div>
</router-link>
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
     <div v-for="(member, index) in teamMembers" :key="'member-'+index" 
     class="equipe-tipo" 
     @click="handleClick(member)"
     style="margin-top: 3px;">
        <div class="flex">
          <div class="skin" style="margin-top: 5px;">
            <img :src="member.avatar" width="50" height="50" alt="[IMG]" style="border-radius: 10px; margin-top: -6px;">
          </div>
          <div class="equipe-title" :style="{ color: getRoleColor(member.role) }" style="font-weight: normal;">
            <p>{{ member.name }}</p>
            <div class="equipe-titulo">
              <p>{{ member.role }}</p>
            </div>
          </div>
        </div>
      </div>
    

  <!-- Diálogo ViewStaff -->
  <ViewStaff 
    v-if="staffDialog" 
    :staff="selectedStaff" 
    @close="closeStaffDialog"
  />
  </div>
  </div>

 <div class="equipe-card" style="margin-top: 20px;">
  <div class="equipe-container">
    <div class="equipe">
      <p>Membros online</p>
    </div>
    <div class="flex">
      <div class="equipe-title-dois" style="font-weight: normal;">
        <p>{{ onlineMembersFormatted }}</p>
        <p style="margin-top: -10px; color: gray">
          Total: {{ totalMembers }} ({{ onlineCount }} membros{{ visitorsCount > 0 ? ' e ' + visitorsCount + ' visitantes' : '' }})        
        </p>
      </div>
    </div>
  </div>
</div>

  <div class="equipe-card" style="margin-top: 20px;">
    <div class="equipe-container">
      <div class="equipe">
        <p>Fórum</p>
      </div>
        <div class="flex">
        <div class="user-info">
              <div class="orientacao-estatistica">
                <div class="orientacao-left">
                  <p>Tópicos</p>
                  <p>Postagens</p>
                  <p>Membros</p>
                </div>
                <div class="orientacao-left-left">
                  <p>{{ stats.topics || 0}}</p>
                  <p>{{ stats.posts || 0 }}</p>
                  <p>{{  stats.members || 0 }}</p>
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
      onlineMembers: [],
      onlineCount: 0,
      totalMembers: 0,
      selectedStaff: ref(null),
      hoverTimer: ref(null),
      dialogOpenedByClick: ref(false) // Nova flag para controlar abertura por clique
    }
  },
  data() {
    return {
      stats: {
        topics: 0,
        posts: 0,
        members: 0
      },

      loading: true,
      teamMembers: [],
      recentTopics: [],
      mainForums: [],      
      teamForums: [],  
      categoryGroups: [],
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
    this.startOnlineMembersAutoRefresh();
  },


 
  computed: {
    // Computed para formatar os nomes dos membros online
    onlineMembersFormatted() {
      return this.onlineMembers.length > 0
        ? this.onlineMembers.join(', ')
        : 'Nenhum membro online'
    },

    visitorsCount() {
      return this.totalMembers - this.onlineCount
    },

    // Se você já tem outros computeds, mantenha eles
  },

  created() {
    this.loadData();
    this.fetchOnlineMembers();  // chama a busca quando o componente carrega
  },

  methods: {
   async fetchOnlineMembers() {
  try {
    const res = await fetch('http://localhost:3001/api/members/online');
    if (!res.ok) throw new Error('Erro ao carregar membros online');

    const data = await res.json();

    this.onlineMembers = data.online_members || [];
    this.onlineCount = data.online_count || 0;
    this.totalMembers = data.total_members || 0;
    this.visitorsCount = 0; // Você precisará implementar isso na API se quiser mostrar visitantes
    
    // Formatar a lista de membros
    this.onlineMembersFormatted = this.onlineMembers.length > 0 
      ? this.onlineMembers.join(', ') 
      : 'Nenhum membro online no momento';
  } catch (error) {
    console.error('Erro ao buscar membros online:', error);
    this.onlineMembers = [];
    this.onlineCount = 0;
    this.totalMembers = 0;
    this.onlineMembersFormatted = 'Não foi possível carregar os membros online';
  }
},

    // você pode querer atualizar periodicamente (opcional)
    startOnlineMembersAutoRefresh() {
      this.onlineInterval = setInterval(() => {
        this.fetchOnlineMembers();
      }, 60000); // a cada 60 segundos
    },

    stopOnlineMembersAutoRefresh() {
      clearInterval(this.onlineInterval);
    },

    async loadStats() {
      try {
        const res = await fetch('/api/forum/stats');
        if (!res.ok) throw new Error('Erro ao carregar estatísticas');
        this.stats = await res.json();
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        this.stats = { topics: 0, posts: 0, members: 0 };
      }
    },
    
    async loadCategoryStats() {
      try {
        for (const group of this.categoryGroups) {
          for (const category of group.categories) {
            const res = await fetch(`http://localhost:3001/api/forum/category-stats/${encodeURIComponent(category.name)}`);
            if (res.ok) {
              const stats = await res.json();
              category.posts = stats.posts || 0;
              category.topics = stats.topics || 0;
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas por categoria:', error);
      }
    },
    handleMouseEnter(member) {
      if (this.dialogOpenedByClick) return; // Não faz nada se já foi aberto por clique
      
      if (this.hoverTimer) {
        clearTimeout(this.hoverTimer);
      }
      
      this.hoverTimer = setTimeout(() => {
        this.openStaffDialog(member);
      }, 500);
    },
    
    handleMouseLeave() {
      if (this.dialogOpenedByClick) return; // Não faz nada se foi aberto por clique
      
      if (this.hoverTimer) {
        clearTimeout(this.hoverTimer);
      }
      
      if (this.staffDialog && !this.dialogOpenedByClick) {
        this.closeStaffDialog();
      }
    },
    
   // Corrigindo a função handleClick
async handleClick(member) {
  try {
    console.log('Dados do membro clicado:', member);
    
    // Garante que temos pelo menos o nome/nick
    const memberName = member.name || member.username;
    if (!memberName) {
      throw new Error('Nick do membro não encontrado');
    }

    // Abre o diálogo primeiro com dados básicos (enquanto carrega os completos)
    this.openStaffDialog({
      username: memberName,
      name: memberName,
      avatar: member.avatar || `https://cravatar.eu/helmavatar/${encodeURIComponent(memberName)}/190.png`,
      role: member.role || 'Membro',
      seguidores: member.seguidores || 0,
      seguindo: member.seguindo || 0,
      trofeus: member.trofeus || 0,
      alertas: member.alertas || 0,
      post_count: member.post_count || 0,
      likes_received: member.likes_received || 0,
      last_login: member.last_login || new Date().toISOString(),
      data_criacao: member.data_criacao || null,
      minecraft_nick: member.minecraft_nick || memberName
    });

    // Busca dados completos da API
    const response = await fetch(`http://localhost:3001/api/members/${encodeURIComponent(memberName)}`);
    
    if (!response.ok) throw new Error('Erro na API');
    
    const fullData = await response.json();
    console.log('Dados completos da API:', fullData);
    
    // Se a API retornou com sucesso e tem dados do membro
    if (fullData.success && fullData.member) {
      // Atualiza os dados no diálogo com as informações completas
      this.selectedStaff = {
        username: fullData.member.username || memberName,
        name: fullData.member.name || memberName,
        avatar: fullData.member.avatar || member.avatar || `https://cravatar.eu/helmavatar/${encodeURIComponent(memberName)}/190.png`,
        role: fullData.member.role || member.role || 'Membro',
        seguidores: fullData.member.seguidores || member.seguidores || 0,
        seguindo: fullData.member.seguindo || member.seguindo || 0,
        trofeus: fullData.member.trofeus || member.trofeus || 0,
        alertas: fullData.member.alertas || member.alertas || 0,
        post_count: fullData.member.post_count || member.post_count || 0,
        likes_received: fullData.member.likes_received || member.likes_received || 0,
        last_login: fullData.member.last_login || member.last_login || new Date().toISOString(),
        data_criacao: fullData.member.data_criacao || member.data_criacao || null,
        minecraft_nick: fullData.member.minecraft_nick || member.minecraft_nick || memberName
      };
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    // Mantém os dados básicos se houver erro
  }
},
  
  openStaffDialog(staffData) {
    this.selectedStaff = staffData;
    this.staffDialog = true;
  },
    
    closeStaffDialog() {
      this.staffDialog = false;
      this.selectedStaff = null;
      this.dialogOpenedByClick = false; // Reseta a flag ao fechar
    },
    
    getRoleColor(role) {
      const roleColors = {
        'Master': '#e67e22',     
        'Gerente': '#c0392b',    
        'Admin': 'rgb(255 116 101)',     
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
          this.loadForumCategories(),
          this.loadStats()
        ]);
        
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
      if (!dateString) return 'Data inválida';
      
      try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
          return 'Data inválida';
        }

        // Mapeamento dos nomes dos meses
        const monthNames = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];

        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day} de ${month} às ${hours}:${minutes}`;
      } catch (e) {
        console.error('Erro ao formatar data:', e);
        return 'Data inválida';
      }
    },
    
    async loadRecentTopics() {
  try {
    const res = await fetch('http://localhost:3001/api/forum/recent-topics?limit=7');
    if (!res.ok) throw new Error('Erro ao carregar tópicos recentes');
    let topics = await res.json();
    
    // Ordenar tópicos pela data da última resposta (do mais recente para o mais antigo)
    this.recentTopics = topics.sort((a, b) => {
      // Se não houver última resposta, usa a data de criação
      const dateA = a.last_reply_date ? new Date(a.last_reply_date) : new Date(a.created_at);
      const dateB = b.last_reply_date ? new Date(b.last_reply_date) : new Date(b.created_at);
      
      return dateB - dateA; // Ordem decrescente (mais recente primeiro)
    });
    
  } catch (error) {
    console.error('Erro ao carregar tópicos recentes:', error);
    this.recentTopics = [];
  }
},
    
    async loadForumCategories() {
      try {
        const [mainRes, teamRes] = await Promise.all([
          fetch('http://localhost:3001/api/forum/categories?type=main'),
          fetch('http://localhost:3001/api/forum/categories?type=team')
        ]);
        
        if (!mainRes.ok) throw new Error('Erro ao carregar categorias principais');
        if (!teamRes.ok) throw new Error('Erro ao carregar categorias de moderação');
        
        this.mainForums = await mainRes.json();
        this.teamForums = await teamRes.json();
        
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
            fetch(`api/forum/topics/${encodeURIComponent(forum.name)}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          )
        );
        
        forums.forEach((forum, index) => {
          forum.threads = categoryTopics[index]?.length || 0;
          forum.posts = categoryTopics[index]?.reduce((sum, topic) => sum + (topic.replies || 0) + 1, 0) || 0;
        });
        
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
.equipe-tipo:hover {
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;

}
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
  .equipe-title-dois {
    color: orange;
    font-size: 11px;
    color: #23527c;
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
    transition: all 0.2s ease;
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
.orientacao-estatistica {
  width: 100%;
  padding: 0 0px;
  display: flex;
  line-height: 10px;
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

.orientacao-left {
    float: left;
    font-weight: normal;
    color: rgb(103, 103, 103);
    font-size: 16px;
}
.user-info {
 width: 100%;
 margin-top: 10px;
     
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
