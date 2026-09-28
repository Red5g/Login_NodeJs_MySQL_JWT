const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

// Vistas
router.get('/', authController.isauthenticated, authController.listUsers)

router.get('/login', (req, res) => {
    res.render('login', { alert: false })
})
router.get('/register', (req, res) => {
    res.render('register')
})
router.get('/register2', (req, res) => {
    res.render('register2')
})

// Autenticación
router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

// CRUD de usuarios
router.post('/users/:id', authController.isauthenticated, authController.updateUser)
router.get('/delete/:id', authController.isauthenticated, authController.deleteUser)

module.exports = router