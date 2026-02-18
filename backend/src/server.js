import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import reviewRoutes from './routes/reviews.js';
import wishlistRoutes from './routes/wishlist.js';
import orderRoutes from './routes/orders.js';
import discountCodeRoutes from './routes/discountCodes.js';
import headerLinkRoutes from './routes/headerLinks.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes from './routes/upload.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Elasticsearch if enabled
if (process.env.ELASTICSEARCH_ENABLED === 'true') {
  (async () => {
    try {
      const { testConnection } = await import('./config/elasticsearch.js');
      const { createIndex } = await import('./services/elasticsearchService.js');
      
      const connected = await testConnection();
      if (connected) {
        await createIndex();
        console.log('Elasticsearch initialized successfully');
      } else {
        console.warn('Elasticsearch connection failed. Search will fall back to MongoDB.');
      }
    } catch (error) {
      console.warn('Elasticsearch initialization error:', error.message);
      console.warn('Search will fall back to MongoDB.');
    }
  })();
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/discount-codes', discountCodeRoutes);
app.use('/api/header-links', headerLinkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
