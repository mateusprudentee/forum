import sqlite3 from 'sqlite3';
const { Database } = sqlite3.verbose();

class Punishment {
  constructor() {
    this.db = new Database("./forum.db");
  }

  // Criar nova punição
  async create(nick, tipo, autor, motivo, termino, status, provas) {
    const hoje = new Date().toISOString().split('T')[0];
    const horaAtual = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    return new Promise((resolve, reject) => {
      this.db.run(
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
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  // Listar punições com filtros
  async list(limit, page, tipo, status, autor) {
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
    
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Atualizar status de punição
  async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE punicoes SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Verificar punições ativas por nick
  async checkActive(nick) {
    return new Promise((resolve, reject) => {
      this.db.all(
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
          if (err) reject(err);
          else resolve(row.length > 0 ? row[0] : null);
        }
      );
    });
  }

  // Atualizar estatísticas
  async updateStats() {
    const hoje = new Date().toISOString().split('T')[0];
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

    // Contagens
    const counts = {
      diario: await this.countPunicoes(`data = '${hoje}'`),
      semanal: await this.countPunicoes(`data >= '${umaSemanaAtras.toISOString().split('T')[0]}'`),
      mensal: await this.countPunicoes(`data >= '${umMesAtras.toISOString().split('T')[0]}'`),
      anual: await this.countPunicoes(`data >= '${umAnoAtras.toISOString().split('T')[0]}'`),
      total: await this.countPunicoes('1=1')
    };

    // Atualizar no banco
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE punicoes_stats 
         SET 
           total = ?,
           diario = ?,
           semanal = ?,
           mensal = ?,
           anual = ?,
           atualizado_em = CURRENT_TIMESTAMP`,
        [counts.total, counts.diario, counts.semanal, counts.mensal, counts.anual],
        function(err) {
          if (err) reject(err);
          else resolve(counts);
        }
      );
    });
  }

  // Método auxiliar para contar punições
  countPunicoes(whereClause) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) as count FROM punicoes WHERE ${whereClause}`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }
}

export default new Punishment();