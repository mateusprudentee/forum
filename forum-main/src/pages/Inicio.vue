<template>
  <div class="container">
    <div class="cards">
    <!-- Card grande à esquerda -->
    <div class="noticia-grande">
      <div class="noticia-conteudo">
        <p class="categoria">Sky Block</p>
        <p class="titulo">MAIS DE 800 NA BETA!</p>
      </div>
    </div>

    <!-- Coluna com dois cards menores -->
    <div class="coluna-menores">
      <!-- Card Bed Wars -->
      <div class="noticia-menor bedwars">
        <div class="noticia-conteudo">
          <p class="categoria">Bed Wars</p>
          <p class="titulo">MAIS DE 40 MAPAS!</p>
        </div>
      </div>

      <!-- Card Discord -->
      <div class="noticia-menor discord">
        <div class="noticia-conteudo">
          <p class="categoria">Discord</p>
          <p class="titulo">ENTRE AGORA!</p>
        </div>
      </div>
      
    </div>
    <div class="ultimas-novidades">
        <div class="ultimas-novidades-title">
          <p><q-icon name="star" style="font-size: 30px; margin-top: -4px;"></q-icon> Últimas novidades</p>
        </div>
        <div class="ultimas-novidades-list">
          <p><b>Loja:</b> anunciado com itens novos!</p>
          <p><b>Loja:</b> anunciado com itens novos!</p>
          <p><b>Loja:</b> anunciado com itens novos!</p>
          <p><b>Loja:</b> anunciado com itens novos!</p>
          <p><b>Loja:</b> anunciado com itens novos!</p>
          <p><b>Loja:</b> anunciado com itens novos!</p>
          <p><b>Loja:</b> anunciado com itens novos!</p>
          <p><b>Loja:</b> anunciado com itens novos!</p>
          <p><b>Loja:</b> anunciado com itens novos!</p>
          <p><b>Loja:</b> anunciado com itens novos!</p>
        </div>
         <div class="nosso-ip" style="margin-top: 5px;">
      <div class="nosso-ip-container">
        <div class="nosso-ip-title">
        <p>Nosso IP</p>
        </div>
        <div class="nosso-ip-subtitle">
          <p>Clique para copiar nosso IP e adicione-o à sua lista de servidores do Minecraft.</p>
        </div>
        <button class="btn btn-primary btn-lg btn-block" id="sidebar-ip-1" data-clipboard-text="redesky.com">LUGIN.COM.BR</button>
    <div class="nosso-ip-subtitle-recomendacao">
          <p>Recomendamos que você utilize a versão 1.8.9 do Minecraft.</p>
        </div>
      </div>
      </div>
      </div>
      
    </div>
    
    

  </div>



  <div class="promocao"></div>

  <div class="topicos-anuncios">
  <div class="ultimo-topico">

    <div class="header-topico">
      <div class="flex" style="display: flex;
  gap: 15px;">
      <div class="skin-logo"></div>

      <div class="header-postado">
        <p>Postado por Azalim</p>
        <div class="header-data">
        <p>14 de Jan. 2021</p>
      </div>
      </div>
      </div>

    </div>
     <div class="header-faixa">
        <div class="header-faixa-badge">
          <p style="text-transform: uppercase;">DESTAQUE</p>
           <div class="header-faixa-title">
          <p>Comando /celular e Partidas Prime</p>
        </div>
        </div>
      </div>

      <div class="conteudo-topico">
        <p>Olá meus queridos,
<br>
<br>
Sabemos que hackers são um problema. Sempre foram e, provavelmente, sempre serão. Estamos sempre buscando realizar melhorias em nosso anticheat, contudo, a forma como o Minecraft foi concebido, lá em 2010, dificulta muito a criação de mecanismos eficazes contra modificações no cliente do jogo. Por isso, é preciso trabalhar também em caminhos alternativas para combater e desincentivar o uso de hack.
<br>
<br>
Hoje, estamos introduzindo dois novos sistemas independentes: a possibilidade de vincular um número de celular à sua conta e a divisão das partidas de minigame entre Prime e comum. Eles funcionarão juntos com o objetivo de reduzir o número de hackers que você encontra nas partidas de minigame.
</p>
<div class="continuar-lendo">
 <a class="btn btn-primary" href="threads/comando-celular-e-partidas-prime.669674/">
                    Continuar lendo
                </a>
                </div>
      </div>
               
    </div>
    
  </div>
