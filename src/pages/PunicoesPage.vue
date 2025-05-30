<template>
    <div class="forum-layout">
      <div class="forum-main" style="margin-top: 30px;">


        <!-- Conteúdo real para Punições -->
        <div class="forum">
          <div class="forum-card-post">
            <p>Hoje</p>
            <p style="font-size: 16px; color: #9a9a9a; font-weight: normal; margin-top: -20px; ">{{ punicoes.length }} punições aplicadas.</p>
          </div>
          <div class="corpo-punicoes">
            <div v-for="(punicao, index) in punicoes" :key="punicao.id" class="punicao-item" @click="togglePunicao(index)">
    <div class="flex horario-punicao">
      <p style="color: black;"><q-icon name="alarm"></q-icon> {{ punicao.hora }}</p>
      <p class="punicao-mensagem">{{ punicao.nick }} foi {{ punicao.tipo }} por {{ punicao.autor }}</p>
    </div>
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
              {{ punicao.provas ? 'Ver provas' : 'Nenhuma prova' }} <q-icon name="open_in_new"></q-icon>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
          </div>
        </div>
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
          <div class="forum-baixo" style="margin-top: 30px;">
            <div class="icone-forum-baixo">
              <q-icon name="bolt"></q-icon>
            </div>
            <div class="orientacao">
              <p>Contribua com nossa comunidade! Denuncie infratores!</p>
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
      statistics: {
        total: 0,
        diario: 0,
        semanal: 0,
        mensal: 0,
        anual: 0
      }
    };
  },
  methods: {
    togglePunicao(index) {
      this.punicoes[index].expandido = !this.punicoes[index].expandido;
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
      // Retorna a classe correspondente ao status
      if (status === 'Não iniciado') return 'nao-iniciado';
      if (status === 'Ativo') return 'ativo';
      if (status === 'Revogado') return 'revogado';
      if (status === 'Finalizado') return 'finalizado';
      return '';
    },
    async fetchPunicoes() {
      try {
        const response = await fetch('http://localhost:3001/api/punicoes/list');
        if (!response.ok) throw new Error('Erro ao carregar punições');
        
        const data = await response.json();
        this.punicoes = data.map(p => ({
          ...p,
          expandido: false,
          TERMINO: this.formatDate(p.termino)
        }));
      } catch (error) {
        this.showNotif('negative', error.message);
        console.error('Erro ao buscar punições:', error);
      }
    },
    async fetchStatistics() {
      try {
        const response = await fetch('http://localhost:3001/api/punicoes/stats');
        if (!response.ok) throw new Error('Erro ao carregar estatísticas');
        
        const data = await response.json();
        this.statistics = data;
      } catch (error) {
        this.showNotif('negative', error.message);
        console.error('Erro ao buscar estatísticas:', error);
      }
    },
    async addPunicao(punicaoData) {
      try {
        const response = await fetch('http://localhost:3001/api/punicoes/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(punicaoData)
        });
        
        if (!response.ok) throw new Error('Erro ao adicionar punição');
        
        const data = await response.json();
        this.showNotif('positive', 'Punição adicionada com sucesso!');
        this.fetchPunicoes();
        this.fetchStatistics();
        return data;
      } catch (error) {
        this.showNotif('negative', error.message);
        console.error('Erro ao adicionar punição:', error);
        throw error;
      }
    },
    async updatePunicaoStatus(id, status) {
      try {
        const response = await fetch(`http://localhost:3001/api/punicoes/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar status');
        
        const data = await response.json();
        this.showNotif('positive', 'Status atualizado com sucesso!');
        this.fetchPunicoes();
        this.fetchStatistics();
        return data;
      } catch (error) {
        this.showNotif('negative', error.message);
        console.error('Erro ao atualizar status:', error);
        throw error;
      }
    },
    async updatePunicaoTermino(id, termino) {
      try {
        const response = await fetch(`http://localhost:3001/api/punicoes/${id}/termino`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ termino })
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar término');
        
        const data = await response.json();
        this.showNotif('positive', 'Término atualizado com sucesso!');
        this.fetchPunicoes();
        return data;
      } catch (error) {
        this.showNotif('negative', error.message);
        console.error('Erro ao atualizar término:', error);
        throw error;
      }
    },
    async verificarPunicao(nick) {
      try {
        const response = await fetch(`http://localhost:3001/api/punicoes/verificar/${nick}`);
        if (!response.ok) throw new Error('Erro ao verificar punição');
        
        return await response.json();
      } catch (error) {
        this.showNotif('negative', error.message);
        console.error('Erro ao verificar punição:', error);
        throw error;
      }
    }
  },
  async created() {
    this.loading = true;
    try {
      await Promise.all([this.fetchPunicoes(), this.fetchStatistics()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>
  <style scoped>
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
  background-color: #3fcb2d !important; /* Vermelho para Ativo */
  color: white;
}

.punicao-detalhes.finalizado {
  background-color: #c64343 !important; /* Verde para Finalizado */
  color: white;
}

  /* Estilos para a seção Contribua */
  .contribua-container {
    display: flex;
    justify-content: space-between;
    padding: 1em;
    margin-bottom: -15px;
    margin-top: 10px;
  }
  
  .periodos {
    color: gray;
    text-align: left;
  }
  
  .periodos p, .valores p {
    padding: 0.2em;
    justify-content: center;
    margin: 0 auto;
    margin-left: 20px;
  }
  
  .valores {
    color: white;
    text-align: right;
    margin-right: 30px;
  }
  
  /* Estilos existentes */
  .total-right {
    color: white;
  }
  
  .orientacao {
        text-transform: uppercase;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    width: 250px;
    margin: 0 auto;
  }
  
  .corpo-punicoes {
    margin-top: -95px;
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
  .corpo-punicoes {
  margin-top: -95px;
  margin-left: 210px;
}

.seta-cima {
  width: 0; 
  height: 0; 
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid 3fcb2d;
  margin-left: 30px;
  margin-bottom: -9px;
  position: relative;
  top: 1px;
}

.punicao-detalhes-container {
  position: relative;
  margin-top: -13px;
  margin-bottom: 20px;
}

.punicao-detalhes {
  margin-top: 10px;
  padding: 15px;
  display: flex;
  gap: 20px;
  background-color: 3fcb2d;
  margin-left: 20px;
  margin-right: 20px;
  justify-content: flex-start; /* Garante o alinhamento correto */
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
  min-width: 120px; /* Tamanho fixo para garantir consistência */
  justify-content: flex-start; /* Garante que o texto fique alinhado no topo */
}
.detalhe-item-status {
  margin-bottom: 5px;
  color: white;
  text-align: left;
  display: flex;
  flex-direction: column;
  min-width: 80px; /* Tamanho fixo para garantir consistência */
  justify-content: flex-start; /* Garante que o texto fique alinhado no topo */
}
.detalhe-valor {
  word-break: break-word;
  margin-top: 5px;
}

  .expand-icon {
    margin-left: auto;
  }
  
  /* Estilo para os skeletons */
  .skeleton-dark {
    background-color: rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px;
  }
  
  .skin img {
    border-radius: 10px !important;
  }
  
  .left-info {
    margin-bottom: -30px;
    text-align: left;
    padding: 0;
    margin-top: 0;
    color: gray;
    line-height: 10px;
    flex-grow: 1;
  }
  
  .equipe-titulo {
    margin-top: -20px;
    color:gray;
    font-size: 15px;
    font-weight: normal;
  }
  .equipe-title {
    color: orange;
    font-weight: bold;
    font-size: 17px;
  }
  .equipe-tipo {
    padding: 1em;
    text-align: left;
    padding-top: 0px;
    margin-top: -15px;
  }
  .publi-top {
    padding: 1em;
    margin-top: -30px;
  }
  .publi {
    width: 100%;
    height: 150px;
    background-image: url("https://yt3.googleusercontent.com/cfGdandwrxeJxd8fXLE3geAmWdTNxipDWjiZl0raED6O5GQ-2kIjHmCgNrQxtf4ygubqExSL=s900-c-k-c0x00ffffff-no-rj");
    background-position: center;
    background-size: cover;
    border-radius: 10px;
  }
  .topicos-title-baixo {
      color: rgb(184, 184, 184);
      font-weight: bold;
      flex-grow: 1;
      text-align: left;
      font-size: 16px;
  }
  .topicos-abaixo {
    padding: 1.5em;
    margin-top: -35px;
    padding-top: 0px;
  }
  .linha {
      width: 100%;
      margin-bottom: 35px;
      margin-top: -20px;
      height: 1px;
      background: rgba(128, 128, 128, 0.048);
  }
  .forum-baixo {
    box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
        padding: 1em;
        background: white;
        width: 365px;
        border-radius: 5px;
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
    padding-top: 0px;
    margin-top: 5px;
  }
  .topicos-views {
    margin-top: -15px;
    font-weight: normal;
    font-size: 11px;
    color: gray;
  }
  .topicos-subtitle {
    text-align: left;
    font-size: 12px;
    font-weight: normal;
    margin-top: -15px;
    color: gray;
  }
  .flex {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .topicos {
    padding: 1.5em;
    margin-top: -20px;
    padding-top: 0px;
  }
  .topicos-title {
    flex-grow: 1;
    text-align: left;
    font-size: 16px;
    color: rgb(207, 207, 207);
  }
  .ultima-resposta-container {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 150px;
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
  
  .container {
    width: 1250px;
    font-family: 'Ubuntu', sans-serif;
    margin: 0 auto;
    text-align: center;
    margin-top: 130px;
    background-color: #000;
    padding-bottom: 20px; 
  }
  
  .stats-content {
    padding: 1.5em;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    color: rgb(207, 207, 207);
    font-size: 14px;
  }
  
  .pagina {
    background-color: #000;
    min-height: 100vh; 
    margin: 0;
    margin-top: -80px;
    padding: 130px 0 0 0; 
  }
  
  body {
    margin: 0;
    padding: 0;
    background-color: #000; 
  }
  </style>
  
 