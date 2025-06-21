import { db } from '../src/config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = '8448270f4a7672db1af3d41cefc127909b735edad27c8b1b8d4fa6145c27dbaa';

class MembersController {
  // ========== REGISTRO DE MEMBRO ==========
  register = async (req, res) => {
    try {
      const { username, email, password, minecraftNick, avatar } = req.body;
      
      if (!username || !email || !password || !minecraftNick) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const avatarUrl = avatar || `https://cravatar.eu/helmavatar/${encodeURIComponent(username)}/190.png`;
      
      db.run(
        `INSERT INTO membros 
         (username, email, password, minecraft_nick, avatar, data_criacao) 
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [username, email, hashedPassword, minecraftNick, avatarUrl],
        function(err) {
          if (err) {
            console.error('Erro no registro:', err);
            return res.status(400).json({ 
              error: err.message.includes('UNIQUE') ? 
                'Nome de usuário ou email já existe' : 
                'Erro ao registrar usuário' 
            });
          }
          
          res.status(201).json({ 
            success: true,
            message: 'Usuário registrado com sucesso',
            userId: this.lastID,
            user: {
              username,
              email,
              minecraftNick,
              avatar: avatarUrl,
              created_at: new Date()
            }
          });
        }
      );
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

  // ========== LOGIN DE MEMBRO ==========
  login = async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
      }
      
      db.get(
        `SELECT * FROM membros WHERE username = ? OR email = ?`,
        [username, username],
        async (err, user) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
          }
          
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return res.status(401).json({ error: 'Senha incorreta' });
          }
          
          // Atualizar último login
          db.run(
            `UPDATE membros SET last_login = datetime('now') WHERE id = ?`,
            [user.id]
          );
          
          // Gerar token JWT
          const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '24h' }
          );
          
          // Remover senha antes de enviar
          const { password: _, ...userWithoutPassword } = user;
          
          res.json({
            success: true,
            message: 'Login bem-sucedido',
            token,
            user: userWithoutPassword
          });
        }
      );
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

  // ========== OBTER PERFIL DO MEMBRO ==========
  getProfile = async (req, res) => {
    try {
      const { id } = req.user; // Assume que o middleware de autenticação adiciona o user à requisição
      
      db.get(`SELECT * FROM membros WHERE id = ?`, [id], (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Remover senha antes de enviar
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }


// ========== SEGUIR/DEIXAR DE SEGUIR USUÁRIO ==========
// ========== SEGUIR/DEIXAR DE SEGUIR USUÁRIO ==========
// ========== SEGUIR/DEIXAR DE SEGUIR USUÁRIO ==========
// ========== SEGUIR/DEIXAR DE SEGUIR USUÁRIO ==========
followUser = async (req, res) => {
  try {
    const { nickname } = req.params;
    const followerId = req.user.id;

    // 1. Verificar se o usuário alvo existe
    db.get(`SELECT id, username, seguidores FROM membros WHERE username = ?`, [nickname], (err, targetUser) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ error: 'Erro no servidor' });
      }
      
      if (!targetUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // 2. Obter dados do seguidor
      db.get(`SELECT seguindo FROM membros WHERE id = ?`, [followerId], (err, follower) => {
        if (err) {
          console.error('Erro ao buscar seguidor:', err);
          return res.status(500).json({ error: 'Erro no servidor' });
        }

        // Tratamento seguro para o campo seguindo
        let followingList = [];
        if (follower.seguindo) {
          if (typeof follower.seguindo === 'string') {
            followingList = follower.seguindo.split(',').filter(id => id.trim() !== '');
          } else if (Array.isArray(follower.seguindo)) {
            followingList = follower.seguindo;
          }
        }

        const isFollowing = followingList.includes(targetUser.id.toString());

        if (isFollowing) {
          // 3. Remover o follow
          const updatedFollowing = followingList.filter(id => id !== targetUser.id.toString()).join(',');

          // Atualizar o seguidor (lista de seguindo)
          db.run(`UPDATE membros SET seguindo = ? WHERE id = ?`, 
            [updatedFollowing || '', followerId], // Garante string vazia se for null
            (err) => {
              if (err) {
                console.error('Erro ao atualizar seguindo:', err);
                return res.status(500).json({ error: 'Erro no servidor' });
              }

              // Atualizar o alvo (contador de seguidores)
              db.run(`UPDATE membros SET seguidores = seguidores - 1 WHERE id = ?`, 
                [targetUser.id], 
                (err) => {
                  if (err) {
                    console.error('Erro ao atualizar seguidores:', err);
                    return res.status(500).json({ error: 'Erro no servidor' });
                  }

                  res.json({ 
                    success: true, 
                    following: false, 
                    followers: targetUser.seguidores - 1 
                  });
                });
            });
        } else {
          // 4. Adicionar follow
          const updatedFollowing = [...followingList, targetUser.id.toString()].join(',');

          // Atualizar o seguidor (lista de seguindo)
          db.run(`UPDATE membros SET seguindo = ? WHERE id = ?`, 
            [updatedFollowing, followerId], 
            (err) => {
              if (err) {
                console.error('Erro ao atualizar seguindo:', err);
                return res.status(500).json({ error: 'Erro no servidor' });
              }

              // Atualizar o alvo (contador de seguidores)
              db.run(`UPDATE membros SET seguidores = seguidores + 1 WHERE id = ?`, 
                [targetUser.id], 
                (err) => {
                  if (err) {
                    console.error('Erro ao atualizar seguidores:', err);
                    return res.status(500).json({ error: 'Erro no servidor' });
                  }

                  res.json({ 
                    success: true, 
                    following: true, 
                    followers: targetUser.seguidores + 1 
                  });
                });
            });
        }
      });
    });
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}

// ========== VERIFICAR SE JÁ ESTÁ SEGUINDO ==========
checkFollow = async (req, res) => {
  try {
    const { nickname } = req.params;
    const followerId = req.user.id;

    // 1. Buscar ID do usuário alvo
    db.get(`SELECT id FROM membros WHERE username = ?`, [nickname], (err, targetUser) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ error: 'Erro no servidor' });
      }
      
      if (!targetUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // 2. Buscar lista de seguindo do seguidor
      db.get(`SELECT seguindo FROM membros WHERE id = ?`, [followerId], (err, follower) => {
        if (err) {
          console.error('Erro ao buscar seguidor:', err);
          return res.status(500).json({ error: 'Erro no servidor' });
        }

        // Tratamento seguro para o campo seguindo
        let followingList = [];
        if (follower.seguindo) {
          if (typeof follower.seguindo === 'string') {
            followingList = follower.seguindo.split(',').filter(id => id.trim() !== '');
          } else if (Array.isArray(follower.seguindo)) {
            followingList = follower.seguindo;
          }
        }

        const isFollowing = followingList.includes(targetUser.id.toString());

        res.json({ 
          success: true, 
          following: isFollowing 
        });
      });
    });
  } catch (error) {
    console.error('Erro ao verificar follow:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}

// ========== VER SEGUIDORES DO USUÁRIO ==========
viewFollowers = async (req, res) => {
  try {
    const { nickname } = req.params;

    // 1. Verificar se o usuário existe
    db.get(`SELECT id FROM membros WHERE username = ?`, [nickname], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // 2. Obter contagem de seguidores
      db.get(`SELECT seguidores FROM membros WHERE id = ?`, [user.id], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // 3. Obter lista de seguidores (opcional)
        db.all(`SELECT seguidor_id, seguidor_username FROM seguidores WHERE seguindo_id = ?`, 
          [user.id], (err, followers) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            res.json({ 
              success: true, 
              followersCount: result.seguidores || 0,
              followersList: followers || []
            });
          });
      });
    });
  } catch (error) {
    console.error('Erro ao visualizar seguidores:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}





// In your ForumController.js
countUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        
        db.get(
            `SELECT COUNT(*) as postCount FROM topic_replies WHERE author = ?`,
            [username],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                res.json({
                    username,
                    postCount: result.postCount || 0
                });
            }
        );
    } catch (error) {
        console.error('Erro ao contar posts do usuário:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

  // ========== LISTAR TODOS OS MEMBROS ==========
  getAllMembers = async (req, res) => {
    const { username } = req.query;
    
    let query = "SELECT id, username, email, role, avatar, data_criacao, minecraft_nick FROM membros";
    const params = [];
    
    if (username) {
      query += " WHERE username = ?";
      params.push(username);
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erro ao buscar membros:', err);
        return res.status(500).json({ error: 'Erro interno no servidor' });
      }
      
      if (username) {
        res.json(rows.length > 0 ? rows[0] : null);
      } else {
        res.json(rows);
      }
    });
  }

  // ========== OBTER MEMBRO POR USERNAME ==========
 getMemberByUsername = async (req, res) => {
  try {
    const username = decodeURIComponent(req.params.username);
    
    if (!username || username.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'Username é obrigatório' 
      });
    }

    const sql = `
      SELECT 
        id, 
        username, 
        email, 
        role, 
        avatar, 
        data_criacao as created_at,
        minecraft_nick,
        0 as post_count,  -- Valor padrão
        0 as likes_received,  -- Valor padrão
        last_login
      FROM membros 
      WHERE username = ?
    `;
    
    db.get(sql, [username], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Erro ao buscar membro',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      if (!row) {
        return res.status(404).json({ 
          success: false,
          error: 'Membro não encontrado' 
        });
      }

      const memberData = {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        avatar: row.avatar || `https://cravatar.eu/helmavatar/${encodeURIComponent(row.minecraft_nick || row.username)}/190.png`,
        created_at: row.created_at,
        minecraft_nick: row.minecraft_nick,
        post_count: row.post_count,
        likes_received: row.likes_received,
        last_login: row.last_login
      };

      res.json({
        success: true,
        member: memberData
      });
    });
    
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno no servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

