import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { NOMBRE_MAX, texto } from '../comun/validacion.js';
import type { Prefijo } from './prefijo.js';

@Injectable()
export class PrefijosService {
  // Almacenamiento en memoria: se pierde al reiniciar la API.
  private readonly prefijos: Prefijo[] = [];

  listar(): Prefijo[] {
    return [...this.prefijos];
  }

  existe(numero: string): boolean {
    return this.prefijos.some((p) => p.numero === numero);
  }

  registrar(entrada: unknown): Prefijo {
    const prefijo = this.validar(entrada);

    if (this.existe(prefijo.numero)) {
      throw new ConflictException('Ese prefijo ya está registrado.');
    }

    this.prefijos.push(prefijo);
    return prefijo;
  }

  private validar(entrada: unknown): Prefijo {
    const datos = (entrada ?? {}) as Record<string, unknown>;
    const numero = texto(datos.numero);
    const nombre = texto(datos.nombre);
    const errores: string[] = [];

    if (!numero) {
      errores.push('El prefijo es obligatorio.');
    } else if (!/^\d$/.test(numero)) {
      errores.push('El prefijo debe ser un solo dígito (0-9).');
    }

    if (!nombre) {
      errores.push('El nombre es obligatorio.');
    } else if (nombre.length > NOMBRE_MAX) {
      errores.push(`El nombre no puede superar ${NOMBRE_MAX} caracteres.`);
    }

    if (errores.length > 0) {
      throw new BadRequestException(errores);
    }

    return { numero, nombre };
  }
}
