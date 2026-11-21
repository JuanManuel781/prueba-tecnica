import { Body, Controller, Get, Post } from '@nestjs/common';
import type { PrefijoHijo } from './prefijo-hijo.js';
import { PrefijosHijosService } from './prefijos-hijos.service.js';

@Controller('prefijos-hijos')
export class PrefijosHijosController {
  constructor(private readonly prefijosHijosService: PrefijosHijosService) {}

  @Get()
  listar(): PrefijoHijo[] {
    return this.prefijosHijosService.listar();
  }

  @Post('registrar-prefijos-hijos')
  registrar(@Body() cuerpo: unknown): PrefijoHijo {
    return this.prefijosHijosService.registrar(cuerpo);
  }
}
