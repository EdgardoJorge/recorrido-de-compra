import { Component } from '@angular/core';
import { EnvioService } from '../../../../shared/services/envio.service';
import { RecojoService } from '../../../../shared/services/recojo.service';
import { ClienteService } from '../../../../shared/services/cliente.service';
import { PedidoService } from '../../../../shared/services/pedido.service';
import { DetallePedidoService } from '../../../../shared/services/detalle-pedido.service';
import { ProductoService } from '../../../../shared/services/producto.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  constructor(
    private envioService: EnvioService,
    private recojoService: RecojoService,
    private clienteService: ClienteService,
    private pedidoService: PedidoService,
    private detallePedidoService: DetallePedidoService,
    private productoService: ProductoService
  ) {}

  continue(): void {
    const selectedDepartamento = localStorage.getItem('selectedDepartamento');
    const selectedProvincia = localStorage.getItem('selectedProvincia');
    const selectedDistrito = localStorage.getItem('selectedDistrito');
    const referencia = localStorage.getItem('referencia');
    const CodigoPostal = localStorage.getItem('CodigoPostal');
    const total = parseFloat(localStorage.getItem('totalCarrito') || '0');

    const rucData = localStorage.getItem('rucData') ? JSON.parse(localStorage.getItem('rucData')!) : null;
    const dniData = localStorage.getItem('dniData') ? JSON.parse(localStorage.getItem('dniData')!) : null;

    const razonSocial = localStorage.getItem('switchState') === 'true' ? rucData?.razonSocial : `${dniData?.nombres} ${dniData?.apellidoPaterno} ${dniData?.apellidoMaterno}`;
    const email = localStorage.getItem('switchState') === 'true' ? localStorage.getItem('gmailFactura') : localStorage.getItem('gmailBoleta');
    const telefonoMovil = localStorage.getItem('switchState') === 'true' ? localStorage.getItem('celularFactura') : localStorage.getItem('celularBoleta');
    const tipoDocumento = localStorage.getItem('switchState') === 'true' ? 'RUC' : 'DNI';
    const numeroDocumento = localStorage.getItem('switchState') === 'true' ? rucData?.ruc : dniData?.dni;
    const direccionFiscal = localStorage.getItem('switchState') === 'true' ? rucData?.direccion : '1';

    let envioData = null;
    let recojoData = null;

    if (selectedDepartamento && selectedProvincia && selectedDistrito && referencia && CodigoPostal) {
      envioData = {
        region: selectedDepartamento,
        provincia: selectedProvincia,
        distrito: selectedDistrito,
        localidad: 'Huancayo',
        calle: 'Cajamarca',
        nDomicilio: '611',
        codigoPostal: CodigoPostal,
        fechaEnvio: null,
        fechaEntrega: null,
        responsableEntrega: null,
        idPersonal: 1
      };
    } else {
      recojoData = {
        fechaListo: null,
        fechaEntrega: null,
        responsableDeRecojo: null,
      };
    }

    const clienteData = {
      razonSocial: razonSocial,
      email: email,
      telefonoMovil: telefonoMovil,
      //leo no tengo ni idea pero lo que esta en tipo de documento se duplica en numero de documento cuando pones ambos en tipo de documento numero de documento se pone numero de documento
      tipoDocumento: tipoDocumento,
      numeroDocumento: numeroDocumento,
      direccionFiscal: direccionFiscal
    };

    if (envioData) {
      this.envioService.create(envioData).subscribe((envio: any) => {
        const envioId = envio?.idEnvio || envio?.data?.idEnvio;
        if (envioId != null) {
          localStorage.setItem('envioId', envioId.toString());
          this.savePedido(envioId, null, clienteData, total);
        } else {
          console.error('Error: Envio no contiene un id.', envio);
        }
      });
    } else if (recojoData) {
      this.recojoService.create(recojoData).subscribe((recojo: any) => {
        const recojoId = recojo?.idRecojo;
        if (recojoId != null) {
          localStorage.setItem('recojoId', recojoId.toString());
          this.savePedido(null, recojoId, clienteData, total);
        } else {
          console.error('Error: Recojo no contiene un id.', recojo);
        }
      });
    }
  }

  savePedido(envioId: number | null, recojoId: number | null, clienteData: any, total: number): void {
    this.clienteService.create(clienteData).subscribe((cliente: any) => {
      const clienteId = cliente?.idCliente || cliente?.id;
      if (clienteId != null) {
        localStorage.setItem('clienteId', clienteId.toString());

        const pedidoData = {
          fechaPedido: new Date(),
          fechaCancelado: null,
          tipoPedido: envioId ? 'Envio a Domicilio' : 'Recojo en Tienda',
          estado: 'Pendiente',
          total: total,
          idCliente: clienteId,
          idPersonal: 1,
          idEnvio: envioId,
          idRecojo: recojoId
        };

        this.pedidoService.create(pedidoData).subscribe((pedido: any) => {
          const pedidoId = pedido?.idPedido || pedido?.id;
          if (pedidoId != null) {
            localStorage.setItem('pedidoId', pedidoId.toString());
            this.saveDetallePedido(pedidoId);
          } else {
            console.error('Error: Pedido no contiene un id.', pedido);
          }
        });
      } else {
        console.error('Error: Cliente no contiene un id.', cliente);
      }
    });
  }

  saveDetallePedido(pedidoId: number): void {
    const cantidad = parseInt(localStorage.getItem('cantidad') || '0');
    const idProducto = parseInt(localStorage.getItem('idProducto') || '0');

    this.productoService.getById(idProducto).subscribe((producto: any) => {
      const precioUnitario = producto?.precio || 0;
      const precioDescuento = producto?.precioDescuento || 0;
      const subtotal = precioDescuento > 0 ? precioDescuento * cantidad : precioUnitario * cantidad;

      const detallePedidoData = {
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        precioDescuento: precioDescuento,
        subtotal: subtotal,
        idProducto: idProducto,
        idPedido: pedidoId
      };

      this.detallePedidoService.create(detallePedidoData).subscribe((detallePedido: any) => {
        const detallePedidoId = detallePedido?.id;
        if (detallePedidoId != null) {
          localStorage.setItem('detallePedidoId', detallePedidoId.toString());
        } else {
          console.error('Error: DetallePedido no contiene un id.', detallePedido);
        }
      });
    });
  }
}
