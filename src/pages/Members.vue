<template>
<div class="navbar-forum">
  <div class="navbar-forum-inicio">
    <q-icon name="home" />
  </div>
  <div class="navbar-forum-itens-um"></div>

  <div class="navbar-forum-itens-um"></div>

  <router-link
    :to="subcategory ? `/forum/` : ''"
    style="text-decoration: none;"
  >
    <div 
      class="navbar-forum-itens-forum" 
    >
      <div 
        :class="{ 'navbar-forum-itens': !subcategory }" 
        :style="!subcategory ? { height: '100px', marginLeft: '-10px', marginTop: '-12px' } : {}"
      >
        <p style="margin-left: 19px;">Membros</p>
      </div>
    </div>
  </router-link>
</div>

<div class="container" style="gap: 20px;">
  <div class="search-container" style="margin-top: 30px; margin-bottom: 20px;">
    
  </div>

  <p style="margin-top: 10px; font-weight: 100; font-size: 19px; margin-bottom: -10px;">Filtre os membros</p>
  <div class="botoes">
    <q-input
      outlined
      v-model="searchQuery"
      placeholder="Procurar membro..."
      style="width: 300px; margin-bottom: 30px;"
      clearable
      dense
    >
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-input>
    <q-btn 
      :outline="sortField !== 'postCount'"
      label="POSTAGENS" 
      :icon="sortField === 'postCount' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'arrow_upward_alt'" 
      color="primary"
      @click="sortBy('postCount')"
      :class="{ 'active-filter': sortField === 'postCount' }"
    ></q-btn>
    <q-btn 
      :outline="sortField !== 'curtidas'"
      label="CURTIDAS" 
      :icon="sortField === 'curtidas' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'arrow_upward_alt'" 
      color="primary" 
      style="margin-left: 10px;"
      @click="sortBy('curtidas')"
      :class="{ 'active-filter': sortField === 'curtidas' }"
    ></q-btn>
    <q-btn 
      :outline="sortField !== 'trofeus'"
      label="TROFÉUS" 
      :icon="sortField === 'trofeus' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'arrow_upward_alt'" 
      color="primary" 
      style="margin-left: 10px;"
      @click="sortBy('trofeus')"
      :class="{ 'active-filter': sortField === 'trofeus' }"
    ></q-btn>
  
    <div class="membros-list">
      <div v-if="loading" class="loading-message">Carregando membros...</div>
      <div v-else-if="error" class="error-message">Erro ao carregar membros: {{ error }}</div>
      <div v-else>
        <div v-for="member in paginatedMembers" :key="member.id" class="membros">
          <div class="skin" style="margin-top: 5px;">
            <img 
              :src="member.avatar || 'https://web.archive.org/web/20210225224640im_/https://www.redesky.com/data/avatars/s/0/89.jpg?1545020226'" 
              width="50" 
              height="50" 
              alt="[IMG]" 
              style="border-radius: 10px; margin-top: 0px;"
            >
          </div>
           
          <div class="membros-name">
           <router-link :to="`/perfil/${member.username}`" 
              style="text-decoration: none; color: black;"
            >
            <p :style="{ color: getRoleColor(member.role) }">{{ member.username }}</p>
            
            <div class="membros-info">
              <p>
                  Membro desde: {{ formatDate(member.data_criacao) }},
                Postagens: {{ member.postCount || 0 }}, 
                Curtidas: {{ member.curtidas || 0 }},  
                Troféus: {{ member.trofeus || 0 }},  
                Seguidores: {{ member.seguidores || 0 }}
              </p>
              <p v-if="member.minecraft_nick && member.minecraft_nick !== member.username">
                Minecraft: {{ member.minecraft_nick }}
              </p>
            </div>
            </router-link>
          </div>
          <div class="filtro-selecionado">
            <p>{{ formatNumber(member[sortField]) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex" v-if="filteredMembers.length > membersPerPage" style="margin-top: 20px;">
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
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'ForumView',
  props: ['category', 'subcategory'],
  setup() {
    const route = useRoute()
    const router = useRouter()
    const members = ref([])
    const loading = ref(true)
    const error = ref(null)
    const sortField = ref('postCount')
    const sortAsc = ref(false)
    const searchQuery = ref('')
    const currentPage = ref(1)
    const membersPerPage = ref(30)
    
    const roleColors = {
      'Master': '#ffc400',
      'Gerente': '#d00000',
      'Admin': '#ff5555',
      'Moderador': '#00ae09',
      'Ajudante': '#e0ff00',
      'membro': 'gray'
    }
    
    const fetchMembers = async () => {
      try {
        const membersResponse = await fetch('http://localhost:3001/api/members')
        if (!membersResponse.ok) {
          throw new Error('Falha ao carregar membros')
        }
        const membersData = await membersResponse.json()
        
        const membersWithPosts = await Promise.all(
          membersData.map(async member => {
            const postsResponse = await fetch(`http://localhost:3001/api/members/${member.username}/posts`)
            if (!postsResponse.ok) {
              return { ...member, postCount: 0 }
            }
            const postsData = await postsResponse.json()
            return { ...member, postCount: postsData.postCount || 0 }
          })
        )
        
        members.value = membersWithPosts
      } catch (err) {
        error.value = err.message
        console.error('Erro ao buscar membros:', err)
      } finally {
        loading.value = false
      }
    }
    
    const filteredMembers = computed(() => {
      if (!searchQuery.value) return sortedMembers.value
      
      const query = searchQuery.value.toLowerCase()
      return sortedMembers.value.filter(member => 
        member.username.toLowerCase().includes(query) ||
        (member.minecraft_nick && member.minecraft_nick.toLowerCase().includes(query))
      )
    })
    
    const sortedMembers = computed(() => {
      if (!members.value) return []
      
      return [...members.value].sort((a, b) => {
        const valueA = a[sortField.value] || 0
        const valueB = b[sortField.value] || 0
        
        return sortAsc.value ? valueA - valueB : valueB - valueA
      })
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredMembers.value.length / membersPerPage.value)
    })
    
    const pages = computed(() => {
      const range = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        range.push(i)
      }
      
      return range
    })
    
    const paginatedMembers = computed(() => {
      const start = (currentPage.value - 1) * membersPerPage.value
      const end = start + membersPerPage.value
      return filteredMembers.value.slice(start, end)
    })
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Data desconhecida'
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('pt-BR', options)
    }
    
    const formatNumber = (num) => {
      if (!num) return '0'
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }
    
    const getRoleColor = (role) => {
      return roleColors[role] || '#ffffff'
    }
    
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortAsc.value = !sortAsc.value
      } else {
        sortField.value = field
        sortAsc.value = false
      }
      currentPage.value = 1 // Reset to first page when sorting changes
    }
    
    const changePage = (page) => {
      if (page < 1 || page > totalPages.value || page === currentPage.value) return
      currentPage.value = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    onMounted(() => {
      fetchMembers()
    })
    
    return {
      route,
      router,
      members,
      loading,
      error,
      formatDate,
      formatNumber,
      sortBy,
      sortedMembers,
      sortField,
      sortAsc,
      getRoleColor,
      searchQuery,
      filteredMembers,
      paginatedMembers,
      currentPage,
      membersPerPage,
      totalPages,
      pages,
      changePage
    }
  }
}
</script>

<style scoped>
.filtro-selecionado {
    text-align: right;
    margin-top: 20px;
    padding: 0 0.5em;
    font-size: 20px;
    flex-direction: column;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-left: auto;
}

.membros-info {
    margin-top: -16px;
    color: gray;
    font-size: 13px;
}
.membros-name {
    font-size: 16px;
    margin-top: 8px;
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
.membros {
    display: flex;
    gap: 15px;
}
.membros-list {
    box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
      padding: 1em;
      background: white;
      width: 100%;

      min-height: 130px;
      margin-top: 20px;
      border-radius: 5px;
}
.botoes {
    margin-top: 20px;
    gap: 20px;
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
