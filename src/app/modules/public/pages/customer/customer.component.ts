import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Importa Router para la navegación
import { RucService } from '../../services/ruc.service';
import { DniService } from '../../services/dni.service'; 

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent {
  switchState: boolean = false; // Estado inicial del switch
  rucData: any; // Para almacenar los datos del RUC
  dniData: any; // Para almacenar los datos del DNI
  noResultsDNI: boolean = false; // Variable para controlar si hay resultados
  noResultsRUC: boolean = false;
  gmailBoleta: string = ''; // Para almacenar el Gmail de la boleta
  celularBoleta: string = ''; // Para almacenar el número de celular de la boleta
  gmailFactura: string = ''; // Para almacenar el Gmail de la factura
  celularFactura: string = ''; // Para almacenar el número de celular de la factura

  constructor(private rucService: RucService, private dniService: DniService, private router: Router) {} // Inyecta el Router

  // Método para obtener datos del RUC
  fetchRucData(ruc: string) {
    this.rucService.getRucData(ruc).subscribe({
      next: (data) => {
        if (data && (data.razonSocial || data.ruc)) {
          this.rucData = data; 
          this.noResultsRUC = false;
        } else {
          this.rucData = null;
          this.noResultsRUC = true;
        }
        console.log(this.rucData);
      },
      error: (error) => {
        console.error('Error al obtener datos del RUC:', error);
        this.rucData = null;
        this.noResultsRUC = true;
      }
    });
  }

  // Método para obtener datos del DNI
  fetchDniData(dni: string) {
    this.dniService.getDniData(dni).subscribe({
      next: (data) => {
        if (data && (data.dni || data.nombres || data.apellidoPaterno || data.apellidoMaterno || data.codVerifica)) {
          this.dniData = data;
          this.noResultsDNI = false;
        } else {
          this.dniData = null;
          this.noResultsDNI = true;
        }
        console.log(this.dniData);
      },
      error: (error) => {
        console.error('Error al obtener datos del DNI:', error);
        this.dniData = null;
        this.noResultsDNI = true;
      }
    });
  }

  // Método para continuar a la siguiente vista
  continue() {
    // Verifica si al menos uno de los formularios está completo
    const isBoletaComplete = this.gmailBoleta && this.celularBoleta;
    const isFacturaComplete = this.gmailFactura && this.celularFactura;

    if (isBoletaComplete || isFacturaComplete) {
        // Save BOLETA data
        if (isBoletaComplete) {
            localStorage.setItem('dniData', JSON.stringify(this.dniData));
            localStorage.setItem('gmailBoleta', this.gmailBoleta);
            localStorage.setItem('celularBoleta', this.celularBoleta);
        }
        // Save FACTURA data
        if (isFacturaComplete) {
            localStorage.setItem('rucData', JSON.stringify(this.rucData));
            localStorage.setItem('gmailFactura', this.gmailFactura);
            localStorage.setItem('celularFactura', this.celularFactura);
        }
        this.router.navigate(['/recorrido/ubicacion']);
    } else {
        alert("Por favor, completa todos los datos de boleta o factura antes de continuar."); // Mensaje de error si no hay datos
    }
}
}