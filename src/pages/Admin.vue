<template>
  <div class="forum-admin">
    <!-- Header Minimalista -->
    <header class="admin-header">
      <h1>Painel de Moderador</h1>
      <div class="admin-actions">
        <button class="new-topic-btn" @click="showCreateTopic = true">
          <i class="fas fa-plus"></i> Novo Tópico
        </button>
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <main class="admin-main">
      <!-- Barra Lateral de Navegação -->
      <nav class="admin-nav">
        <div class="nav-section">
          <h3>Navegação</h3>
          <ul>
            <li :class="{ active: viewMode === 'recent' }" @click="viewMode = 'recent'">
              <i class="fas fa-clock"></i> Recentes
            </li>
            <li :class="{ active: viewMode === 'featured' }" @click="viewMode = 'featured'">
              <i class="fas fa-star"></i> Destaques
            </li>
            <li :class="{ active: viewMode === 'categories' }" @click="viewMode = 'categories'">
              <i class="fas fa-tags"></i> Categorias
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <h3>Ferramentas</h3>
          <ul>
            <li @click="showLockedTopics = !showLockedTopics">
              <i class="fas fa-lock"></i> Tópicos Bloqueados
            </li>
            <li @click="refreshData">
              <i class="fas fa-sync-alt"></i> Atualizar
            </li>
          </ul>
        </div>
      </nav>

      <!-- Área de Conteúdo -->
      <div class="content-area">
        <!-- Lista de Tópicos -->
        <div v-if="viewMode === 'recent' || viewMode === 'featured'" class="topics-container">
          <div class="topics-header">
            <h2>{{ viewMode === 'recent' ? 'Tópicos Recentes' : 'Tópicos em Destaque' }}</h2>
            <div class="search-box">
              <input type="text" placeholder="Buscar tópicos..." v-model="searchQuery">
              <i class="fas fa-search"></i>
            </div>
          </div>

          <div class="topics-list">
            <div v-for="topic in filteredTopics" :key="topic.id" class="topic-card" 
                 :class="{ 'locked': topic.locked, 'featured': topic.featured }">
              <div class="topic-main" @click="toggleTopicExpansion(topic.id)">
                <div class="topic-info">
                  <h3>{{ topic.title }}</h3>
                  <div class="topic-meta">
                    <span class="author">{{ topic.author }}</span>
                    <span class="date">{{ formatDate(topic.createdAt) }}</span>
                    <span class="category">{{ getCategoryName(topic.category) }}</span>
                  </div>
                </div>
                <div class="topic-stats">
                  <span class="replies"><i class="fas fa-comment"></i> {{ topic.replies }}</span>
                  <span class="views"><i class="fas fa-eye"></i> {{ topic.views }}</span>
                </div>
              </div>
              
              <!-- Ações Rápidas -->
              <div class="quick-actions">
                <button @click.stop="toggleTopicLock(topic.id)" 
                        :class="{ 'active': topic.locked }">
                  <i :class="topic.locked ? 'fas fa-unlock' : 'fas fa-lock'"></i>
                  {{ topic.locked ? 'Desbloquear' : 'Bloquear' }}
                </button>
                <button @click.stop="deleteTopic(topic.id)" class="danger">
                  <i class="fas fa-trash"></i> Excluir
                </button>
                <button @click.stop="viewTopicDetails(topic.id)">
                  <i class="fas fa-expand"></i> Detalhes
                </button>
              </div>

              <!-- Conteúdo Expandido -->
              <div v-if="expandedTopics.includes(topic.id)" class="topic-expanded">
                <div class="topic-content">
                  <p>{{ topic.content }}</p>
                </div>
                
                <!-- Respostas -->
                <div class="topic-replies">
                  <h4>Respostas ({{ topic.replies }})</h4>
                  <div v-for="reply in topic.repliesPreview" :key="reply.id" class="reply">
                    <div class="reply-header">
                      <span class="reply-author">{{ reply.author }}</span>
                      <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
                    </div>
                    <div class="reply-content">
                      <p>{{ reply.content }}</p>
                    </div>
                    <button @click.stop="deleteReply(reply.id)" class="danger small">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <!-- Formulário de Resposta Rápida -->
                <div class="quick-reply">
                  <textarea v-model="quickReplies[topic.id]" placeholder="Escreva uma resposta rápida..."></textarea>
                  <button @click.stop="addQuickReply(topic.id)">
                    <i class="fas fa-paper-plane"></i> Responder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Visualização por Categorias -->
        <div v-if="viewMode === 'categories'" class="categories-view">
          <h2>Categorias do Fórum</h2>
          <div class="categories-grid">
            <div v-for="category in categories" :key="category.id" class="category-card">
              <div class="category-header">
                <h3>{{ category.name }}</h3>
                <span class="topic-count">{{ category.topics }} tópicos</span>
              </div>
              <div class="category-actions">
                <button @click="viewCategoryTopics(category.id)">
                  <i class="fas fa-list"></i> Ver Tópicos
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tópicos por Categoria -->
        <div v-if="viewMode === 'category-topics'" class="category-topics-view">
          <div class="category-header">
            <button @click="viewMode = 'categories'" class="back-btn">
              <i class="fas fa-arrow-left"></i> Voltar
            </button>
            <h2>Tópicos em {{ currentCategory.name }}</h2>
          </div>
          
          <div class="topics-list">
            <div v-for="topic in categoryTopics" :key="topic.id" class="topic-card">
              <!-- Mesma estrutura dos cards de tópico -->
            </div>
          </div>
        </div>
      </div>

      <!-- Painel de Detalhes do Tópico -->
      <div v-if="selectedTopic" class="topic-detail-panel">
        <div class="panel-header">
          <h2>{{ selectedTopic.title }}</h2>
          <button @click="selectedTopic = null" class="close-panel">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="topic-full-content">
          <div class="topic-author">
            <div class="author-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="author-info">
              <strong>{{ selectedTopic.author }}</strong>
              <span>{{ formatDate(selectedTopic.createdAt) }}</span>
            </div>
          </div>
          <div class="topic-text">
            <p>{{ selectedTopic.content }}</p>
          </div>
        </div>
        
        <div class="topic-replies">
          <h3>Respostas ({{ topicReplies.length }})</h3>
          <div v-for="reply in topicReplies" :key="reply.id" class="reply">
            <div class="reply-author">
              <div class="author-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="author-info">
                <strong>{{ reply.author }}</strong>
                <span>{{ formatDate(reply.createdAt) }}</span>
              </div>
            </div>
            <div class="reply-content">
              <p>{{ reply.content }}</p>
            </div>
            <div class="reply-actions">
              <button @click="deleteReply(reply.id)" class="danger small">
                <i class="fas fa-trash"></i> Excluir
              </button>
            </div>
          </div>
          
          <div class="add-reply">
            <h4>Adicionar Resposta</h4>
            <textarea v-model="newReply.content" placeholder="Escreva sua resposta..."></textarea>
            <button @click="addReply" class="primary">
              <i class="fas fa-paper-plane"></i> Publicar Resposta
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de Novo Tópico -->
    <div v-if="showCreateTopic" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Criar Novo Tópico</h2>
          <button @click="showCreateTopic = false" class="close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="createTopic">
            <div class="form-group">
              <label>Título do Tópico</label>
              <input v-model="newTopic.title" type="text" required>
            </div>
            
            <div class="form-group">
              <label>Categoria</label>
              <select v-model="newTopic.category" required>
                <option v-for="category in categories" 
                        :key="category.id" 
                        :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Conteúdo</label>
              <textarea v-model="newTopic.content" required></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="showCreateTopic = false" class="cancel">
                Cancelar
              </button>
              <button type="submit" class="primary">
                <i class="fas fa-paper-plane"></i> Publicar Tópico
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      viewMode: 'recent', // 'recent', 'featured', 'categories', 'category-topics'
      showCreateTopic: false,
      showLockedTopics: false,
      searchQuery: '',
      expandedTopics: [],
      quickReplies: {},
      
      // Dados
      recentTopics: [],
      featuredTopics: [],
      categories: [],
      categoryTopics: [],
      currentCategory: null,
      selectedTopic: null,
      topicReplies: [],
      
      // Novo tópico/resposta
      newTopic: {
        title: '',
        category: '',
        content: ''
      },
      newReply: {
        content: ''
      },
      
      // Exemplo de dados (substituir por chamadas API)
      sampleData: {
        categories: [
          { id: 1, name: "Anúncios", topics: 15 },
          { id: 2, name: "Geral", topics: 42 },
          { id: 3, name: "Dúvidas", topics: 28 },
          { id: 4, name: "Sugestões", topics: 19 }
        ],
        topics: [
          {
            id: 1,
            title: "Novas regras do fórum",
            author: "Admin",
            createdAt: "2023-05-15T10:30:00Z",
            category: 1,
            content: "Por favor, leiam as novas regras atualizadas...",
            replies: 5,
            views: 120,
            locked: false,
            featured: true,
            repliesPreview: [
              {
                id: 101,
                author: "Moderador",
                createdAt: "2023-05-15T11:45:00Z",
                content: "Alguma dúvida sobre as novas regras?"
              }
            ]
          },
          // Mais tópicos...
        ]
      }
    }
  },
  computed: {
    filteredTopics() {
      let topics = this.viewMode === 'recent' ? this.recentTopics : this.featuredTopics;
      
      // Filtro de busca
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        topics = topics.filter(topic => 
          topic.title.toLowerCase().includes(query) || 
          topic.content.toLowerCase().includes(query)
        );
      }
      
      // Filtro de tópicos bloqueados
      if (this.showLockedTopics) {
        topics = topics.filter(topic => topic.locked);
      }
      
      return topics;
    }
  },
  async created() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        // Substituir por chamadas API reais
        const [categoriesRes, recentRes, featuredRes] = await Promise.all([
          fetch('/api/forum/categories'),
          fetch('/api/forum/recent-topics'),
          fetch('/api/forum/topics/featured')
        ]);
        
        this.categories = await categoriesRes.json();
        this.recentTopics = await recentRes.json();
        this.featuredTopics = await featuredRes.json();
        
        // Adicionar preview de respostas (ajustar conforme sua API)
        this.recentTopics.forEach(topic => {
          if (!topic.repliesPreview) {
            topic.repliesPreview = [];
          }
        });
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Fallback para dados de exemplo
        this.categories = this.sampleData.categories;
        this.recentTopics = this.sampleData.topics;
        this.featuredTopics = this.sampleData.topics.filter(t => t.featured);
      }
    },
    async refreshData() {
      this.expandedTopics = [];
      await this.loadData();
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.name : 'Geral';
    },
    toggleTopicExpansion(topicId) {
      if (this.expandedTopics.includes(topicId)) {
        this.expandedTopics = this.expandedTopics.filter(id => id !== topicId);
      } else {
        this.expandedTopics.push(topicId);
        // Carregar mais respostas se necessário
        this.loadMoreReplies(topicId);
      }
    },
    async loadMoreReplies(topicId) {
      try {
        const response = await fetch(`/api/forum/topic/${topicId}/replies`);
        const replies = await response.json();
        
        // Atualizar preview no tópico
        const topic = this.recentTopics.find(t => t.id === topicId) || 
                     this.featuredTopics.find(t => t.id === topicId);
        if (topic) {
          topic.repliesPreview = replies.slice(0, 3); // Mostrar apenas 3 no preview
        }
      } catch (error) {
        console.error("Erro ao carregar respostas:", error);
      }
    },
    async viewTopicDetails(topicId) {
      try {
        const [topicRes, repliesRes] = await Promise.all([
          fetch(`/api/forum/topic/${topicId}`),
          fetch(`/api/forum/topic/${topicId}/replies`)
        ]);
        
        this.selectedTopic = await topicRes.json();
        this.topicReplies = await repliesRes.json();
        
        // Registrar visualização
        await fetch(`/api/forum/topic/${topicId}/view`, {
          method: 'POST'
        });
      } catch (error) {
        console.error("Erro ao carregar tópico:", error);
      }
    },
    async viewCategoryTopics(categoryId) {
      try {
        const response = await fetch(`/api/forum/topics/${categoryId}`);
        this.categoryTopics = await response.json();
        this.currentCategory = this.categories.find(c => c.id === categoryId);
        this.viewMode = 'category-topics';
      } catch (error) {
        console.error("Erro ao carregar tópicos da categoria:", error);
      }
    },
    async createTopic() {
      try {
        const response = await fetch('/api/forum/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newTopic)
        });
        
        if (response.ok) {
          const newTopic = await response.json();
          this.recentTopics.unshift(newTopic);
          this.showCreateTopic = false;
          this.newTopic = { title: '', category: '', content: '' };
        }
      } catch (error) {
        console.error("Erro ao criar tópico:", error);
      }
    },
    async addReply() {
      if (!this.selectedTopic || !this.newReply.content.trim()) return;
      
      try {
        const response = await fetch(`/api/forum/topic/${this.selectedTopic.id}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newReply)
        });
        
        if (response.ok) {
          const newReply = await response.json();
          this.topicReplies.push(newReply);
          this.newReply.content = '';
          
          // Atualizar contador no tópico
          if (this.selectedTopic) {
            this.selectedTopic.replies++;
          }
          
          // Atualizar na lista de tópicos
          const topicInList = this.recentTopics.find(t => t.id === this.selectedTopic.id) || 
                            this.featuredTopics.find(t => t.id === this.selectedTopic.id);
          if (topicInList) {
            topicInList.replies++;
          }
        }
      } catch (error) {
        console.error("Erro ao adicionar resposta:", error);
      }
    },
    async addQuickReply(topicId) {
      const replyContent = this.quickReplies[topicId];
      if (!replyContent || !replyContent.trim()) return;
      
      try {
        const response = await fetch(`/api/forum/topic/${topicId}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: replyContent })
        });
        
        if (response.ok) {
          const newReply = await response.json();
          
          // Atualizar preview no tópico expandido
          const topic = this.recentTopics.find(t => t.id === topicId) || 
                       this.featuredTopics.find(t => t.id === topicId);
          if (topic) {
            topic.replies++;
            topic.repliesPreview.unshift(newReply);
            if (topic.repliesPreview.length > 3) {
              topic.repliesPreview.pop();
            }
          }
          
          this.$set(this.quickReplies, topicId, '');
        }
      } catch (error) {
        console.error("Erro ao adicionar resposta rápida:", error);
      }
    },
    async toggleTopicLock(topicId) {
      try {
        const response = await fetch(`/api/forum/topic/${topicId}/lock`, {
          method: 'PUT'
        });
        
        if (response.ok) {
          // Atualizar na lista de tópicos
          const topic = this.recentTopics.find(t => t.id === topicId) || 
                       this.featuredTopics.find(t => t.id === topicId);
          if (topic) {
            topic.locked = !topic.locked;
          }
          
          // Atualizar no tópico selecionado se for o mesmo
          if (this.selectedTopic && this.selectedTopic.id === topicId) {
            this.selectedTopic.locked = !this.selectedTopic.locked;
          }
        }
      } catch (error) {
        console.error("Erro ao alternar bloqueio:", error);
      }
    },
    async deleteTopic(topicId) {
      if (!confirm('Tem certeza que deseja excluir este tópico? Esta ação não pode ser desfeita.')) {
        return;
      }
      
      try {
        const response = await fetch(`/api/forum/delete/topic/${topicId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Remover das listas
          this.recentTopics = this.recentTopics.filter(t => t.id !== topicId);
          this.featuredTopics = this.featuredTopics.filter(t => t.id !== topicId);
          
          // Fechar painel se estiver aberto
          if (this.selectedTopic && this.selectedTopic.id === topicId) {
            this.selectedTopic = null;
          }
          
          // Remover da lista de tópicos da categoria se estiver nessa visualização
          if (this.viewMode === 'category-topics') {
            this.categoryTopics = this.categoryTopics.filter(t => t.id !== topicId);
          }
        }
      } catch (error) {
        console.error("Erro ao excluir tópico:", error);
      }
    },
    async deleteReply(replyId) {
      if (!confirm('Tem certeza que deseja excluir esta resposta?')) {
        return;
      }
      
      try {
        const response = await fetch(`/api/forum/delete/reply/${replyId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Remover do painel de detalhes
          this.topicReplies = this.topicReplies.filter(r => r.id !== replyId);
          
          // Atualizar contador no tópico selecionado
          if (this.selectedTopic) {
            this.selectedTopic.replies--;
          }
          
          // Remover do preview em tópicos expandidos
          for (const topic of [...this.recentTopics, ...this.featuredTopics]) {
            if (topic.repliesPreview) {
              topic.repliesPreview = topic.repliesPreview.filter(r => r.id !== replyId);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao excluir resposta:", error);
      }
    }
  }
}
</script>

<style scoped>
/* Estilos Base */
:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4895ef;
  --danger-color: #f72585;
  --success-color: #4cc9f0;
  --warning-color: #f8961e;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --gray-light: #e9ecef;
  --gray-medium: #adb5bd;
  --gray-dark: #495057;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--dark-color);
  background-color: #f5f7fa;
}

/* Layout Principal */
.forum-admin {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 690px;
  max-width: 1200px;
  margin: 20px auto;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.admin-actions {
  display: flex;
  gap: 1rem;
}

.admin-main {
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100%;
  overflow: hidden;
}

/* Barra de Navegação */
.admin-nav {
  background-color: var(--light-color);
  border-right: 1px solid var(--gray-light);
  padding: 1.5rem 1rem;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section h3 {
  font-size: 0.9rem;
  text-transform: uppercase;
  color: var(--gray-dark);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--gray-light);
}

.nav-section ul {
  list-style: none;
}

.nav-section li {
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-section li:hover {
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary-color);
}

.nav-section li.active {
  background-color: var(--primary-color);
  color: white;
}

.nav-section li i {
  width: 20px;
  text-align: center;
}

/* Área de Conteúdo */
.content-area {
  padding: 1.5rem;
  overflow-y: auto;
  background-color: white;
}

.topics-container, .categories-view, .category-topics-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.topics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.topics-header h2 {
  font-size: 1.3rem;
  color: var(--dark-color);
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--gray-light);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-medium);
}

