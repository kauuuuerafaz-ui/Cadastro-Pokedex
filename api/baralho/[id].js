'use strict'

// Vercel: /api/baralho/:id (GET, PUT, PATCH, DELETE). Reaproveita o mesmo código do server.js.
const { tratarRequisicao } = require('../../server.js')

module.exports = (req, res) => {
    const id = req.query && req.query.id !== undefined ? String(req.query.id) : ''
    req.url = `/api/baralho/${encodeURIComponent(id)}`
    return tratarRequisicao(req, res)
}
