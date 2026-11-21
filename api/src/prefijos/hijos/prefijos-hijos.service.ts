import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NOMBRE_MAX, texto } from '../comun/validacion.js';
import type { PrefijoHijo } from './prefijo-hijo.js';
import { PrefijosService } from '../padres/prefijos.service.js';

@Injectable()
export class PrefijosHijosService {
  // Almacenamiento en memoria: se pierde al reiniciar la API.
  private readonly hijos: PrefijoHijo[] = [];

  constructor(private readonly prefijosService: PrefijosService) {}

  listar(): PrefijoHijo[] {
    return [...this.hijos];
  }

  existe(numero: string): boolean {
    return this.hijos.some((h) => h.numero === numero);
  }

  registrar(entrada: unknown): PrefijoHijo {
    const hijo = this.validar(entrada);

    if (!this.prefijosService.existe(hijo.numeroPadre)) {
      throw new NotFoundException('El prefijo padre no existe.');
    }

    if (this.hijos.some((h) => h.numero === hijo.numero)) {
      throw new ConflictException('Ese prefijo hijo ya está registrado.');
    }

    this.hijos.push(hijo);
    return hijo;
  }

  private validar(entrada: unknown): PrefijoHijo {
    const datos = (entrada ?? {}) as Record<string, unknown>;
    const numero = texto(datos.numero);
    const nombre = texto(datos.nombre);
    const numeroPadre = texto(datos.numeroPadre);
    const errores: string[] = [];

    if (!numero) {
      errores.push('El prefijo hijo es obligatorio.');
    } else if (!/^\d{2}$/.test(numero)) {
      errores.push('El prefijo hijo debe tener exactamente dos dígitos.');
    }

    if (!nombre) {
      errores.push('El nombre es obligatorio.');
    } else if (nombre.length > NOMBRE_MAX) {
      errores.push(`El nombre no puede superar ${NOMBRE_MAX} caracteres.`);
    }

    if (!numeroPadre) {
      errores.push('El prefijo padre es obligatorio.');
    }

    if (errores.length > 0) {
      throw new BadRequestException(errores);
    }

    return { numero, nombre, numeroPadre };
  }
}
