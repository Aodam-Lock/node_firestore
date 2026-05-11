const express = require('express');
const { db, admin } = require('../config/firebase');
const { auth } = require('../middleware/auth');

// This line is for building new express server
const router = express.Router();
//
// ======================= CREATE PRODUCT ===============
router.post('/', auth, async (req, res) => {
    const productRef = await db.collection('products').add({
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: 'Product created', id: productRef.id });
});

// ======================= GET PRODUCTS ==================
router.get('/', async (req, res) => {
    const snapshot = await db.collection('products').get();

    const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.json(products);
});

// ======================= UPDATE PRODUCT ===============
router.put('/:id', auth, async (req, res) => {
    try {
        const docRef = db.collection('products').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists)
            return res.status(404).json({ message: 'Product not found' });

        await docRef.update(req.body);

        res.json({ message: 'Product updated' });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ======================= DELETE PRODUCT ===============
router.delete('/:id', auth, async (req, res) => {
    try {
        const docRef = db.collection('products').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists)
            return res.status(404).json({ message: 'Product not found' });

        await docRef.delete();

        res.json({ message: 'Product deleted' });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
