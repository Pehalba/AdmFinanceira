import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  TransactionController,
  AccountController,
  CategoryController,
  MonthlySummaryController,
  RecurringBillController,
  PayableController,
  UserMetaController,
  AuthController,
} from './controllers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Financeiro API is running' });
});

// Routes
app.use('/api/auth', AuthController);
app.use('/api/transactions', TransactionController);
app.use('/api/accounts', AccountController);
app.use('/api/categories', CategoryController);
app.use('/api/monthly-summaries', MonthlySummaryController);
app.use('/api/recurring-bills', RecurringBillController);
app.use('/api/payables', PayableController);
app.use('/api/users', UserMetaController);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Data stored in: ${join(__dirname, 'data')}`);
});
