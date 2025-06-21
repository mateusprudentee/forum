import { db } from '../src/config/database.js';

class ForumController {
  // ========== CATEGORIAS ==========
  static async getCategories(req, res) {
    const { type } = req.query;
    
    // Query base
    let sql = `
      SELECT 
        fc.id,
        fc.name,
        fc.description,
        fc.type,
        fc.created_at,
        COUNT(DISTINCT rt.id) as threads,
        COUNT(rt.id) as posts
      FROM forum_categories fc
      LEFT JOIN recent_topics rt ON fc.name = rt.category
    `;
    
    // Adiciona WHERE condicionalmente
    if (type) {
      sql += ' WHERE fc.type = ?';
    }
    
    // Finaliza a query
    sql += `
      GROUP BY fc.id, fc.name, fc.description, fc.type, fc.created_at
      ORDER BY fc.name
    `;
    
    // Parâmetros para a query
    const params = type ? [type] : [];
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const result = rows.map(row => ({
        ...row,
        threads: row.threads || 0,
        posts: row.posts || 0
      }));
      
      res.json(result);
    });
  }

  // ========== TÓPICOS RECENTES ==========
  static async getRecentTopics(req, res) {
    const { limit } = req.query;
    
    const query = `
      SELECT 
        rt.id,
        rt.avatar,
        rt.title,
        rt.category,
        rt.views,
        rt.author,
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
        return res.status(500).json({ error: err.message });
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
  }

  // ========== TÓPICOS POR CATEGORIA ==========
static async getTopicsByCategory(req, res) {
  const { category } = req.params;

  // Se não tem subcategorias, já vai direto buscar os tópicos
  db.all(
    `SELECT 
      rt.id,
      rt.avatar,
      rt.title,
      rt.category,
      rt.views,
      rt.fixado,
      rt.trancado,
      rt.author,
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
    ORDER BY rt.fixado DESC, rt.created_at DESC`, 
    [category],
    (err, topics) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const formatRelativeTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
        if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'agora mesmo';
      };

      const formattedTopics = topics.map(topic => ({
        ...topic,
        replies: topic.replies || 0,
        views: topic.views || 0,
        last_reply_time: topic.last_reply_time || null,
        last_reply_user: topic.last_reply_user || null,
        relative_time: formatRelativeTime(topic.seconds_ago),
        author: topic.author || 'Anônimo'
      }));

      res.json({
        category,
        subcategories: [],  // retorna vazio pois não tem subcategorias
        topics: formattedTopics
      });
    }
  );
}

static async getSubcategories(req, res) {
  try {
    const subcategories = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          fc.id, 
          fc.name, 
          fc.subcategoria,
          COUNT(DISTINCT rt.id) as discussions_count,
          COUNT(DISTINCT tr.id) as messages_count
        FROM forum_categories fc
        LEFT JOIN recent_topics rt ON LOWER(rt.category) = LOWER(fc.name)
        LEFT JOIN topic_replies tr ON tr.topic_id = rt.id
        WHERE fc.subcategoria != 'nao'
        GROUP BY fc.id, fc.name, fc.subcategoria
        ORDER BY fc.name`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const result = subcategories.map(row => ({
      id: row.id,
      name: row.name,
      subcategoria: row.subcategoria,
      discussions_count: row.discussions_count || 0,
      messages_count: row.messages_count || 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar subcategorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// No seu controller do fórum
static async checkCategoryHasSubcategories(req, res) {
  const { category } = req.params;

  try {
    const count = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM forum_categories 
         WHERE LOWER(name) = LOWER(?) AND subcategoria != 'nao'`,
        [category],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });

    res.json({ hasSubcategories: count > 0 });
  } catch (error) {
    console.error('Erro ao verificar subcategorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


static async getTopicsByCategoryAndSubcategory(req, res) {
  const { category, subcategory } = req.params;

  try {
    // Converter o slug da URL para o formato do banco (case-insensitive e com tratamento de acentos)
    const formattedSubcategory = subcategory
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/analise/gi, 'análise') // Corrige acentuação
      .replace(/resolvido/gi, 'resolvido'); // Adiciona outros casos conforme necessário

    // Buscar a combinação exata no banco (case-insensitive)
    const categoryData = await new Promise((resolve, reject) => {
      db.get(
        `SELECT name, subcategoria FROM forum_categories 
         WHERE LOWER(name) = LOWER(?) 
         AND LOWER(REPLACE(REPLACE(subcategoria, 'á', 'a'), 'é', 'e')) = LOWER(REPLACE(REPLACE(?, 'á', 'a'), 'é', 'e'))
         AND subcategoria != 'nao'`,
        [category, formattedSubcategory],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!categoryData) {
      // Debug: Listar subcategorias disponíveis
      const availableSubs = await new Promise((resolve, reject) => {
        db.all(
          `SELECT subcategoria FROM forum_categories 
           WHERE LOWER(name) = LOWER(?) AND subcategoria != 'nao'`,
          [category],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => r.subcategoria));
          }
        );
      });

      return res.status(404).json({ 
        error: 'Subcategoria não encontrada para esta categoria',
        details: {
          categoria_solicitada: category,
          subcategoria_solicitada: subcategory,
          subcategoria_formatada: formattedSubcategory,
          subcategorias_disponiveis: availableSubs
        }
      });
    }

    // Buscar tópicos usando os valores EXATOS do banco
    const topics = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          rt.id,
          rt.avatar,
          rt.title,
          rt.category,
          rt.views,
          rt.fixado,
          rt.trancado,
          rt.author,
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
        WHERE LOWER(rt.category) = LOWER(?)
          AND EXISTS (
            SELECT 1 FROM forum_categories fc
            WHERE LOWER(fc.name) = LOWER(rt.category)
              AND fc.subcategoria = ?
          )
        GROUP BY rt.id
        ORDER BY rt.fixado DESC, rt.created_at DESC`,
        [categoryData.name, categoryData.subcategoria],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Formatar a resposta
    const formatRelativeTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
      if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
      if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      return 'agora mesmo';
    };
    
    const formattedTopics = topics.map(topic => ({
      ...topic,
      replies: topic.replies || 0,
      views: topic.views || 0,
      last_reply_time: topic.last_reply_time || null,
      last_reply_user: topic.last_reply_user || null,
      relative_time: formatRelativeTime(topic.seconds_ago),
      author: topic.author || 'Anônimo',
      subcategory: categoryData.subcategoria // Adiciona a subcategoria ao tópico
    }));
    
    return res.json({
      category: categoryData.name,
      subcategory: categoryData.subcategoria,
      topics: formattedTopics
    });

  } catch (error) {
    console.error('Erro ao buscar tópicos:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
}










  // ========== DETALHES DO TÓPICO ==========
  // ========== DETALHES DO TÓPICO ==========
static async getTopicDetails(req, res) {
  const { id } = req.params;
  
  db.get(`
    SELECT 
      rt.id,
      rt.title as titulo,
      rt.avatar,
      rt.category as categoria,
      rt.views as visualizacoes,
      rt.created_at,
      rt.trancado,
      rt.author as autor,  -- Usando a coluna author diretamente
      (SELECT role FROM team_members WHERE name = rt.author) as autor_cargo,
      (SELECT COUNT(*) FROM topic_replies WHERE topic_id = rt.id) as respostas,
      tc.content as conteudo,
      (SELECT COUNT(*) FROM recent_topics WHERE author = rt.author) as posts_autor
    FROM recent_topics rt
    LEFT JOIN topic_content tc ON tc.topic_id = rt.id
    WHERE rt.id = ?
  `, [id], (err, row) => {
    if (err) {
      console.error('Erro no banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao buscar tópico' });
    }
    
    if (!row) {
      return res.status(404).json({ error: "Tópico não encontrado" });
    }
    
    // Formata a resposta
    const response = {
      id: row.id,
      titulo: row.titulo,
      avatar: row.avatar || `https://cravatar.eu/helmavatar/${encodeURIComponent(row.autor || 'default')}/190.png`,
      categoria: row.categoria,
      visualizacoes: row.visualizacoes || 0,
      autor: row.autor || 'Anônimo',  // Fallback apenas se realmente não houver autor
      autor_cargo: row.autor_cargo || 'Membro',
      respostas: row.respostas || 0,
      content: row.conteudo,
      posts_autor: row.posts_autor || 0,
      criado_em: row.created_at,
      trancado: row.trancado === 'sim' ? 'sim' : 'não'
    };
    
    res.json(response);
  });
}

  // ========== RESPOSTAS DO TÓPICO ==========
  static async getTopicReply(req, res) {
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
}

 static async getTopicReplies(req, res) {
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

}


static async getAllTeamMembers(req, res) {
  // Seleciona os campos necessários da tabela membros para usuários com team_members = 'sim'
  const selectSql = `
    SELECT id, username AS name, role, avatar, data_criacao
    FROM membros
    WHERE team_members = 'sim'
  `;

  db.all(selectSql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (rows.length === 0) {
      // Sem usuários com team_members = 'sim'
      res.json([]);
      return;
    }

    // Inserir esses usuários na tabela team_members, ignorando duplicatas pelo id
    db.serialize(() => {
      const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO team_members (id, name, role, avatar, data_criacao)
        VALUES (?, ?, ?, ?, ?)
      `);

      rows.forEach(user => {
        insertStmt.run(user.id, user.name, user.role, user.avatar, user.data_criacao);
      });

      insertStmt.finalize(err => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Buscar todos os registros da tabela team_members e enviar resposta
        db.all("SELECT * FROM team_members", (err, teamRows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(teamRows);
        });
      });
    });
  });
}


// ========== CRIAR TÓPICO ==========
static async createTopic(req, res) {
  try {
    const { title, category, content, author } = req.body;

    // Validação dos campos
    if (!title || !category || !content || !author) {
      return res.status(400).json({ 
        success: false,
        error: "Todos os campos são obrigatórios (título, categoria, conteúdo e autor)" 
      });
    }
    
    // Gera o avatar com o nickname do autor
    const avatar = `https://cravatar.eu/helmavatar/${encodeURIComponent(author)}/190.png`;

    db.serialize(() => {
      db.run(
        "INSERT INTO recent_topics (avatar, title, category, author) VALUES (?, ?, ?, ?)",
        [avatar, title, category, author],
        function(err) {
          if (err) {
            console.error("Erro ao inserir tópico:", err);
            return res.status(500).json({ 
              success: false,
              error: "Erro ao criar tópico no banco de dados" 
            });
          }
          
          const topicId = this.lastID;
          
          db.run(
            "INSERT INTO topic_content (topic_id, content) VALUES (?, ?)",
            [topicId, content],
            function(err) {
              if (err) {
                console.error("Erro ao inserir conteúdo:", err);
                return res.status(500).json({ 
                  success: false,
                  error: "Erro ao salvar conteúdo do tópico" 
                });
              }
              
              // Atualiza estatísticas do fórum
              db.run(
                "UPDATE forum_stats SET posts = posts + 1, updated_at = CURRENT_TIMESTAMP",
                function(err) {
                  if (err) {
                    console.error("Erro ao atualizar estatísticas:", err);
                    // Não retornamos erro aqui pois não é crítico
                  }
                  
                  // Retorna o tópico criado com sucesso
                  res.json({
                    success: true,
                    topic: {
                      id: topicId,
                      title,
                      category,
                      content,
                      avatar,
                      author,
                      views: 0,
                      created_at: new Date().toISOString(),
                      replies: 0
                    }
                  });
                }
              );
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro interno no servidor" 
    });
  }
}

// ========== ADICIONAR RESPOSTA ==========
static async addReply(req, res) {
  const { id } = req.params;
  const { author, content } = req.body;
  
  if (!content) {
    return res.status(400).json({ 
      success: false,
      error: "Conteúdo da resposta é obrigatório" 
    });
  }

  // Usa o mesmo padrão de avatar dos tópicos
  const avatar = `https://cravatar.eu/helmavatar/${encodeURIComponent(author || 'Usuario')}/190.png`;

  db.serialize(() => {
    db.run(
      "INSERT INTO topic_replies (topic_id, author, avatar, content) VALUES (?, ?, ?, ?)",
      [id, author || 'Usuário', avatar, content],
      function(err) {
        if (err) {
          console.error("Erro ao adicionar resposta:", err);
          return res.status(500).json({ 
            success: false,
            error: "Erro ao salvar resposta",
            details: err.message 
          });
        }

        // Atualiza contador de respostas
        db.run(
          "UPDATE recent_topics SET replies = replies + 1 WHERE id = ?", 
          [id],
          function(updateErr) {
            if (updateErr) {
              console.error("Erro ao atualizar contador:", updateErr);
            }
            
            // Retorna a resposta criada
            res.json({
              success: true,
              reply: {
                id: this.lastID,
                topic_id: id,
                author: author || 'Usuário',
                avatar,
                content,
                created_at: new Date().toISOString(),
                author_posts: 0, // Será atualizado no frontend se necessário
                author_likes: 0
              }
            });
          }
        );
      }
    );
  });
}

  // ========== REGISTRAR VISUALIZAÇÃO ==========
  static async registerView(req, res) {
    const { id } = req.params;
    
    db.run(
      'UPDATE recent_topics SET views = views + 1 WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
      }
    );
  }

  // ========== DELETAR TÓPICO ==========
  static async deleteTopic(req, res) {
    const { id } = req.params;

    db.get('SELECT id FROM recent_topics WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({ error: 'Tópico não encontrado' });
      }

      db.serialize(() => {
        db.run('DELETE FROM topic_replies WHERE topic_id = ?', [id], function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          db.run('DELETE FROM topic_content WHERE topic_id = ?', [id], function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            db.run('DELETE FROM recent_topics WHERE id = ?', [id], function(err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              db.run(
                'UPDATE forum_stats SET posts = (SELECT COUNT(*) FROM topic_replies) + (SELECT COUNT(*) FROM recent_topics)',
                function(err) {
                  if (err) console.error('Erro ao atualizar estatísticas:', err);

                  res.json({ 
                    success: true,
                    message: 'Tópico e conteúdo associado deletados com sucesso',
                    changes: this.changes
                  });
                }
              );
            });
          });
        });
      });
    });
  }

  // ========== DELETAR RESPOSTA ==========
  static async deleteReply(req, res) {
    const { id } = req.params;

    db.run(
      `DELETE FROM topic_replies WHERE id = ?`,
      [id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: "Mensagem não encontrada" });
        }
        
        res.json({ success: true });
      }
    );
  }

  // ========== TRAVAR/DESTRAVAR TÓPICO ==========
  static async toggleTopicLock(req, res) {
    const { id } = req.params;
    const { trancado } = req.body;

    if (!['sim', 'não'].includes(trancado)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    db.run(
      `UPDATE recent_topics SET trancado = ? WHERE id = ?`,
      [trancado, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: "Tópico não encontrado" });
        }
        
        res.json({ 
          success: true,
          trancado 
        });
      }
    );
  }

  // ========== ESTATÍSTICAS DO FÓRUM ==========
  static async getForumStats(req, res) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM recent_topics) as topics,
        (SELECT COUNT(*) FROM recent_topics) + 
        (SELECT COALESCE(SUM(replies), 0) FROM (
          SELECT COUNT(*) as replies FROM topic_replies GROUP BY topic_id
        )) as posts,
        0 as members
    `;

    db.get(query, (err, row) => {
      if (err) {
        console.error('Erro ao buscar estatísticas do fórum:', err);
        return res.status(500).json({ error: err.message });
      }
      
      const stats = {
        topics: row?.topics || 0,
        posts: row?.posts || 0,
        members: 0
      };
      
      res.json(stats);
    });
  }

  // ========== TÓPICOS DESTACADOS ==========
  static async getFeaturedTopics(req, res) {
    const { limit } = req.query;
    
    const query = `
      SELECT 
        rt.id,
        rt.avatar,
        rt.title,
        rt.category,
        rt.views,
        rt.featured,
        COUNT(tr.id) as replies,
        MAX(tr.created_at) as last_reply_time,
        (
          SELECT tr.author 
          FROM topic_replies tr 
          WHERE tr.topic_id = rt.id 
          ORDER BY tr.created_at DESC 
          LIMIT 1
        ) as last_reply_user,
        rt.created_at,
        tc.content
      FROM recent_topics rt
      LEFT JOIN topic_replies tr ON tr.topic_id = rt.id
      LEFT JOIN topic_content tc ON tc.topic_id = rt.id
      WHERE rt.featured = 1
      GROUP BY rt.id
      ORDER BY 
        CASE 
          WHEN rt.featured = 1 THEN 0
          ELSE 1
        END,
        (rt.views * 0.5 + COUNT(tr.id) * 0.5) DESC,
        rt.created_at DESC
      ${limit ? 'LIMIT ?' : ''}
    `;
    
    db.all(query, limit ? [parseInt(limit)] : [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const topics = rows.map(topic => ({
        id: topic.id,
        avatar: topic.avatar,
        title: topic.title,
        category: topic.category,
        views: topic.views || 0,
        replies: topic.replies || 0,
        last_reply_time: topic.last_reply_time || null,
        last_reply_user: topic.last_reply_user || null,
        created_at: topic.created_at,
        featured: topic.featured || 0,
        excerpt: topic.content 
          ? topic.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' 
          : 'Sem conteúdo'
      }));
      
      res.json(topics);
    });
  }
}
export default ForumController;
