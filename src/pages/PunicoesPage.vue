<template>
  <div class="forum-layout">
    <div class="forum-main" style="margin-top: 30px;">
      <!-- Conteúdo real para Punições com animações -->
      <transition-group name="list" tag="div">
        <div v-for="(day, index) in filteredDays" :key="day.date" class="forum" :style="{ marginTop: index > 0 ? '10px' : '0' }">
          <div class="forum-card-post">
            <p>{{ day.day }}</p>
            <p style="margin-top: -25px;" v-if="day.month">{{ day.month }}</p>
            <p style="font-size: 16px; color: #9a9a9a; font-weight: normal; margin-top: -20px;">
              {{ getTotalPunicoesForDay(day.date) }} punições aplicadas.
            </p>
          </div>
          <div class="corpo-punicoes" :style="{ marginTop: index > 0 ? '-130px' : '-95px' }">
            <transition-group name="punicoes" tag="div">
              <div v-for="punicao in getVisiblePunicoesForDay(day.date)" :key="punicao.id" 
                   class="punicao-item" @click="togglePunicao(punicao.id)">
                <div class="flex horario-punicao">
                  <p style="color: black;"><q-icon name="alarm"></q-icon> {{ punicao.hora }}</p>
                  <p class="punicao-mensagem">{{ punicao.nick }} foi {{ punicao.tipo }} por {{ punicao.autor }}</p>
                </div>
                <transition name="expand">
                  <div class="punicao-detalhes-container" v-if="punicao.expandido">
                    <div class="seta-cima" :class="getStatusClass(punicao.status)"></div>
                    <div class="punicao-detalhes" :class="getStatusClass(punicao.status)">
                      <div class="detalhe-item">
                        <strong>Motivo</strong> 
                        <div class="detalhe-valor">
                          {{ punicao.motivo || 'Não informado.' }}
                        </div>
                      </div>
                      <div class="detalhe-item">
                        <strong>Término</strong> 
                        <div class="detalhe-valor">
                          {{ punicao.TERMINO || 'Não informado.' }}
                        </div>
                      </div>
                      <div class="detalhe-item-status">
                        <strong>Status</strong> 
                        <div class="detalhe-valor">
                          {{ punicao.status }}
                        </div>
                      </div>
                      <div class="detalhe-item-provas">
                        <strong>Provas</strong> 
                        <div class="detalhe-valor">
                          <a target="_blank" :href="punicao.provas || '#'" style="text-decoration: none; color: white;">
                            {{ punicao.provas ? 'Ver provas' : 'Indisponível' }} <q-icon name="open_in_new"></q-icon>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </transition-group>
            
            <div class="ver-mais" v-if="hasMorePunicoes(day.date)">
              <button type="button" class="btn btn-orange load-more" 
                      @click="loadMorePunicoes(day.date)">
                Ver mais...
              </button>
            </div>
            
            <div v-if="getVisiblePunicoesForDay(day.date).length === 0" class="no-punicoes">
              Nenhuma punição registrada neste dia.
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <div class="forum-side">
      <!-- Skeleton para Publicidade -->
      <div v-if="loading">
        <div class="forum-card-post">
          <q-skeleton type="text" width="100%" height="49px" style="margin-top: -10px;" class="skeleton-dark" />
          <q-skeleton type="text" width="100%" height="499px" style="margin-top: -130px;" class="skeleton-dark" />
        </div>
      </div>

      <!-- Conteúdo real -->
      <div v-else>
        <div class="busca" style="background: #fff;overflow:hidden;">
          <div class="flex">
            <q-input
              v-model="searchTerm"
              placeholder="Buscar usuário"
              class="title-input"
              borderless
              @keyup.enter="filterPunicoes"
            />
          </div>
        </div>
        <div class="forum-baixo" style="margin-top: 30px;">
          <div class="icone-forum-baixo">
            <q-icon name="bolt"></q-icon>
          </div>
          <div class="orientacao">
            <p>Contribua com nossa comunidade! Denuncie infratores!</p>
          </div>
        </div>
        <div class="forum-baixo" style="margin-top: 10px;">
          <div class="icone-forum-baixo">
            <q-icon name="insights"></q-icon>
          </div>
          <div class="orientacao">
            <p>ESTATÍSTICAS</p>
          </div>
          <div class="orientacao-estatistica">
            <div class="orientacao-left">
              <p>Total</p>
              <p>Ano</p>
              <p>Mês</p>
              <p>Semana</p>
            </div>
            <div class="orientacao-left-left">
              <p> {{ statistics.total }}</p>
              <p> {{ statistics.anual }}</p>
              <p> {{ statistics.mensal }}</p>
              <p> {{ statistics.semanal }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useQuasar } from 'quasar';