  // ========== ESTATÍSTICAS DE MEMBROS ==========
  getMembersStats = async (req, res) => {
    const query = "SELECT COUNT(id) as total_members FROM membros";
    
    db.get(query, [], (err, row) => {
      if (err) {
        console.error('Erro ao contar membros:', err);
        return res.status(500).json({ error: 'Erro interno no servidor' });
      }
      
      res.json({
        total_members: row.total_members || 0
      });
    });
  }

  // ========== MEMBROS ONLINE ==========
 getOnlineMembers = async (req, res) => {
  const onlineThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const queryCount = `
    SELECT 
      COUNT(id) as online_count,
      (SELECT COUNT(id) FROM membros) as total_members
    FROM membros 
    WHERE last_login > ?
  `;

  const queryNames = `
    SELECT username
    FROM membros
    WHERE last_login > ?
    ORDER BY username
  `;

  db.get(queryCount, [onlineThreshold], (err, rowCount) => {
    if (err) {
      console.error('Erro no queryCount:', err);
      return res.status(500).json({
        error: 'Erro interno no servidor (queryCount)',
        online_members: [],
        total_members: 0,
        online_count: 0
      });
    }

    if (!rowCount) {
      console.error('rowCount é undefined ou null');
      return res.status(500).json({
        error: 'Nenhum dado retornado no count',
        online_members: [],
        total_members: 0,
        online_count: 0
      });
    }

    db.all(queryNames, [onlineThreshold], (err, rows) => {
      if (err) {
        console.error('Erro no queryNames:', err);
        return res.status(500).json({
          error: 'Erro interno no servidor (queryNames)',
          online_members: [],
          total_members: rowCount.total_members || 0,
          online_count: rowCount.online_count || 0
        });
      }

      const onlineMembers = rows.map(r => r.username);

      res.json({
        online_members: onlineMembers,
        total_members: rowCount.total_members || 0,
        online_count: rowCount.online_count || 0,
        last_updated: new Date().toISOString()
      });
    });
  });
}


