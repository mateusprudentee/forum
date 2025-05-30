import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Importação alternativa para sqlite3
const sqlite3 = (await import('sqlite3')).default;
const { Database } = sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Configurações básicas
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Conexão com o banco de dados
const db = new Database("./forum.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite");
    initializeDatabase();
  }
});


// Inicializar o banco de dados
function initializeDatabase() {
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
        content TEXT NOT NULL,
        views INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

// Adicione isso na função initializeDatabase()
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


    // Inserir dados iniciais
    insertInitialData();
  });
}



// Função para atualizar estatísticas
function updatePunicoesStats() {
  const hoje = new Date().toISOString().split('T')[0];
  const umaSemanaAtras = new Date();
  umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
  const umMesAtras = new Date();
  umMesAtras.setMonth(umMesAtras.getMonth() - 1);
  const umAnoAtras = new Date();
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

  db.serialize(() => {
    // Contar punições diárias
    db.get(
      "SELECT COUNT(*) as count FROM punicoes WHERE data = ?",
      [hoje],
      (err, row) => {
        if (err) return console.error(err.message);
        const diario = row.count;

        // Contar punições semanais
        db.get(
          "SELECT COUNT(*) as count FROM punicoes WHERE data >= ?",
          [umaSemanaAtras.toISOString().split('T')[0]],
          (err, row) => {
            if (err) return console.error(err.message);
            const semanal = row.count;

            // Contar punições mensais
            db.get(
              "SELECT COUNT(*) as count FROM punicoes WHERE data >= ?",
              [umMesAtras.toISOString().split('T')[0]],
              (err, row) => {
                if (err) return console.error(err.message);
                const mensal = row.count;

                // Contar punições anuais
                db.get(
                  "SELECT COUNT(*) as count FROM punicoes WHERE data >= ?",
                  [umAnoAtras.toISOString().split('T')[0]],
                  (err, row) => {
                    if (err) return console.error(err.message);
                    const anual = row.count;

                    // Contar total de punições
                    db.get(
                      "SELECT COUNT(*) as count FROM punicoes",
                      [],
                      (err, row) => {
                        if (err) return console.error(err.message);
                        const total = row.count;

                        // Atualizar estatísticas
                        db.run(`
                          UPDATE punicoes_stats 
                          SET 
                            total = ?,
                            diario = ?,
                            semanal = ?,
                            mensal = ?,
                            anual = ?,
                            atualizado_em = CURRENT_TIMESTAMP
                        `, [total, diario, semanal, mensal, anual]);
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}
// Inserir dados iniciais
function insertInitialData() {
  // Tópicos recentes
  db.get("SELECT COUNT(*) as count FROM recent_topics", (err, row) => {
    if (err) return console.error("Erro ao verificar recent_topics:", err.message);
    
    if (row.count === 0) {
      const recentTopics = [
        { 
          avatar: "https://cravatar.eu/helmavatar/Azalim/64", 
          title: "Bem-vindo ao nosso fórum", 
          category: "Anúncios e Novidades",
          content: `
            <h4>Seja bem-vindo ao nosso fórum!</h4>
            <p>Estamos muito felizes em tê-lo conosco nesta nova comunidade. Aqui você pode:</p>
            <ul>
              <li>Discutir sobre o servidor</li>
              <li>Encontrar ajuda quando precisar</li>
              <li>Sugerir novas ideias e melhorias</li>
              <li>Participar de eventos especiais</li>
            </ul>
            <p>Não se esqueça de ler as <strong>regras do fórum</strong> antes de postar!</p>
            <p>Estamos ansiosos para ver suas contribuições e ideias para tornar nosso servidor ainda melhor.</p>
          `
        },
        { 
          avatar: "https://cravatar.eu/helmavatar/Matcky/64", 
          title: "Precisa de ajuda?", 
          category: "Suporte",
          content: `
            <h4>Seja bem-vindo ao nosso fórum!</h4>
            <p>Estamos muito felizes em tê-lo conosco nesta nova comunidade. Aqui você pode:</p>
            <ul>
              <li>Discutir sobre o servidor</li>
              <li>Encontrar ajuda quando precisar</li>
              <li>Sugerir novas ideias e melhorias</li>
              <li>Participar de eventos especiais</li>
            </ul>
            <p>Não se esqueça de ler as <strong>regras do fórum</strong> antes de postar!</p>
            <p>Estamos ansiosos para ver suas contribuições e ideias para tornar nosso servidor ainda melhor.</p>
          `
        },
        { 
          avatar: "https://cravatar.eu/helmavatar/Pedroo/64", 
          title: "Próximos eventos", 
          category: "Eventos",
          content: `
            <h4>Seja bem-vindo ao nosso fórum!</h4>
            <p>Estamos muito felizes em tê-lo conosco nesta nova comunidade. Aqui você pode:</p>
            <ul>
              <li>Discutir sobre o servidor</li>
              <li>Encontrar ajuda quando precisar</li>
              <li>Sugerir novas ideias e melhorias</li>
              <li>Participar de eventos especiais</li>
            </ul>
            <p>Não se esqueça de ler as <strong>regras do fórum</strong> antes de postar!</p>
            <p>Estamos ansiosos para ver suas contribuições e ideias para tornar nosso servidor ainda melhor.</p>
          `
        },
        { 
          avatar: "https://cravatar.eu/helmavatar/Azalim/64", 
          title: "Dê suas sugestões aqui", 
          category: "Sugestões",
          content: `
            <h4>Seja bem-vindo ao nosso fórum!</h4>
            <p>Estamos muito felizes em tê-lo conosco nesta nova comunidade. Aqui você pode:</p>
            <ul>
              <li>Discutir sobre o servidor</li>
              <li>Encontrar ajuda quando precisar</li>
              <li>Sugerir novas ideias e melhorias</li>
              <li>Participar de eventos especiais</li>
            </ul>
            <p>Não se esqueça de ler as <strong>regras do fórum</strong> antes de postar!</p>
            <p>Estamos ansiosos para ver suas contribuições e ideias para tornar nosso servidor ainda melhor.</p>
          `
        },
        { 
          avatar: "https://cravatar.eu/helmavatar/Matcky/64", 
          title: "Conversa livre", 
          category: "Off-topic",
          content: `
            <h4>Seja bem-vindo ao nosso fórum!</h4>
            <p>Estamos muito felizes em tê-lo conosco nesta nova comunidade. Aqui você pode:</p>
            <ul>
              <li>Discutir sobre o servidor</li>
              <li>Encontrar ajuda quando precisar</li>
              <li>Sugerir novas ideias e melhorias</li>
              <li>Participar de eventos especiais</li>
            </ul>
            <p>Não se esqueça de ler as <strong>regras do fórum</strong> antes de postar!</p>
            <p>Estamos ansiosos para ver suas contribuições e ideias para tornar nosso servidor ainda melhor.</p>
          `
        }
      ];
    // Inserir tópicos e seus conteúdos
    const topicStmt = db.prepare("INSERT INTO recent_topics (avatar, title, category) VALUES (?, ?, ?)");
    const contentStmt = db.prepare("INSERT INTO topic_content (topic_id, content) VALUES (?, ?)");
    
    recentTopics.forEach(topic => {
      topicStmt.run(topic.avatar, topic.title, topic.category, function(err) {
        if (err) return console.error(err);
        
        const topicId = this.lastID;
        contentStmt.run(topicId, topic.content);
      });
    });
    
    topicStmt.finalize();
    contentStmt.finalize();
  }
});
 
  
  // Estatísticas
  db.get("SELECT COUNT(*) as count FROM forum_stats", (err, row) => {
    if (err) return console.error("Erro ao verificar forum_stats:", err.message);
    
    if (row.count === 0) {
      db.run("INSERT INTO forum_stats (posts, members, guests) VALUES (5, 0, 0)");
    }
  });
}

// Função auxiliar para formatar o tempo relativo
function formatRelativeTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
  if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'agora mesmo';
}

// Rotas da API
// Obter todas as punições
app.get('/api/punicoes/list', (req, res) => {
  const { limit, page, tipo, status, autor } = req.query;
  const offset = page ? (parseInt(page) - 1) * (parseInt(limit) || 10) : 0;
  
  let query = 'SELECT * FROM punicoes WHERE 1=1';
  const params = [];
  
  if (tipo) {
    query += ' AND tipo = ?';
    params.push(tipo);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (autor) {
    query += ' AND autor = ?';
    params.push(autor);
  }
  
  query += ' ORDER BY data DESC, hora DESC';
  
  if (limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Obter punições por nick
app.get('api/punicoes/nick/:nick', (req, res) => {
  const { nick } = req.params;
  
  db.all(
    `SELECT * FROM punicoes 
     WHERE nick = ? 
     ORDER BY 
       CASE status
         WHEN 'Ativo' THEN 1
         WHEN 'Não iniciado' THEN 2
         ELSE 3
       END,
       data DESC, hora DESC`,
    [nick],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Obter estatísticas de punições
app.get('/api/punicoes/stats', (req, res) => {
  db.get(
    'SELECT * FROM punicoes_stats ORDER BY atualizado_em DESC LIMIT 1',
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row || { total: 0, diario: 0, semanal: 0, mensal: 0, anual: 0 });
    }
  );
});

// Adicionar nova punição
app.post('/api/punicoes/add', (req, res) => {
  const { nick, tipo, autor, motivo, termino, status, provas } = req.body;
  
  if (!nick || !tipo || !autor || !termino) {
    return res.status(400).json({ 
      error: 'Nick, tipo, autor e termino são obrigatórios' 
    });
  }
  
  const hoje = new Date().toISOString().split('T')[0];
  const horaAtual = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  db.run(
    `INSERT INTO punicoes 
     (nick, tipo, autor, motivo, termino, status, hora, data, provas)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nick, 
      tipo, 
      autor, 
      motivo || null, 
      termino,
      status || 'Ativo',
      horaAtual, 
      hoje, 
      provas || null
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Atualizar estatísticas
      updatePunicoesStats();
      
      res.json({
        id: this.lastID,
        nick,
        tipo,
        autor,
        motivo,
        termino,
        status: status || 'Ativo',
        hora: horaAtual,
        data: hoje,
        provas
      });
    }
  );
});

// Atualizar status de uma punição
app.put('api/punicoes/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['Ativo', 'Não iniciado'].includes(status)) {
    return res.status(400).json({ 
      error: 'Status é obrigatório e deve ser "Ativo" ou "Não iniciado"' 
    });
  }
  
  db.run(
    'UPDATE punicoes SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Punição não encontrada' });
      }
      
      // Atualizar estatísticas
      updatePunicoesStats();
      
      res.json({ success: true });
    }
  );
});

// Atualizar término de uma punição
app.put('api/punicoes/:id/termino', (req, res) => {
  const { id } = req.params;
  const { termino } = req.body;
  
  if (!termino) {
    return res.status(400).json({ error: 'Termino é obrigatório' });
  }
  
  db.run(
    'UPDATE punicoes SET termino = ? WHERE id = ?',
    [termino, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Punição não encontrada' });
      }
      
      res.json({ success: true });
    }
  );
});

// Verificar status de punição por nick
app.get('api/punicoes/verificar/:nick', (req, res) => {
  const { nick } = req.params;
  
  db.all(
    `SELECT * FROM punicoes 
     WHERE nick = ? AND status = 'Ativo'
     ORDER BY 
       CASE tipo 
         WHEN 'banido' THEN 1 
         WHEN 'silenciado' THEN 2 
         ELSE 3 
       END, 
       data DESC, hora DESC
     LIMIT 1`,
    [nick],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (row.length === 0) {
        return res.json({ punido: false });
      }
      
      res.json({
        punido: true,
        punicao: row[0]
      });
    }
  );
});

// Obter todos os membros da equipe
app.get("/api/team", (req, res) => {
  db.all("SELECT * FROM team_members ORDER BY data_criacao", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obter todas as categorias do fórum com contagens reais
app.get("/api/forum/categories", (req, res) => {
  const { type } = req.query;
  
  db.all(`
    SELECT 
      fc.id,
      fc.name,
      fc.description,
      fc.type,
      fc.created_at,
      COUNT(DISTINCT rt.id) as threads,
      SUM(rt.replies + 1) as posts  
    FROM forum_categories fc
    LEFT JOIN recent_topics rt ON fc.name = rt.category
    ${type ? 'WHERE fc.type = ?' : ''}
    GROUP BY fc.id, fc.name, fc.description, fc.type, fc.created_at
    ORDER BY fc.name
  `, type ? [type] : [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Garantir que pelo menos mostre 0 se não houver tópicos
    const result = rows.map(row => ({
      ...row,
      threads: row.threads || 0,
      posts: row.posts || 0
    }));
    
    res.json(result);
  });
});
// Atualize a rota de tópicos recentes para ordenar corretamente
app.get("/api/forum/recent-topics", (req, res) => {
  const { limit } = req.query;
  
  const query = `
    SELECT 
      rt.id,
      rt.avatar,
      rt.title,
      rt.category,
      rt.views,
      COUNT(tr.id) as replies,
      MAX(tr.created_at) as last_reply_time,
      (
        SELECT tr.author 
        FROM topic_replies tr 
        WHERE tr.topic_id = rt.id 
        ORDER BY tr.created_at DESC 
        LIMIT 1
      ) as last_reply_user,
      rt.created_at
    FROM recent_topics rt
    LEFT JOIN topic_replies tr ON tr.topic_id = rt.id
    GROUP BY rt.id
    ORDER BY (rt.views * 0.5 + COUNT(tr.id) * 0.5) DESC, rt.created_at DESC
    ${limit ? 'LIMIT ?' : ''}
  `;
  
  db.all(query, limit ? [parseInt(limit)] : [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const topics = rows.map(topic => ({
      ...topic,
      replies: topic.replies || 0,
      views: topic.views || 0,
      last_reply_time: topic.last_reply_time || null,
      last_reply_user: topic.last_reply_user || null
    }));
    
    res.json(topics);
  });
});

// Obter estatísticas do fórum
app.get("/api/forum/stats", (req, res) => {
  db.get("SELECT posts, members, guests FROM forum_stats ORDER BY updated_at DESC LIMIT 1", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { posts: 0, members: 0, guests: 0 });
  });
});

// Obter tópicos por categoria
app.get("/api/forum/topics/:category", (req, res) => {
  const { category } = req.params;
  
  db.all(
    `SELECT 
      rt.id,
      rt.avatar,
      rt.title,
      rt.category,
      rt.views,
      COUNT(tr.id) as replies,
      MAX(tr.created_at) as last_reply_time,
      (
        SELECT tr.author 
        FROM topic_replies tr 
        WHERE tr.topic_id = rt.id 
        ORDER BY tr.created_at DESC 
        LIMIT 1
      ) as last_reply_user,
      strftime('%Y-%m-%d %H:%M:%S', rt.created_at) as created_at,
      strftime('%s', 'now') - strftime('%s', rt.created_at) as seconds_ago
    FROM recent_topics rt
    LEFT JOIN topic_replies tr ON tr.topic_id = rt.id
    WHERE rt.category = ?
    GROUP BY rt.id
    ORDER BY rt.created_at DESC`, 
    [category],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const topics = rows.map(topic => ({
        ...topic,
        replies: topic.replies || 0,
        views: topic.views || 0,
        last_reply_time: topic.last_reply_time || null,
        last_reply_user: topic.last_reply_user || null,
        relative_time: formatRelativeTime(topic.seconds_ago)
      }));
      
      res.json(topics);
    }
  );
});

// Obter detalhes de um tópico específico por ID
app.get("/api/forum/topic/:id", (req, res) => {
    const { id } = req.params;
    
    db.get(`
      SELECT 
        rt.id,
        rt.title as titulo,
        rt.avatar,
        rt.category as categoria,
        rt.views as visualizacoes,
        rt.created_at,
        tm.name as autor,
        tm.role as autor_cargo,
        (SELECT COUNT(*) FROM topic_replies WHERE topic_id = rt.id) as respostas,
        tc.content as conteudo,
        (SELECT COUNT(*) FROM recent_topics WHERE avatar = rt.avatar) as posts_autor
      FROM recent_topics rt
      LEFT JOIN team_members tm ON rt.avatar LIKE '%' || tm.name || '%'
      LEFT JOIN topic_content tc ON tc.topic_id = rt.id
      WHERE rt.id = ?
    `, [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!row) {
        res.status(404).json({ error: "Tópico não encontrado" });
        return;
      }
      
      // Formatar a resposta
      const response = {
        id: row.id,
        titulo: row.titulo,
        avatar: row.avatar,
        categoria: row.categoria,
        visualizacoes: row.visualizacoes || 0,
        autor: row.autor || 'Anônimo',
        autor_cargo: row.autor_cargo || 'Membro',
        respostas: row.respostas || 0,
        content: row.conteudo || 'Conteúdo não disponível',
        posts_autor: row.posts_autor || 0,
        criado_em: row.created_at,
        link: `boom.me/${row.titulo.toLowerCase().replace(/\s+/g, '-')}`
      };
      
      res.json(response);
    });
  });
// Registrar visualização de tópico
app.post('/api/forum/topic/:id/view', (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE recent_topics SET views = views + 1 WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});
// Criar um novo tópico (versão simplificada)
// Criar um novo tópico (versão corrigida)
app.post("/api/forum/topics", (req, res) => {
  const { title, category, content } = req.body;
  
  // Validação básica
  if (!title || !category || !content) {
    return res.status(400).json({ error: "Título, categoria e conteúdo são obrigatórios" });
  }

  // Simular um avatar (substitua por lógica real de autenticação)
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent('Usuário')}&background=random`;

  db.serialize(() => {
    // Primeiro, inserir o tópico na tabela recent_topics
    db.run(
      "INSERT INTO recent_topics (avatar, title, category) VALUES (?, ?, ?)",
      [avatar, title, category],
      function(err) {
        if (err) {
          console.error("Erro ao inserir tópico:", err);
          return res.status(500).json({ error: "Erro ao criar tópico" });
        }
        
        const topicId = this.lastID;
        
        // Depois, inserir o conteúdo na tabela topic_content
        db.run(
          "INSERT INTO topic_content (topic_id, content) VALUES (?, ?)",
          [topicId, content],
          function(err) {
            if (err) {
              console.error("Erro ao inserir conteúdo:", err);
              return res.status(500).json({ error: "Erro ao salvar conteúdo do tópico" });
            }
            
            // Atualizar estatísticas do fórum
            db.run(
              "UPDATE forum_stats SET posts = posts + 1, updated_at = CURRENT_TIMESTAMP",
              function(err) {
                if (err) {
                  console.error("Erro ao atualizar estatísticas:", err);
                }
                
                // Retornar o tópico criado
                res.json({
                  id: topicId,
                  title,
                  category,
                  content,
                  avatar,
                  views: 0,
                  created_at: new Date().toISOString(),
                  replies: 0
                });
              }
            );
          }
        );
      }
    );
  });
});
// Obter respostas de um tópico
app.get("/api/forum/topic/:id/replies", (req, res) => {
  const { id } = req.params;
  
  db.all(`
    SELECT 
      tr.id,
      tr.author,
      tr.content,
      tr.created_at,
      tm.role as author_role,
      tm.avatar as author_avatar
    FROM topic_replies tr
    LEFT JOIN team_members tm ON tr.author = tm.name
    WHERE tr.topic_id = ?
    ORDER BY tr.created_at ASC
  `, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const replies = rows.map(reply => ({
      id: reply.id,
      author: reply.author || 'Anônimo',
      author_role: reply.author_role || 'Membro',
      author_avatar: reply.author_avatar || 'https://ui-avatars.com/api/?name=Usuario&background=random',
      content: reply.content,
      created_at: reply.created_at
    }));
    
    res.json(replies);
  });
});

app.post("/api/forum/topic/:id/reply", async (req, res) => {
  const { id } = req.params;
  const { author, content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: "Conteúdo da resposta é obrigatório" });
  }

  try {
    // Gerar avatar padrão se não existir
    const authorName = author || 'Usuário';
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

    // Inserir com avatar
    const replyId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO topic_replies (topic_id, author, avatar, content) VALUES (?, ?, ?, ?)",
        [id, authorName, avatar, content],
        function(err) {
          if (err) {
            console.error("Erro detalhado:", err);
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });

    // Atualizar contagem
    db.run("UPDATE recent_topics SET replies = replies + 1 WHERE id = ?", [id]);

    res.json({
      id: replyId,
      topic_id: id,
      author: authorName,
      avatar,
      content,
      created_at: new Date().toISOString()
    });

  } catch (err) {
    console.error("Erro no servidor:", err);
    res.status(500).json({ 
      error: "Erro interno ao processar resposta",
      details: err.message 
    });
  }
});
// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});