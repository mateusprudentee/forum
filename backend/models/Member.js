import { db } from '../src/config/database.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../src/config/auth.js';

class Member {
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const minecraftNick = userData.minecraftNick || userData.username;
    const avatarUrl = `https://cravatar.eu/helmavatar/${encodeURIComponent(minecraftNick)}/190.png`;
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO membros 
         (username, email, password, minecraft_nick, avatar, data_criacao) 
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [
          userData.username,
          userData.email,
          hashedPassword,
          userData.minecraftNick,
          avatarUrl,
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  static async findByUsernameOrEmail(username) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM membros WHERE username = ? OR email = ?`,
        [username, username],
        (err, user) => {
          if (err) reject(err);
          else resolve(user);
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM membros WHERE id = ?`, [id], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });
  }

  static async updateLastLogin(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE membros SET last_login = datetime('now') WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  static async login(username, password) {
    const user = await this.findByUsernameOrEmail(username);
    if (!user) throw new Error('Usuário não encontrado');
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Senha incorreta');
    
    await this.updateLastLogin(user.id);
    
    // Remove a senha antes de retornar
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token: generateToken(user)
    };
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM membros", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(({ password, ...user }) => user));
      });
    });
  }

  static async getByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM membros WHERE username = ?",
        [username],
        (err, row) => {
          if (err) reject(err);
          else if (!row) resolve(null);
          else {
            const { password, ...user } = row;
            resolve(user);
          }
        }
      );
    });
  }

  static async getTotalCount() {
    return new Promise((resolve, reject) => {
      db.get("SELECT COUNT(id) as total_members FROM membros", [], (err, row) => {
        if (err) reject(err);
        else resolve(row?.total_members || 0);
      });
    });
  }

  static async getOnlineMembers() {
    const onlineThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, username, avatar, role, last_login, minecraft_nick 
         FROM membros 
         WHERE last_login > ? 
         ORDER BY username ASC`,
        [onlineThreshold],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async updateProfile(id, updateData) {
    const fields = [];
    const values = [];
    
    if (updateData.minecraft_nick) {
      fields.push("minecraft_nick = ?");
      values.push(updateData.minecraft_nick);
      
      // Atualizar avatar se o nick do Minecraft mudar
      fields.push("avatar = ?");
      values.push(`https://cravatar.eu/helmavatar/${encodeURIComponent(updateData.minecraft_nick)}/190.png`);
    }
    
    if (updateData.assinatura) {
      fields.push("assinatura = ?");
      values.push(updateData.assinatura);
    }
    
    if (fields.length === 0) {
      throw new Error("Nenhum campo válido para atualização");
    }
    
    values.push(id);
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE membros SET ${fields.join(", ")} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  static async search(query) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, username, avatar, role, minecraft_nick 
         FROM membros 
         WHERE username LIKE ? OR minecraft_nick LIKE ? 
         ORDER BY username ASC`,
        [`%${query}%`, `%${query}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

export default Member;