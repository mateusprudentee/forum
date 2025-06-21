import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = '8448270f4a7672db1af3d41cefc127909b735edad27c8b1b8d4fa6145c27dbaa';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Token não fornecido' 
    });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      // Diferenciar entre token expirado e inválido
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Sessão expirada',
          isExpired: true
        });
      }
      return res.status(403).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    req.user = user;
    next();
  });
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePasswords(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id,
      username: user.username,
      minecraftNick: user.minecraftNick, // Adicionado
      role: user.role 
    },
    SECRET_KEY,
    { expiresIn: '24h' }
  );
}

export { authenticateToken, hashPassword, comparePasswords, generateToken };