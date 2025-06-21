import Member from '../models/Member.js';
import { hashPassword, comparePasswords, generateToken } from '../src/config/auth.js';

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, minecraftNick, avatar } = req.body;
      
      if (!username || !email || !password || !minecraftNick) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Verifica se o usuário já existe
      const existingUser = await Member.findByUsernameOrEmail(username);
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Nome de usuário ou email já está em uso' 
        });
      }

      // Cria o novo usuário
      const userId = await Member.create({
        username,
        email,
        password,
        minecraftNick,
        avatar
      });

      // Busca os dados do usuário criado
      const newUser = await Member.findById(userId);
      if (!newUser) {
        throw new Error('Erro ao recuperar dados do usuário recém-criado');
      }

      // Remove a senha antes de enviar a resposta
      const { password: _, ...userData } = newUser;

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        user: userData
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ 
        error: error.message.includes('UNIQUE') ? 
          'Nome de usuário ou email já existe' : 
          'Erro ao registrar usuário' 
      });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
      }
      
      // Busca o usuário no banco de dados
      const user = await Member.findByUsernameOrEmail(username);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      // Verifica a senha
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      // Atualiza o último login
      await Member.updateLastLogin(user.id);
      
      // Gera o token JWT
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      // Remove a senha antes de enviar a resposta
      const { password: _, ...userData } = user;
      
      res.json({
        success: true,
        message: 'Login bem-sucedido',
        token,
        user: userData
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

  static async getMe(req, res) {
    try {
      // 1. Verificação robusta do usuário autenticado
      if (!req.user?.id) {
        console.error('Erro: Middleware não adicionou req.user');
        return res.status(401).json({ 
          error: 'Token inválido - faça login novamente' 
        });
      }

      // 2. Busca os dados do usuário (MANTIDO EXATAMENTE COMO ESTAVA)
      const user = await Member.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // 3. Remove a senha (MANTIDO ORIGINAL)
      const { password: _, ...userData } = user;
      
      // 4. Resposta EXATAMENTE como estava (ESSENCIAL)
      res.json(userData);

    } catch (error) {
      console.error('Erro em getMe:', error);
      res.status(500).json({ error: 'Erro ao carregar perfil' });
    }
}

  static async validateToken(req, res) {
    try {
      // Se o middleware de autenticação passou, o token é válido
      const user = await Member.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Remove a senha antes de enviar a resposta
      const { password: _, ...userData } = user;
      
      res.json({
        valid: true,
        user: userData
      });

    } catch (error) {
      console.error('Erro ao validar token:', error);
      res.status(500).json({ 
        valid: false,
        error: 'Erro ao validar token' 
      });
    }
  }
}

export default AuthController;