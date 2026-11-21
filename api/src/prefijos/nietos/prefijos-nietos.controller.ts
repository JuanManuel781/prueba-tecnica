import { Body, Controller, Get, Post } from '@nestjs/common';
import type { PrefijoNieto } from './prefijo-nieto.js';
import { PrefijosNietosService } from './prefijos-nietos.service.js';

@Controller('prefijos-nietos')
export class PrefijosNietosController {
  constructor(private readonly prefijosNietosService: PrefijosNietosService) {}

  @Get()
  listar(): PrefijoNieto[] {
    return this.prefijosNietosService.listar();
  }

  @Post('registrar-prefijos-nietos')
  registrar(@Body() cuerpo: unknown): PrefijoNieto {
    return this.prefijosNietosService.registrar(cuerpo);
  }
}
