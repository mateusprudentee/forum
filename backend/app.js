import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import membersRoutes from './routes/membersRoutes.js';
import punishmentsRoutes from './routes/punishmentsRoutes.js';
import { initializeDatabase } from './src/config/database.js';

const app = express();
const port = 3001;

// Configurações básicas
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Rotas
app.use('', authRoutes);
app.use('', forumRoutes);
app.use('', membersRoutes);
app.use('', punishmentsRoutes);

// Inicialização do banco de dados
initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Falha ao inicializar o banco de dados:', err);
    process.exit(1);
  });

export default app;