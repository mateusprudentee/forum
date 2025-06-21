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
    :to="subcategory ? `/forum/categoria/${category}` : ''"
    style="text-decoration: none;"
  >
    <!-- Se NÃO tiver subcategory, aplicar azul no category -->
    <div 
      class="navbar-forum-itens-forum" 
    >
    <div 
  :class="{ 'navbar-forum-itens': !subcategory }" 
  :style="!subcategory ? { height: '100px', marginLeft: '-10px', marginTop: '-12px' } : {}"
>
  <p style="margin-left: 19px;">{{ category }}</p>
</div>


    </div>
  </router-link>

  <!-- Se tiver subcategory, aplicar azul nela -->
  <template v-if="subcategory">
    <div class="navbar-forum-itens-um"></div>
   <!-- Mostra o nome legível do subcategory (slugToName) -->
<div class="navbar-forum-itens" v-if="subcategory">
  <p style="margin-left: 19px;">{{ slugToName(subcategory) }}</p>
</div>

  </template>
</div>

  
  

    <div class="forum-layout">
      <div class="forum-main">
          <div class="forum-baixo" style="min-height: 20px;">
            <div class="flex">
            <div class="forum-card-post">
              <p>{{ category }} </p>
            </div>
            <q-btn 
              color="blue" 
              label="NOVO TÓPICO" 
              @click="goToNewTopic"
              class="right-botao"
              style="margin-left: 1040px; margin-top: -80px;"
            />
    
            <q-dialog v-model="newTopicDialog">
              <NewTopic 
                @close="newTopicDialog = false"
                @created="handleTopicCreated"
              />
            </q-dialog>
              
          <div class="subcategoria" style="width: 100%;" v-if="category === 'Denuncias' && !subcategory">
          <div class="flex" 
     style="margin-top: 20px; display: flex; cursor: pointer; align-items: center;" 
     v-for="(group, groupName) in formattedSubcategories" 
     :key="groupName"
     @click="category === 'Denuncias' ? goToSubcategory(groupName) : null"
>
              <div class="categories-title" style="margin-right: 10px;">
                <p>{{ capitalizeFirstLetter(groupName.toLowerCase()) }}</p>
              </div>
              <div class="discussoes-e-mensagens" style="display: flex; gap: 60px; margin-left: auto;">
                <div class="discussoes">
                  {{ getTotalDiscussions(group) }} discussões
                </div>
                <div class="mensagens">
                  {{ getTotalMessages(group) }} mensagens
                </div>
              </div>  
            </div>
          </div>
            </div>
          </div>
         <div class="row justify-end q-mb-md">
  <q-btn 
    color="black" 
    label="Organização" 
    @click="toggleOrganizacao"
  />
</div>
<div class="forum-baixo irorganizacao" v-if="showOrganizacao" style="margin-top: -5px;">
  <div class="flex">
    <q-select
      v-model="selectedMonth"
      :options="monthOptions"
      style="width: 200px;"
      label="Mês de criação"
      outlined
      @update:model-value="filterTopics"
    />
    <q-select
      v-model="selectedPrefix"
      :options="prefixOptions"
      style="width: 200px; margin-left: 10px;"
      label="Prefixo"
      outlined
      @update:model-value="filterTopics"
    />
    <q-select
      v-model="selectedSort"
      :options="sortOptions"
      style="width: 200px; margin-left: 10px;"
      label="Avançado"
      outlined
      @update:model-value="filterTopics"
    />
  </div>
