import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NOMBRE_MAX, texto } from '../comun/validacion.js';
import type { PrefijoBisnieto } from './prefijo-bisnieto.js';
import { PrefijosNietosService } from '../nietos/prefijos-nietos.service.js';

@Injectable()
export class PrefijosBisnietosService {
  // Almacenamiento en memoria: se pierde al reiniciar la API.
  private readonly bisnietos: PrefijoBisnieto[] = [];

  constructor(private readonly prefijosNietosService: PrefijosNietosService) {}

  listar(): PrefijoBisnieto[] {
    return [...this.bisnietos];
  }

  registrar(entrada: unknown): PrefijoBisnieto {
    const bisnieto = this.validar(entrada);

    if (!this.prefijosNietosService.existe(bisnieto.numeroPadre)) {
      throw new NotFoundException('El prefijo de cuatro dígitos no existe.');
    }

    if (this.bisnietos.some((b) => b.numero === bisnieto.numero)) {
      throw new ConflictException(
        'Ese prefijo de seis dígitos ya está registrado.',
      );
    }

    this.bisnietos.push(bisnieto);
    return bisnieto;
  }

  private validar(entrada: unknown): PrefijoBisnieto {
    const datos = (entrada ?? {}) as Record<string, unknown>;
    const numero = texto(datos.numero);
    const nombre = texto(datos.nombre);
    const numeroPadre = texto(datos.numeroPadre);
    const errores: string[] = [];

    if (!numero) {
      errores.push('El prefijo es obligatorio.');
    } else if (!/^\d{6}$/.test(numero)) {
      errores.push('El prefijo debe tener exactamente seis dígitos.');
    }

    if (!nombre) {
      errores.push('El nombre es obligatorio.');
    } else if (nombre.length > NOMBRE_MAX) {
      errores.push(`El nombre no puede superar ${NOMBRE_MAX} caracteres.`);
    }

    if (!numeroPadre) {
      errores.push('El prefijo de cuatro dígitos es obligatorio.');
    }

    if (errores.length > 0) {
      throw new BadRequestException(errores);
    }

    return { numero, nombre, numeroPadre };
  }
}