/* Lista de Tópicos */
.topics-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.topic-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 1rem;
  overflow: hidden;
  transition: var(--transition);
  border-left: 4px solid transparent;
}

.topic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.topic-card.locked {
  border-left-color: var(--warning-color);
}

.topic-card.featured {
  border-left-color: var(--success-color);
}

.topic-main {
  padding: 1.25rem;
  cursor: pointer;
}

.topic-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--dark-color);
}

.topic-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--gray-dark);
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.topic-meta .author {
  font-weight: 600;
  color: var(--primary-color);
}

.topic-meta .category {
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-size: 0.75rem;
}

.topic-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--gray-medium);
}

.topic-stats i {
  margin-right: 0.25rem;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--light-color);
  border-top: 1px solid var(--gray-light);
}

.quick-actions button {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  border: none;
  border-radius: var(--border-radius);
  background-color: white;
  color: var(--dark-color);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-actions button:hover {
  background-color: var(--gray-light);
}

.quick-actions button.active {
  background-color: var(--warning-color);
  color: white;
}

.quick-actions button.danger {
  background-color: var(--danger-color);
  color: white;
}

.quick-actions button.danger:hover {
  background-color: #e3176a;
}

.topic-expanded {
  padding: 1.25rem;
  border-top: 1px solid var(--gray-light);
  background-color: rgba(248, 249, 250, 0.5);
}

.topic-content {
  padding: 1rem;
  background-color: white;
  border-radius: var(--border-radius);
  margin-bottom: 1.5rem;
  border: 1px solid var(--gray-light);
}

.topic-replies {
  margin-bottom: 1.5rem;
}

.topic-replies h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--gray-dark);
}

