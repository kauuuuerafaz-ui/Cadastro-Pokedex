'use strict'

// Vercel: /api/baralho (GET lista, POST cadastra). Reaproveita o mesmo código do server.js.
const { tratarRequisicao } = require('../../server.js')

module.exports = (req, res) => {
    req.url = '/api/baralho'
    return tratarRequisicao(req, res)
}
