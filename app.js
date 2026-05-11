const express = require('express');
const cors = require('cors');
const expressJSDocSwagger = require('express-jsdoc-swagger');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// ======================= APP CONFIG ====================
app.use(express.json());
app.use(cors());

// ======================= SWAGGER ======================
const swaggerOptions = {
    baseDir: __dirname,
    filesPattern: ['./routes/*.js', './app.js'],
    swaggerUIPath: '/api-docs',
    exposeSwaggerUI: true,
    info: {
        version: '1.0.0',
        title: 'Ecommerce API (Firestore)',
        description: 'Users & Products API with Firestore'
    },
    security: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
        }
    }
};
expressJSDocSwagger(app)(swaggerOptions);

// ======================= ROUTES ========================
app.get('/', (req, res) => {
    res.send({ message: 'API is working with Firestore 🚀' });
});

// Mounting routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);

// Backward compatibility for original root-level auth routes
app.use('/', userRoutes);

module.exports = app;
