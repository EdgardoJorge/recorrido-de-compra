export interface Comprobante {
    idComprobante:   number,
    tipoComprobante: string,
    fechaEmision:    Date,
    idPedido:        number,
}

export interface ComprobanteBody {
    idComprobante:   number,
    tipoComprobante: string,
    fechaEmision:    Date,
    idPedido:        number,
}
