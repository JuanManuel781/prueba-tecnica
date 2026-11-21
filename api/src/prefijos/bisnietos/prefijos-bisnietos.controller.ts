import { Body, Controller, Get, Post } from '@nestjs/common';
import type { PrefijoBisnieto } from './prefijo-bisnieto.js';
import { PrefijosBisnietosService } from './prefijos-bisnietos.service.js';

@Controller('prefijos-bisnietos')
export class PrefijosBisnietosController {
  constructor(
    private readonly prefijosBisnietosService: PrefijosBisnietosService,
  ) {}

  @Get()
  listar(): PrefijoBisnieto[] {
    return this.prefijosBisnietosService.listar();
  }

  @Post('registrar-prefijos-bisnietos')
  registrar(@Body() cuerpo: unknown): PrefijoBisnieto {
    return this.prefijosBisnietosService.registrar(cuerpo);
  }
}
