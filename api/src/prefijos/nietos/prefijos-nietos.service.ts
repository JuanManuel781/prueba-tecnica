import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NOMBRE_MAX, texto } from '../comun/validacion.js';
import type { PrefijoNieto } from './prefijo-nieto.js';
import { PrefijosHijosService } from '../hijos/prefijos-hijos.service.js';

@Injectable()
export class PrefijosNietosService {
  // Almacenamiento en memoria: se pierde al reiniciar la API.
  private readonly nietos: PrefijoNieto[] = [];

  constructor(private readonly prefijosHijosService: PrefijosHijosService) {}

  listar(): PrefijoNieto[] {
    return [...this.nietos];
  }

  existe(numero: string): boolean {
    return this.nietos.some((n) => n.numero === numero);
  }

  registrar(entrada: unknown): PrefijoNieto {
    const nieto = this.validar(entrada);

    if (!this.prefijosHijosService.existe(nieto.numeroPadre)) {
      throw new NotFoundException('El prefijo hijo no existe.');
    }

    if (this.nietos.some((n) => n.numero === nieto.numero)) {
      throw new ConflictException(
        'Ese prefijo de cuatro dígitos ya está registrado.',
      );
    }

    this.nietos.push(nieto);
    return nieto;
  }

  private validar(entrada: unknown): PrefijoNieto {
    const datos = (entrada ?? {}) as Record<string, unknown>;
    const numero = texto(datos.numero);
    const nombre = texto(datos.nombre);
    const numeroPadre = texto(datos.numeroPadre);
    const errores: string[] = [];

    if (!numero) {
      errores.push('El prefijo es obligatorio.');
    } else if (!/^\d{4}$/.test(numero)) {
      errores.push('El prefijo debe tener exactamente cuatro dígitos.');
    }

    if (!nombre) {
      errores.push('El nombre es obligatorio.');
    } else if (nombre.length > NOMBRE_MAX) {
      errores.push(`El nombre no puede superar ${NOMBRE_MAX} caracteres.`);
    }

    if (!numeroPadre) {
      errores.push('El prefijo hijo es obligatorio.');
    }

    if (errores.length > 0) {
      throw new BadRequestException(errores);
    }

    return { numero, nombre, numeroPadre };
  }
}
