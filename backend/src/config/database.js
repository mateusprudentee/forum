import sqlite3 from 'sqlite3';
const { Database } = sqlite3.verbose();

const db = new Database("./aaa.db");

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    
    db.serialize(() => {
       // Tabela de membros da equipe
    db.run(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`CREATE TABLE IF NOT EXISTS membros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'membro',
      avatar TEXT DEFAULT 'default_avatar.png',
      data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
      visualizando_em TEXT DEFAULT '',
      assinatura TEXT DEFAULT '',
      ultima_resposta_topico TEXT DEFAULT '',
      seguidores INTEGER DEFAULT 0,
      seguindo INTEGER DEFAULT 0,
      curtidas INTEGER DEFAULT 0,
      trofeus INTEGER DEFAULT 0,
      postagens INTEGER DEFAULT 0,
      alertas INTEGER DEFAULT 0,
      team_members TEXT DEFAULT 'nao',
      minecraft_nick TEXT,
      last_login TEXT
    )`);

    // Tabela de conteúdo dos tópicos
    db.run(`
      CREATE TABLE IF NOT EXISTS topic_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES recent_topics(id) ON DELETE CASCADE
      )
    `);

    // Tabela de categorias do fórum
    db.run(`
  CREATE TABLE IF NOT EXISTS forum_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    threads INTEGER DEFAULT 0,
    posts INTEGER DEFAULT 0,
    type TEXT CHECK(type IN ('main', 'team')) DEFAULT 'main',
    subcategoria TEXT DEFAULT 'nao',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

    // Tabela de tópicos recentes
    db.run(`
      CREATE TABLE IF NOT EXISTS recent_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        avatar TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        fixado TEXT,
        trancado TEXT,
        content TEXT,
        views INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES membros(id)
);`);

 db.run(`CREATE TABLE IF NOT EXISTS forum_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_id INTEGER NOT NULL,
    liker_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES membros(id),
    FOREIGN KEY (liker_id) REFERENCES membros(id)
);`);


    db.run(`
      CREATE TABLE IF NOT EXISTS topic_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER NOT NULL,
        author TEXT NOT NULL,
        avatar TEXT NOT NULL,  
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES recent_topics(id) ON DELETE CASCADE
      )
    `);

    // Tabela de estatísticas
    db.run(`
      CREATE TABLE IF NOT EXISTS forum_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        posts INTEGER DEFAULT 0,
        members INTEGER DEFAULT 0,
        guests INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS punicoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nick TEXT NOT NULL,
        tipo TEXT NOT NULL,
        autor TEXT NOT NULL,
        motivo TEXT,
        termino TEXT NOT NULL,
        status TEXT CHECK(status IN ('Ativo', 'Não iniciado', 'Finalizado')) DEFAULT 'Ativo',
        hora TEXT NOT NULL,
        data TEXT NOT NULL,
        provas TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de estatísticas de punições
    db.run(`
      CREATE TABLE IF NOT EXISTS punicoes_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total INTEGER DEFAULT 0,
        diario INTEGER DEFAULT 0,
        semanal INTEGER DEFAULT 0,
        mensal INTEGER DEFAULT 0,
        anual INTEGER DEFAULT 0,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

   db.run(`INSERT OR IGNORE INTO forum_categories (name, description, type, subcategoria) VALUES 
  ('Anúncios e Novidades', 'Fórum para anúncios oficiais', 'main', 'nao'),
  ('Tutoriais', 'Tutoriais e guias', 'main', 'nao'),
  ('Reporte de bugs', 'Reporte problemas encontrados', 'main', 'nao'),
  ('Denuncias', 'Área para denúncias - Categoria principal', 'main', 'Em análise'),
  ('Denúncias Aceitas', 'Denúncias que foram aceitas', 'main', 'Aceitas'),
  ('Denúncias Negadas', 'Denúncias que foram recusadas', 'main', 'Negadas'),
  ('Moderação', 'Área da equipe', 'team', 'nao')`);

    db.run(`INSERT OR IGNORE INTO forum_stats (posts, members, guests) VALUES (0, 0, 0)`);

      console.log('Banco de dados conectado e tabelas criadas.');
      resolve();  // <- Aqui resolve a promise depois que terminar tudo
    });

    db.on('error', (err) => {
      reject(err);
    });
  });
}

export { db, initializeDatabase };
