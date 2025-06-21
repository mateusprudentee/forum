<template>
  <div class="flex flex-center text-center">
    <div class="error-container">
      <h1 class="text-h1">404</h1>
      <p class="text-h5">Página não encontrada</p>
      <q-btn
        color="primary"
        label="Voltar para a página inicial"
        to="/"
        class="q-mt-md"
      />
    </div>
</div>
</template>

<style scoped>
.error-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.text-h1 {
  font-size: 5rem;
  margin-bottom: 20px;
  color: #303030;
  font-weight: 800;
}

.text-h5 {
  margin-bottom: 5px;
  margin-top: -20px;
}
</style>