</template>
<style scoped>
.ultimas-novidades-list {
  padding: 1.5em;
  margin-top: -40px;
  line-height: 20.5px;
  color: white;
  font-size: 16px;
}
.ultimas-novidades-title {
  font-size: 22px;
  padding: 1em;
  font-weight: 500;
  color: white;
}
.continuar-lendo {
  margin-top: 30px;
  text-align: center;
}
.btn {
    padding: 15px;
    font-size: 16px;
    border-radius: 5px;
    line-height: 16px;
    background-color: #0095fd;
    margin-bottom: 12px;
}
.btn-primary {
    color: #fff;
    background-color: #0095fd;
}
.btn {
    border-radius: 5px;
    border: 0;
    text-decoration: none !important;
    font-weight: 300;
}
.conteudo-topico {
      font-size: 17px;
    line-height: 1.6;
    color: rgb(74, 74, 74);
    padding: 25px;
}
.header-faixa-title {
  font-size: 26px;
    font-weight: bold;
    color: #fff;
    margin-top: -20px;
}
.header-faixa-badge {
      font-size: 18px;
    font-weight: 300;
    color: white;
    padding: 1em;
    
}
.header-faixa {
  margin-top: 10px;
  width: 100%;
  height: 100px;
 background-color: #2b2b2b;
}
.header-data {
  color: gray;
  margin-top: -18px;
}
.header-postado {
      font-size: 16px;
      margin-top: 10px;
    color: #2b2b2b;
    font-weight: normal;
}
.header-topico {
  padding: 15px;
  
}
.skin-logo {
      border-radius: 5px;
    width: 70px;
    background-image: url("https://i.imgur.com/3rnEyzP.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
    height: 70px;
}
.topicos-anuncios {
  max-width: 815px;
}
.ultimo-topico {
  box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
  background: #fff;
    border-radius: 5px;
    width: 100%;
    margin-top: 20px;
    height: 100%;
}
.promocao::before {
  background-image: url("https://i.imgur.com/vet5hUo.png");
}
.promocao {
   width: 815px;
   margin-top: 10px;
  height: 160px;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  background-color: #000; /* fallback */
  box-shadow: rgba(0, 0, 0, 0.5) 0px 3px 12px -3px;
  display: flex;
  align-items: flex-end;
  color: white;
  cursor: pointer;
}
.cards {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.ultimas-novidades {
  position: relative;
  border-radius: 5px;
  box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
  background: #fff;
    border-radius: 5px;
    width: 100%;
    background: #0095FD;
    height: 100%;
  width: 385px;
  height: 460px;
}
/* Card grande */
.noticia-grande,
.noticia-menor {
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  background-color: #000; /* fallback */
  box-shadow: rgba(0, 0, 0, 0.5) 0px 3px 12px -3px;
  display: flex;
  align-items: flex-end;
  color: white;
  cursor: pointer;
}

/* Fundo com pseudo-elemento */
.noticia-grande::before,
.noticia-menor::before,
.promocao::before {
  content: "";
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.4s ease;
  z-index: 0;
}

/* Imagens específicas */
.noticia-grande::before {
  background-image: linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 89%, rgba(0, 0, 0, 0.75) 100%),
    url("https://i.imgur.com/FdU5YNG.jpg");
}

.bedwars::before {
  background-image: linear-gradient(rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.75) 100%),
    url("https://i.imgur.com/idG7Gr7.jpg");
}

.discord::before {
  background-image: linear-gradient(rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.75) 100%),
    url("https://i.imgur.com/3G0EbXZ.jpg");
}

/* Zoom da imagem no hover */
.noticia-grande:hover::before,
.noticia-menor:hover::before,
.promocao:hover::before {
  transform: scale(1.05);
}

/* Conteúdo na frente da imagem */
.noticia-conteudo {
  position: relative;
  z-index: 1;
  padding: 1em;
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
    height: 300px;
    background: white;
    border-radius: 3px;
    margin-top: 20px;
    box-shadow: 0px 3px 12px -3px rgba(0, 0, 0, 0.5);
}
/* Dimensões */
.noticia-grande {
  width: 402px;
  height: 460px;
}

.noticia-menor {
  width: 400px;
  height: 225px;
}

/* Coluna dos menores */
.coluna-menores {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.categoria {
  font-size: 22px;
  font-weight: 300;
}

.titulo {
  text-transform: uppercase;
  font-size: 26px;
  font-weight: bold;
  margin-top: -20px;
}
</style>
