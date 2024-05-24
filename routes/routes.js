const express = require('express');
const router = express.Router();
const { insertarPedidosDetalle } = require('../controllers/insertarPedidosDetalleControllers');

router.post('/insertar-pedidos-detalle', insertarPedidosDetalle);

module.exports = router;
