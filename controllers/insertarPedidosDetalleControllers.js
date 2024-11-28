const sql = require("mssql");
const logger = require("../config/logger.js");
const {
  connectToDatabase,
  closeDatabaseConnection,
} = require("../config/database.js");
const moment = require("moment");

/**
 * Prepara los datos para insertar en la tabla pedidosDet.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {Object} res - El objeto de respuesta HTTP.
 */
async function insertarPedidosDetalle(req, res) {
  const data = req.body.item;
  logger.info(`Iniciamos la funcion insertarPedidosDetalle`);
  logger.debug(`data ${JSON.stringify(data)}`);

  let result;
  let responseData = [];
  try {
    // Conectarse a la base de datos 'telecontrol'
    await connectToDatabase("Telecontrol");

    // Armamos data que vamos a mandar al procedimiento almacenado
    for (const pedidosDetalle of data) {
      const {
        pedido_item: ID_Item,
        folio: Folio,
        tipoDocumento: TipoDocumento,
        referencia: Referencia,
        qtde: Cantidad,
        preco: Precio,
        ipi: Iva,
        qtde_faturada: CantidadFacturada,
        qtde_cancelada: CantidadCancelada,
        pedido: Pedido_ID,
        ID: ID,
        tipoItem: TipoItem,
        folio: idOCompra,
        rutCliente: RutCliente,
        observacion: Observacion,
      } = pedidosDetalle;

       // Validar y corregir el formato del RUT
       const formattedRut = formatRut(RutCliente);

      const request = new sql.Request(); // Nueva instancia de request en cada iteración

      // Ejecutar el procedimiento almacenado con los parámetros
      result = await request
        .input("ID_Item", sql.VarChar(20), ID_Item.toString())
        .input("Empresa", sql.VarChar(20), "Makita")
        .input("Folio", sql.Int, Folio)
        .input("TipoDocumento", sql.VarChar(40), TipoDocumento)
        .input("Referencia", sql.VarChar(50), Referencia)
        .input("Cantidad", sql.Int, parseInt(Cantidad))
        .input("Precio", sql.Int, Precio)
        .input("Iva", sql.VarChar(20), Iva)
        .input("CantidadFacturada", sql.VarChar(20), CantidadFacturada)
        .input("CantidadCancelada", sql.VarChar(20), CantidadCancelada)
        .input("Pedido_ID", sql.VarChar(20), Pedido_ID.toString())
        .input("ID", sql.Int, ID)
        .input("TipoItem", sql.VarChar(20), TipoItem)
        .input("Descuento", sql.Int, 0)
        .input("idOCompra", sql.Int, idOCompra)
        .input("RutCliente", sql.VarChar(250), formattedRut) 
        .input("Observacion", sql.VarChar(200), Observacion)
        .execute("insertaPedidosDetalleSP");

      result.tipoDocumento = TipoDocumento;
      result.codigo_posto = RutCliente;
      result.pedido = Pedido_ID;

      responseData.push(result);
    }

    await closeDatabaseConnection();
    logger.info(
      `Fin la funcion insertarPedidosDetalle ${JSON.stringify(responseData)}`
    );
    res.status(200).json(responseData);
  } catch (error) {
    // Manejamos cualquier error ocurrido durante el proceso
    logger.error(`Error en insertarPedidoDetalle: ${error.message}`);
    res
      .status(500)
      .json({
        error: `Error en el servidor [insertar-pedido-detalle-ms] :  ${error.message}`,
      });
  }
}

// Función para validar y corregir el formato del RUT
function formatRut(rut) {
  if (!rut.includes("-")) {
    // Insertar un guion antes del último carácter
    return `${rut.slice(0, -1)}-${rut.slice(-1)}`;
  }
  // Si ya tiene el formato correcto, devolver tal cual
  return rut;
}

module.exports = {
  insertarPedidosDetalle,
};