  // ========== LISTA DETALHADA DE MEMBROS ONLINE ==========
  getDetailedOnlineMembers = async (req, res) => {
    const onlineThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const query = `
      SELECT 
        id, username, avatar, role, 
        last_login, minecraft_nick
      FROM membros 
      WHERE last_login > ?
      ORDER BY username ASC
    `;
    
    db.all(query, [onlineThreshold], (err, rows) => {
      if (err) {
        console.error('Erro ao listar membros online:', err);
        return res.status(500).json({ 
          error: 'Erro interno no servidor',
          members: []
        });
      }
      
      // Consulta para estatísticas totais
      db.get("SELECT COUNT(id) as total FROM membros", [], (err, countRow) => {
        const totalMembers = countRow?.total || 0;
        
        res.json({
          members: rows || [],
          online_count: rows.length,
          total_members: totalMembers,
          last_updated: new Date().toISOString()
        });
      });
    });
  }

  // ========== ATUALIZAR PERFIL ==========
  updateProfile = async (req, res) => {
    try {
      const { id } = req.user;
      const { minecraftNick, assinatura } = req.body;
      
      if (!minecraftNick && !assinatura) {
        return res.status(400).json({ error: "Nenhum dado válido para atualização" });
      }

      const fields = [];
      const values = [];
      
      if (minecraftNick) {
        fields.push("minecraft_nick = ?");
        values.push(minecraftNick);
        
        // Atualizar avatar se o nick do Minecraft mudar
        fields.push("avatar = ?");
        values.push(`https://cravatar.eu/helmavatar/${encodeURIComponent(minecraftNick)}/190.png`);
      }
      
      if (assinatura) {
        fields.push("assinatura = ?");
        values.push(assinatura);
      }
      
      values.push(id);
      
      db.run(
        `UPDATE membros SET ${fields.join(", ")} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            console.error('Erro ao atualizar perfil:', err);
            return res.status(500).json({ error: 'Erro ao atualizar perfil' });
          }
          
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
          }
          
          // Retornar os dados atualizados
          db.get(
            `SELECT id, username, email, role, avatar, minecraft_nick, assinatura 
             FROM membros WHERE id = ?`,
            [id],
            (err, user) => {
              if (err) {
                return res.status(500).json({ error: 'Erro ao buscar dados atualizados' });
              }
              res.json({
                success: true,
                user
              });
            }
          );
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
}

export default new MembersController();