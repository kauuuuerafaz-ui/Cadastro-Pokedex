'use strict'

// Vercel: /api/saude (confere a conexão com o banco).
const { tratarRequisicao } = require('../server.js')

module.exports = (req, res) => {
    req.url = '/api/saude'
    return tratarRequisicao(req, res)
}