.reply {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--gray-light);
  position: relative;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.reply-author {
  font-weight: 600;
  color: var(--primary-color);
}

.reply-date {
  color: var(--gray-medium);
}

.reply-content {
  margin-bottom: 0.5rem;
}

.reply-actions {
  text-align: right;
}

.quick-reply {
  margin-top: 1.5rem;
}

.quick-reply textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-light);
  border-radius: var(--border-radius);
  margin-bottom: 0.75rem;
  min-height: 100px;
  resize: vertical;
}

.quick-reply textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.quick-reply button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-reply button:hover {
  background-color: var(--secondary-color);
}

/* Visualização de Categorias */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.category-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: var(--transition);
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.category-header {
  padding: 1.25rem;
  background-color: var(--primary-color);
  color: white;
}

.category-header h3 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.topic-count {
  font-size: 0.85rem;
  opacity: 0.9;
}

.category-actions {
  padding: 1rem;
  text-align: center;
}

.category-actions button {
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.category-actions button:hover {
  background-color: var(--primary-color);
  color: white;
}

/* Painel de Detalhes do Tópico */
.topic-detail-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 600px;
  background-color: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--primary-color);
  color: white;
}

.panel-header h2 {
  font-size: 1.3rem;
  font-weight: 600;
}

.close-panel {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
}