</div>
          
          
          <div class="forum-baixo" style="margin-top: -10px">
            <div class="forum-baixo-topicos">
              <p>Tópicos</p>
            </div>
            <div class="flex items-center" style="margin-top: 20px; margin-bottom: -20px;" v-if="selectedTopics.length > 0">
              <q-btn 
                color="negative" 
                label="Deletar Selecionados" 
                @click="openDeleteMultipleDialog"
                class="q-mr-sm"
              />
              <span>{{ selectedTopics.length }} tópico(s) selecionado(s)</span>
              <q-btn 
                flat 
                label="Limpar Seleção" 
                @click="clearSelection"
                class="q-ml-sm"
              />
            </div>
            <div v-if="filteredTopics.length > 0" class="topicos-list" style="margin-top: 30px; margin-bottom: -25px;">
              <div v-for="(topic, index) in paginatedTopics" :key="'topic-'+index" class="topicos-abaixo" @click="handleTopicClick($event, topic)" >
                <div class="flex">
                  <div class="skin">
                    <img :src="topic.avatar" width="57" height="57" alt="Avatar" style="width: 57px; height: 57px; border-radius: 5px;">
                  </div>
                  
                  <div class="topicos-title-baixo" style="margin-top: -10px;">
                    
                    <p>{{ topic.title }}</p>
                    <div class="topico-por-em">
                      <p>
                        Por
                        <a style="color: black;">{{ topic.author || 'Não disponível' }}</a>,
                        <a style="color: black;">{{ formatDate(topic.created_at) }}</a>,
                        em
                        <a style="color: black;">{{ topic.category }}</a>
                      </p>
                     
                    </div>
                    
                    <div class="topicos-views">
                     <q-checkbox 
                  v-model="topic.selected" 
                  dense 
                  size="xs" 
                  @click.stop
                />  <q-icon name="chat"></q-icon> 
                      {{ topic.replies }} {{ topic.replies === 1 ? 'resposta' : 'respostas' }}
                      <q-icon name="visibility" style="margin-left: 8px;"></q-icon> 
                      {{ topic.views }} {{ topic.views === 1 ? 'visualização' : 'visualizações' }}
                    </div>
                  </div>

                  <div class="ultima-resposta-container">
                    <div class="ultima-resposta">
                      <p>Última resposta</p>
                      <div class="ultima-resposta-nick">
                        <p v-if="topic.replies > 0">
                          <a style="color: black;">{{ topic.last_reply?.author }}</a>, 
                          {{ formatDate(topic.last_reply?.date) }}
                        </p>
                        <p v-else>
                          <a style="color: black;">{{ topic.author || 'Não disponível' }}</a>,
                          {{ formatDate(topic.created_at) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="topicos-list" style="margin-top: 30px; margin-bottom: -25px;">
              <div class="topicos-abaixo">
                <p>Ainda não existem tópicos criados nesta categoria.</p>
              </div>
            </div>
          </div>
          
          <div class="mostrando">
            <p>Mostrando tópicos de {{ startItem }} até {{ endItem }}. Total {{ filteredTopics.length }}</p>
          </div>
          
          <div class="flex">
            <div class="pageNavLinkGroup afterDiscussionListHandle" style="margin-top: -20px;">
              <ul class="pagination">
                <li :class="{ 'disabled': currentPage === 1 }">
                  <a href="#" @click.prevent="changePage(1)">«</a>
                </li>
                
                <li v-if="currentPage > 3">
                  <a href="#" @click.prevent="changePage(1)">1</a>
                </li>
                
                <li v-if="currentPage > 4" class="disabled">
                  <span>...</span>
                </li>
                
                <li v-for="page in pages" :key="page" :class="{ 'active': page === currentPage }">
                  <a href="#" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                
                <li v-if="currentPage < totalPages - 3" class="disabled">
                  <span>...</span>
                </li>
                
                <li v-if="currentPage < totalPages - 2">
                  <a href="#" @click.prevent="changePage(totalPages)">{{ totalPages }}</a>
                </li>
                
                <li :class="{ 'disabled': currentPage === totalPages }">
                  <a href="#" @click.prevent="changePage(currentPage + 1)">»</a>
                </li>
              </ul>
            </div>
          </div>
      </div>
    </div>
    <!-- Diálogo de confirmação para deletar tópico -->
  <q-dialog v-model="showDeleteDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6" style="margin-bottom: 8px;
  text-align: center;
  font-family: 'Ubuntu', sans-serif;
  font-size: 18px;
  font-weight: bold;">Deseja excluir {{ selectedTopics.length > 1 ? 'os tópicos selecionados' : 'o tópico' }}?</div>
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
        <q-btn outlined label="Deletar" color="negative" v-close-popup @click="deleteSelectedTopics" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'ForumView',
  props: ['category', 'subcategory'],
  setup() {
    const newTopicDialog = ref(false)
    const route = useRoute()
    const router = useRouter()
    
    return {
      route,
      router
    }
  },
  data() {
    return {
      subcategories: {
      'Em análise': [],
      'Resolvidas': []
    },
      loadingSubcategories: false,
      loading: true,
      allTopics: [],
      filteredTopics: [],
      showDeleteDialog: false,
      currentPage: 1,
      itemsPerPage: 30,
      updateInterval: null,
      timeUpdateInterval: null,
      now: new Date(),
      showOrganizacao: false,
      selectedMonth: null,
      selectedPrefix: null,
      selectedSort: null,
      monthOptions: [],
      prefixOptions: [
        { label: 'Aceito', value: 'Aceito' },
        { label: 'Negado', value: 'Negado' },
        { label: 'Em Análise', value: 'Em Análise' }
      ],
      sortOptions: [
        { label: 'Mais curtido', value: 'likes-desc' },
        { label: 'Menos curtido', value: 'likes-asc' },
        { label: 'Mais visualizado', value: 'views-desc' },
        { label: 'Menos visualizado', value: 'views-asc' },
        { label: 'Mais comentado', value: 'replies-desc' },
        { label: 'Menos comentado', value: 'replies-asc' }
      ]
    }
  },
  computed: {
    formattedSubcategories() {
    const result = {};
    for (const [key, value] of Object.entries(this.subcategories)) {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
      result[formattedKey] = value;
    }
    return result;
  },
    totalTopics() {
      return this.filteredTopics.length
    },
    totalPages() {
      return Math.ceil(this.totalTopics / this.itemsPerPage)
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },
    endItem() {
      const end = this.currentPage * this.itemsPerPage
      return end > this.totalTopics ? this.totalTopics : end
    },
    pages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, start + 4)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },
    paginatedTopics() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredTopics.slice(start, end)
    },
    selectedTopics() {
      return this.filteredTopics.filter(topic => topic.selected)
    }
  },
  created() {
  this.currentPage = parseInt(this.route.query.page) || 1;
  this.loadCategoryTopics();


    this.loadSubcategories();
  
  
},
  beforeUnmount() {
    clearInterval(this.updateInterval)
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval)
  },
  methods: {
    // Converte slug para nome legível (Ex: "em-analise" => "Em Análise")
  slugToName(slug) {
    if (!slug) return '';
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // Converte nome legível para slug (Ex: "Em Análise" => "em-analise")
  nameToSlug(name) {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '-');
  },

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
    
async loadSubcategories() {
  if (this.category !== 'Denuncias' || this.loadingSubcategories) return;
  
  this.loadingSubcategories = true;
  try {
    const response = await fetch('http://localhost:3001/api/forum/subcategories');
    if (!response.ok) throw new Error('Erro ao carregar subcategorias');
    
    const data = await response.json();
    
    // Atualiza as subcategorias com os dados da API
    this.subcategories = {
      'Em análise': data['Em análise'] || [],
      'Resolvidas': data['Resolvidas'] || []
    };
    
  } catch (error) {
    console.error('Erro ao carregar subcategorias:', error);
    this.$q.notify({
      message: 'Erro ao carregar subcategorias',
      color: 'negative'
    });
  } finally {
    this.loadingSubcategories = false;
  }
},
  
  getTotalDiscussions(group) {
    const total = group.reduce((sum, item) => sum + (item.discussions_count || 0), 0);
    return total > 0 ? total : '–';
  },
  
  getTotalMessages(group) {
    const total = group.reduce((sum, item) => sum + (item.messages_count || 0), 0);
    return total > 0 ? total : '–';
  },
    toggleOrganizacao() {
      this.showOrganizacao = !this.showOrganizacao
    },
    
    generateMonthOptions() {
      const options = []
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ]
      
      // Extrai todos os meses/anos únicos dos tópicos
      const uniqueMonths = new Set()
      
      this.allTopics.forEach(topic => {
        const date = new Date(topic.created_at)
        if (!isNaN(date.getTime())) {
          const month = date.getMonth()
          const year = date.getFullYear()
          uniqueMonths.add(`${months[month]} ${year}`)
        }
      })
      
      // Ordena do mais recente para o mais antigo
      const sortedMonths = Array.from(uniqueMonths).sort((a, b) => {
        const [monthA, yearA] = a.split(' ')
        const [monthB, yearB] = b.split(' ')
        const monthIndexA = months.indexOf(monthA)
        const monthIndexB = months.indexOf(monthB)
        
        if (yearA !== yearB) {
          return parseInt(yearB) - parseInt(yearA)
        }
        return monthIndexB - monthIndexA
      })
      
      // Adiciona a opção "Todos" no início
      sortedMonths.unshift('Todos os meses')
      
      // Cria as opções para o select
      this.monthOptions = sortedMonths.map(month => ({
        label: month,
        value: month === 'Todos os meses' ? null : month
      }))
    },
    
    filterTopics() {
      let filtered = [...this.allTopics]
      
      // Filtro por mês
      if (this.selectedMonth && this.selectedMonth.value) {
        const [monthName, year] = this.selectedMonth.value.split(' ')
        const monthIndex = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ].indexOf(monthName)
        
        filtered = filtered.filter(topic => {
          const date = new Date(topic.created_at)
          return date.getMonth() === monthIndex && date.getFullYear() === parseInt(year)
        })
      }
      
      // Filtro por prefixo (assumindo que os tópicos têm uma propriedade 'prefix')
      if (this.selectedPrefix && this.selectedPrefix.value) {
        filtered = filtered.filter(topic => topic.prefix === this.selectedPrefix.value)
      }
      if (this.subcategory) {
    filtered = filtered.filter(topic => 
      topic.subcategory.toLowerCase() === this.subcategory.toLowerCase()
    );
  }

      
      // Ordenação
      if (this.selectedSort && this.selectedSort.value) {
        const [field, order] = this.selectedSort.value.split('-')
        
        filtered.sort((a, b) => {
          const valueA = a[field] || 0
          const valueB = b[field] || 0
          
          if (order === 'desc') {
            return valueB - valueA
          } else {
            return valueA - valueB
          }
        })
      }
      
      this.filteredTopics = filtered
      this.currentPage = 1 // Reset para a primeira página após filtrar
    },
    
    openDeleteMultipleDialog() {
      if (this.selectedTopics.length > 0) {
        this.showDeleteDialog = true
      }
    },
    
    clearSelection() {
      this.filteredTopics.forEach(topic => {
        topic.selected = false
      })
    },
    
    handleTopicClick(event, topic) {
      const isCheckboxClick = event.target.tagName === 'INPUT' || 
                            event.target.classList.contains('q-checkbox') ||
                            event.target.closest('.q-checkbox')
      
      if (!isCheckboxClick) {
        this.goToTopic(topic)
      }
    },
    
    async deleteSelectedTopics() {
      if (this.selectedTopics.length === 0) return
      
      try {
        const deletePromises = this.selectedTopics.map(topic => 
          fetch(`http://localhost:3001/api/forum/delete/topic/${topic.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json'
            }
          })
        )
        
        const responses = await Promise.all(deletePromises)
        
        const allSuccess = responses.every(response => response.ok)
        
        if (!allSuccess) {
          throw new Error('Falha ao deletar alguns tópicos')
        }

        this.$q.notify({
          message: `${this.selectedTopics.length} tópico(s) deletado(s) com sucesso!`,
          color: 'positive',
          position: 'bottom',
          timeout: 2500
        })

        // Remove os tópicos deletados de ambas as listas
        const deletedIds = this.selectedTopics.map(t => t.id)
        this.allTopics = this.allTopics.filter(topic => !deletedIds.includes(topic.id))
        this.filteredTopics = this.filteredTopics.filter(topic => !deletedIds.includes(topic.id))
        
        this.clearSelection()

      } catch (error) {
        console.error('Erro ao deletar tópicos:', error)
        this.$q.notify({
          message: error.message || 'Erro ao deletar tópicos',
          color: 'negative',
          position: 'bottom',
          timeout: 3000
        })
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
    
async loadCategoryTopics() {
  this.loading = true;
  try {
    let url;
    if (this.subcategory) {
      url = `http://localhost:3001/api/forum/topics/${
        encodeURIComponent(this.category.toLowerCase())
      }/${
        encodeURIComponent(this.subcategory.toLowerCase())
      }`;
    } else {
      url = `http://localhost:3001/api/forum/topics/${this.category}`;
      console.log('Loading without subcategory URL:', url); // Log da URL
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      
      // Se for erro de subcategoria não encontrada, apenas mostra a notificação mas não redireciona
      if (errorData.error && errorData.error.includes('Subcategoria não encontrada')) {
        this.$q.notify({
          message: errorData.error,
          color: 'negative'
        });
        return; // Sai da função sem redirecionar
      }
      
      throw new Error(errorData.error || 'Erro ao carregar tópicos');
    }
    
    const result = await response.json();
    
    // Atualiza os tópicos mantendo a seleção
    this.allTopics = result.topics.map(topic => {
      const existingTopic = this.allTopics.find(t => t.id === topic.id);
      return {
        ...topic,
        selected: existingTopic ? existingTopic.selected : false,
        last_reply: {
          author: topic.last_reply_user || topic.author || 'Anônimo',
          date: topic.last_reply_time || topic.created_at
        }
      };
    });
    
    this.filteredTopics = [...this.allTopics];
    this.generateMonthOptions();
    
    // Atualiza a categoria/subcategoria ativa
    if (result.subcategory) {
      this.activeSubcategory = result.subcategory;
    }
    
  } catch (error) {
    console.error('Erro ao carregar tópicos:', error);
    this.$q.notify({
      message: error.message || 'Erro ao carregar tópicos',
      color: 'negative'
    });
    
    // Remove o redirecionamento automático para a categoria principal
    // O usuário permanecerá na página atual
  } finally {
    this.loading = false;
  }
},
  