export default {
  name: 'PunicoesPage',
  setup() {
    const $q = useQuasar();
    return {
      showNotif(type, message) {
        $q.notify({
          type: type,
          message: message,
          position: 'top'
        });
      }
    };
  },
  data() {
    return {
      loading: true,
      punicoes: [],
      filteredPunicoes: [],
      searchTerm: '',
      visibleCounts: {},
      defaultVisibleCount: 10,
      lastFiveDays: [],
      statistics: {
        total: 0,
        diario: 0,
        semanal: 0,
        mensal: 0,
        anual: 0
      }
    };
  },
  computed: {
    filteredDays() {
      if (!this.searchTerm) {
        return this.lastFiveDays;
      }
      
      return this.lastFiveDays.filter(day => {
        return this.filteredPunicoes.some(p => p.data === day.date);
      });
    }
  },
  methods: {
    filterPunicoes() {
      if (!this.searchTerm) {
        this.filteredPunicoes = [...this.punicoes];
        return;
      }
      
      const term = this.searchTerm.toLowerCase();
      this.filteredPunicoes = this.punicoes.filter(p => 
        p.nick.toLowerCase().includes(term)
      );
      
      this.initVisibleCounts();
    },
    
    initVisibleCounts() {
      const counts = {};
      this.lastFiveDays.forEach(day => {
        counts[day.date] = this.defaultVisibleCount;
      });
      this.visibleCounts = counts;
    },
    
    getTotalPunicoesForDay(date) {
      return this.filteredPunicoes.filter(p => p.data === date).length;
    },
    
    getVisiblePunicoesForDay(date) {
      const allPunicoes = this.filteredPunicoes.filter(p => p.data === date);
      const visibleCount = this.visibleCounts[date] || this.defaultVisibleCount;
      return allPunicoes.slice(0, visibleCount);
    },
    
    hasMorePunicoes(date) {
      const total = this.filteredPunicoes.filter(p => p.data === date).length;
      const visible = this.visibleCounts[date] || this.defaultVisibleCount;
      return total > visible;
    },
    
    loadMorePunicoes(date) {
      this.visibleCounts = {
        ...this.visibleCounts,
        [date]: (this.visibleCounts[date] || this.defaultVisibleCount) + this.defaultVisibleCount
      };
    },
    
    togglePunicao(id) {
      const punicao = this.filteredPunicoes.find(p => p.id === id);
      if (punicao) {
        punicao.expandido = !punicao.expandido;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Não informado';
      
      const date = new Date(dateString);
      const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      return date.toLocaleDateString('pt-BR', options).replace(',', ' às');
    },
    
    getStatusClass(status) {
      if (status === 'Não iniciado') return 'nao-iniciado';
      if (status === 'Ativo') return 'ativo';
      if (status === 'Revogado') return 'revogado';
      if (status === 'Finalizado') return 'finalizado';
      return '';
    },
    
    getLastFiveDays() {
      const days = [];
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const dateString = date.toISOString().split('T')[0];
        
        if (i === 0) {
          days.push({ day: 'Hoje', month: '', date: dateString });
        } else {
          days.push({ day: day, month: month, date: dateString });
        }
      }
      
      return days;
    },
    
    calculateStatistics() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentWeek = this.getWeekNumber(now);
      
      this.statistics = {
        total: this.punicoes.length,
        diario: this.punicoes.filter(p => {
          const punicaoDate = new Date(p.data);
          return punicaoDate.toDateString() === now.toDateString();
        }).length,
        semanal: this.punicoes.filter(p => {
          const punicaoDate = new Date(p.data);
          return this.getWeekNumber(punicaoDate) === currentWeek && 
                 punicaoDate.getFullYear() === currentYear;
        }).length,
        mensal: this.punicoes.filter(p => {
          const punicaoDate = new Date(p.data);
          return punicaoDate.getMonth() === currentMonth && 
                 punicaoDate.getFullYear() === currentYear;
        }).length,
        anual: this.punicoes.filter(p => {
          const punicaoDate = new Date(p.data);
          return punicaoDate.getFullYear() === currentYear;
        }).length
      };
    },
    
    getWeekNumber(date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
      const week1 = new Date(d.getFullYear(), 0, 4);
      return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    },
    
    async fetchPunicoes() {
      try {
        const response = await fetch('http://localhost:3001/api/punicoes/list');
        if (!response.ok) throw new Error('Erro ao carregar punições');
        
        const data = await response.json();
        this.punicoes = data.map(p => ({
          ...p,
          expandido: false,
          TERMINO: this.formatDate(p.termino),
          data: p.data || new Date().toISOString().split('T')[0]
        }));
        
        this.filteredPunicoes = [...this.punicoes];
        this.calculateStatistics();
      } catch (error) {
        this.showNotif('negative', error.message);
        console.error('Erro ao buscar punições:', error);
      }
    }
  },
  async created() {
    this.loading = true;
    this.lastFiveDays = this.getLastFiveDays();
    
    try {
      await this.fetchPunicoes();
      this.initVisibleCounts();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
/* ANIMAÇÕES */
.list-enter-active,
.list-leave-active {
  transition: all 0.9s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.punicoes-move,
.punicoes-enter-active,
.punicoes-leave-active {
  transition: all 0.9s ease;
}
.punicoes-enter-from,
.punicoes-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.punicoes-leave-active {
  position: absolute;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* ESTILOS EXISTENTES */
.orientacao-left-left {
  flex-direction: column;
  justify-content: right;
  align-items: right;
  text-align: right;
  margin-left: auto;
}
.orientacao-estatistica {
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  line-height: 5px;
}
.busca {
  box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
      padding: 1em;
      background: white;
      width: 365px;
      border-radius: 5px;
      margin-top: 30px;
      margin-bottom: -20px;
}
.btn-orange {
    background: #faa70b;
    color: #fff !important;
    border: none;
}
.load-more {
    font-size: 16px;
    margin-top: 10px;
}
.ver-mais {
  text-align: center;
}
.btn {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: normal;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
}
.title-input {
  width: 100%;
  margin-top: -10px;
  margin-bottom: -10px;
}
.btn {
    border-radius: 5px;
    border: 0;
    text-decoration: none !important;
    font-weight: 300;
}
.icone-forum-baixo {
  text-align: center;
  font-size: 50px;
  color:#034c90;
}

.punicao-detalhes.revogado {
  background-color: #686868 !important;
  color: white;
}
.punicao-detalhes.nao-iniciado {
  background-color: #f2b126 !important;
  color: white;
}

.punicao-detalhes.ativo {
  background-color: #3fcb2d !important;
  color: white;
}

.punicao-detalhes.finalizado {
  background-color: #c64343 !important;
  color: white;
}

.no-punicoes {
  text-align: center;
  color: #9a9a9a;
  padding: 20px;
  font-style: italic;
}

.corpo-punicoes {
  margin-left: 210px;
}

.seta-cima.revogado {
  width: 0; 
  height: 0; 
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #686868 !important;
  margin-left: 30px;
  margin-bottom: -9px;
  position: relative;
  top: 1px;
}
.seta-cima.finalizado {
  width: 0; 
  height: 0; 
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #c64343 !important;
  margin-left: 30px;
  margin-bottom: -9px;
  position: relative;
  top: 1px;
}
.seta-cima.nao-iniciado {
  width: 0; 
  height: 0; 
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #f2b126 !important;
  margin-left: 30px;
  margin-bottom: -9px;
  position: relative;
  top: 1px;
}
.seta-cima {
  width: 0; 
  height: 0; 
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #3fcb2d;
  margin-left: 30px;
  margin-bottom: -9px;
  position: relative;
  top: 1px;
}

.punicao-detalhes {
  margin-top: 10px;
  padding: 15px;
  display: flex;
  gap: 20px;
  background-color: 3fcb2d;
  margin-left: 20px;
  margin-right: 20px;
}

.horario-punicao {
  color: rgb(158, 158, 158);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 0 20px;
}

.punicao-detalhes-container {
  position: relative;
  margin-top: -13px;
  margin-bottom: 20px;
}

.punicao-item {
  padding: 1em;
  margin: 0 auto;
  cursor: pointer;
  color: black;
  margin-bottom: -27px;
  width: 610px;
  transition: background-color 0.2s;
}

.punicao-mensagem {
  flex-grow: 1;
  color: black;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  margin-left: 30px;
}

.detalhe-item-provas, .detalhe-item-status, .detalhe-item {
  margin-bottom: 5px;
  color: white;
  text-align: left;
  display: flex;
  flex-direction: column;
  min-width: 120px;
  justify-content: flex-start;
}
.detalhe-item-status {
  margin-bottom: 5px;
  color: white;
  text-align: left;
  display: flex;
  flex-direction: column;
  min-width: 80px;
  justify-content: flex-start;
}
.detalhe-valor {
  word-break: break-word;
  margin-top: 5px;
}

.skeleton-dark {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px;
}

.orientacao {
  text-transform: uppercase;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  width: 250px;
  margin: 0 auto;
}

.forum-card-post {
  font-size: 30px;
  text-align: left;
  color: #034c90;
  font-weight: bold;
}
.forum {
      box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
      padding: 20px;
      width: 830px;
      background: white;
      border-radius: 5px;
      min-height: 150px;
}

.forum-layout {
  display: flex;
  gap: 40px;
  width: 100%;
}

.forum-main {
  width: 800px;
}

.forum-side {
  width: 350px;
}

.forum-baixo {
  box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
      padding: 1em;
      background: white;
      width: 365px;
      border-radius: 5px;
}

body {
  margin: 0;
  padding: 0;
  background-color: #000; 
}
</style>