.topic-full-content {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-light);
}

.topic-author {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--light-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 1.25rem;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-info strong {
  font-weight: 600;
}

.author-info span {
  font-size: 0.85rem;
  color: var(--gray-medium);
}

.topic-text {
  line-height: 1.7;
}

.topic-replies {
  padding: 1.5rem;
}

.topic-replies h3 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-light);
}

.add-reply {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-light);
}

.add-reply h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--gray-dark);
}

.add-reply textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--gray-light);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  min-height: 150px;
  resize: vertical;
}

.add-reply textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.add-reply button.primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-reply button.primary:hover {
  background-color: var(--secondary-color);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-light);
}

.modal-header h2 {
  font-size: 1.3rem;
  font-weight: 600;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--gray-medium);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-light);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.form-group textarea {
  min-height: 200px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.form-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.form-actions button.cancel {
  background-color: white;
  border: 1px solid var(--gray-light);
  color: var(--gray-dark);
}

.form-actions button.cancel:hover {
  background-color: var(--gray-light);
}

.form-actions button.primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-actions button.primary:hover {
  background-color: var(--secondary-color);
}

/* Botões */
button {
  transition: var(--transition);
}

button.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

button.danger {
  background-color: var(--danger-color);
  color: white;
}

button.danger:hover {
  background-color: #e3176a;
}

.new-topic-btn {
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: var(--primary-color);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition);
}

.new-topic-btn:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.back-btn {
  padding: 0.5rem 1rem;
  background-color: var(--light-color);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.back-btn:hover {
  background-color: var(--gray-light);
}

/* Responsividade */
@media (max-width: 992px) {
  .admin-main {
    grid-template-columns: 200px 1fr;
  }
  
  .topic-detail-panel {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .admin-main {
    grid-template-columns: 1fr;
  }
  
  .admin-nav {
    display: none;
  }
  
  .content-area {
    padding: 1rem;
  }
  
  .topics-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .search-box {
    width: 100%;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>