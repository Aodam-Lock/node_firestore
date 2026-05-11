const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, admin } = require('../config/firebase');
const { auth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ======================= REGISTER ======================
router.post('/register', async (req, res) => {
    try {
        const { name, age, address, email, password } = req.body;

        const snapshot = await db
            .collection('users')
            .where('email', '==', email)
            .get();

        if (!snapshot.empty)
            return res.status(400).json({ message: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.collection('users').add({
            name,
            age,
            address,
            email,
            password: hashedPassword,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ======================= LOGIN =========================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const snapshot = await db
            .collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty)
            return res.status(400).json({ message: 'Invalid email or password' });

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { userId: userDoc.id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ======================= GET USERS =====================
router.get('/', auth, async (req, res) => {
    const snapshot = await db.collection('users').get();

    const users = snapshot.docs.map(doc => {
        const data = doc.data();
        delete data.password;
        return { id: doc.id, ...data };
    });

    res.json(users);
});

// ======================= UPDATE USER ===================
router.put('/:id', auth, async (req, res) => {
    try {
        const docRef = db.collection('users').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists)
            return res.status(404).json({ message: 'User not found' });

        await docRef.update(req.body);

        res.json({ message: 'User updated' });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ======================= DELETE USER ===================
router.delete('/:id', auth, async (req, res) => {
    try {
        const docRef = db.collection('users').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists)
            return res.status(404).json({ message: 'User not found' });

        await docRef.delete();

        res.json({ message: 'User deleted' });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
