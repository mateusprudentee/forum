import Punishment from '../models/Punishment.js';

class PunishmentsController {
  // Listar punições
  async list(req, res) {
    try {
      const { limit, page, tipo, status, autor } = req.query;
      const punicoes = await Punishment.list(limit, page, tipo, status, autor);
      res.json(punicoes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTermino (req, res) {
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
  }
  
  // Criar nova punição
  async create(req, res) {
    try {
      const { nick, tipo, autor, motivo, termino, status, provas } = req.body;
      
      if (!nick || !tipo || !autor || !termino) {
        return res.status(400).json({ 
          error: 'Nick, tipo, autor e termino são obrigatórios' 
        });
      }
      
      const id = await Punishment.create(nick, tipo, autor, motivo, termino, status, provas);
      
      // Atualizar estatísticas
      await Punishment.updateStats();
      
      res.json({
        id,
        nick,
        tipo,
        autor,
        motivo,
        termino,
        status: status || 'Ativo'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['Ativo', 'Não iniciado'].includes(status)) {
        return res.status(400).json({ 
          error: 'Status é obrigatório e deve ser "Ativo" ou "Não iniciado"' 
        });
      }
      
      const changes = await Punishment.updateStatus(id, status);
      
      if (changes === 0) {
        return res.status(404).json({ error: 'Punição não encontrada' });
      }
      
      // Atualizar estatísticas
      await Punishment.updateStats();
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verificar punição por nick
  async checkByNick(req, res) {
    try {
      const { nick } = req.params;
      const punicao = await Punishment.checkActive(nick);
      
      if (!punicao) {
        return res.json({ punido: false });
      }
      
      res.json({
        punido: true,
        punicao
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obter estatísticas
  async getStats(req, res) {
    try {
      // Forçar atualização das estatísticas antes de retornar
      await Punishment.updateStats();
      
      // Obter estatísticas atualizadas
      const stats = await Punishment.getCurrentStats();
      
      res.json(stats || { total: 0, diario: 0, semanal: 0, mensal: 0, anual: 0 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new PunishmentsController();