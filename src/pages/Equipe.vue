<template>
  <div class="staff-container">
     <!-- Masters -->
    <div class="topicos" v-if="masters.length > 0">
      <div class="staff-category master">
        <p>Masters ({{ masters.length }})</p>
      </div>
      <div class="staff-users">
        <div class="flex">
          <div v-for="member in masters" :key="member.id" class="staff-usuario">
            <div class="staff-avatar" :style="{ backgroundImage: 'url(' + member.avatar + ')' }"></div>
            <div class="staff-nome-title">
              <p> {{ member.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Gerentes -->
    <div class="topicos" v-if="gerentes.length > 0">
      <div class="staff-category manager">
        <p>Gerentes ({{ gerentes.length }})</p>
      </div>
      <div class="staff-users">
        <div class="flex">
          <div v-for="member in gerentes" :key="member.id" class="staff-usuario">
            <div class="staff-avatar" :style="{ backgroundImage: 'url(' + member.avatar + ')' }"></div>
            <div class="staff-nome-title">
              <p>{{ member.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

   

    <!-- Administradores -->
    <div class="topicos" v-if="administradores.length > 0">
      <div class="staff-category admin">
        <p>Administradores ({{ administradores.length }})</p>
      </div>
      <div class="staff-users">
        <div class="flex">
          <div v-for="member in administradores" :key="member.id" class="staff-usuario">
            <div class="staff-avatar" :style="{ backgroundImage: 'url(' + member.avatar + ')' }"></div>
            <div class="staff-nome-title">
              <p>{{ member.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Moderadores -->
    <div class="topicos" v-if="moderadores.length > 0">
      <div class="staff-category moderator">
        <p>Moderadores ({{ moderadores.length }})</p>
      </div>
      <div class="staff-users">
        <div class="flex">
          <div v-for="member in moderadores" :key="member.id" class="staff-usuario">
            <div class="staff-avatar" :style="{ backgroundImage: 'url(' + member.avatar + ')' }"></div>
            <div class="staff-nome-title">
              <p>{{ member.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ajudantes -->
    <div class="topicos" v-if="ajudantes.length > 0">
      <div class="staff-category helper">
        <p>Ajudantes ({{ ajudantes.length }})</p>
      </div>
      <div class="staff-users">
        <div class="flex">
          <div v-for="member in ajudantes" :key="member.id" class="staff-usuario">
            <div class="staff-avatar" :style="{ backgroundImage: 'url(' + member.avatar + ')' }"></div>
            <div class="staff-nome-title">
              <p>{{ member.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.staff-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.staff-usuario {
  text-align: center;
  width: 100px;
  margin-bottom: 20px;
}

.staff-nome-title {
  margin-top: 10px;
  font-size: 14px;
}

.staff-nome-title p {
  margin: 0;
}

.flex {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.staff-avatar {
  background-size: cover;
  background-position: center;
  width: 100px;
  height: 100px;
  text-align: center;
  position: relative;
  border-radius: 5px;
}

.staff-users {
  padding: 20px 40px;
}

.staff-category {
  font-weight: 500;
  font-size: 18px;
  padding: 35px 40px;
  padding-bottom: 0;
}

.topicos {
  width: 100%;
  background: white;
  border-radius: 3px;
  box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
}

/* Cores específicas para cada cargo */
.manager {
  color: #8B0000; /* Vermelho escuro */
  font-weight: bold;
}

.master {
  color: #ffc400; /* Laranja escuro */
  font-weight: bold;
}

.master .staff-role {
  color: #ffc400;
}

.admin {
  color: #e74c3c; /* Vermelho claro */
  font-weight: bold;
}

.moderator {
  color: #27ae60; /* Verde escuro */
  font-weight: bold;
}

.helper {
  color: #f1c40f; /* Amarelo claro */
  font-weight: bold;
}
</style>

<script>
export default {
  name: 'StaffPage',
  data() {
    return {
      teamMembers: [],
      gerentes: [],
      masters: [],
      administradores: [],
      moderadores: [],
      ajudantes: []
    }
  },
  created() {
    this.fetchTeamMembers();
  },
  methods: {
    async fetchTeamMembers() {
      try {
        const response = await fetch('http://localhost:3001/api/team');
        if (!response.ok) {
          throw new Error('Falha ao carregar membros da equipe');
        }
        this.teamMembers = await response.json();
        this.categorizeMembers();
      } catch (error) {
        console.error('Erro ao buscar membros da equipe:', error);
      }
    },
    categorizeMembers() {
      // Limpar arrays antes de categorizar
      this.gerentes = [];
      this.masters = [];
      this.administradores = [];
      this.moderadores = [];
      this.ajudantes = [];

      this.teamMembers.forEach(member => {
        const roleLower = member.role.toLowerCase();
        
        if (roleLower.includes('gerente')) {
          this.gerentes.push(member);
        } else if (roleLower.includes('master')) {
          this.masters.push(member);
        } else if (roleLower.includes('administrador')) {
          this.administradores.push(member);
        } else if (roleLower.includes('moderador')) {
          this.moderadores.push(member);
        } else if (roleLower.includes('ajudante')) {
          this.ajudantes.push(member);
        }
      });

      // Ordenar por data de criação (mais antigos primeiro)
      const sortByDate = (a, b) => new Date(a.data_criacao) - new Date(b.data_criacao);
      this.gerentes.sort(sortByDate);
      this.masters.sort(sortByDate);
      this.administradores.sort(sortByDate);
      this.moderadores.sort(sortByDate);
      this.ajudantes.sort(sortByDate);
    }
  }
}
</script>