goToSubcategory(subcategory) {
  if (this.category !== 'Denuncias') return;

  // Converte para slug (Ex: "Em Análise" → "em-analise")
  const subcategorySlug = subcategory
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  this.$router.push({
    name: 'ForumSubcategoryView',
    params: {
      category: this.category,
      subcategory: subcategorySlug
    }
  });
},


    
    changePage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) return
      
      this.currentPage = page
      this.router.replace({
        query: { ...this.route.query, page }
      })
      
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },
    
    async goToTopic(topic) {
  try {
    await fetch(`http://localhost:3001/api/forum/topic/${topic.id}/view`, {
      method: 'POST'
    });
  } catch (error) {
    console.error("Erro ao registrar visualização:", error);
  }

  // Decide se é com ou sem subcategoria
  if (this.subcategory) {
    this.$router.push({
      name: 'ForumTopic',
      params: {
        category: this.category,
        subcategory: this.subcategory,
        topic: topic.title
      },
      query: {
        id: topic.id
      }
    });
  } else {
    this.$router.push({
      name: 'ForumTopic',
      params: {
        category: this.category,
        topic: topic.title
      },
      query: {
        id: topic.id
      }
    });
  }
},
    
    handleTopicCreated(newTopic) {
      newTopic.selected = false
      this.allTopics.unshift(newTopic)
      this.filteredTopics.unshift(newTopic)
      this.newTopicDialog = false
      this.changePage(1)
      this.generateMonthOptions() // Atualiza as opções de mês
    },
    
    goToNewTopic() {
      this.$router.push({
        name: 'ForumNew',
        params: {
          category: this.category
        }
      })
    },
    
    openNewTopicDialog() {
      this.newTopicDialog = true
    }
  }
}
</script>

<style scoped>
.irorganizacao {
  display: flex;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 5px;
  margin-bottom: 15px;
}
.categories-title {
  font-weight: bold;
  font-size: 16px;
}
.flex {
  display: flex;
}
.bg-blue {
  text-transform: none;
}
.prefix.prefixGreen {
    color: white;
    font-size: 12.3px;
    background-color: #27ae60;
    border-color: #27ae60;
}
.prefix {
    background-color: transparent;
    padding: 0px 6px;
    margin: -1px 0;
    border: 1px solid transparent;
    border-radius: 0;
    display: inline-block;
}
.prefix {
    border-radius: 3px;
}
.bg-black {
    background: #515151 !important;
    text-transform: none;
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