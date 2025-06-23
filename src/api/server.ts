
import express from 'express';
import cors from 'cors';
import contractsRouter from './routes/contracts';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/contracts', contractsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`ContratPro API running on port ${PORT}`);
});

export default app;
