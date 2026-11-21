import { Body, Controller, Get, Post } from '@nestjs/common';
import type { Prefijo } from './prefijo.js';
import { PrefijosService } from './prefijos.service.js';

@Controller('prefijos')
export class PrefijosController {
  constructor(private readonly prefijosService: PrefijosService) {}

  @Get()
  listar(): Prefijo[] {
    return this.prefijosService.listar();
  }

  @Post('registrar-prefijos')
  registrar(@Body() cuerpo: unknown): Prefijo {
    return this.prefijosService.registrar(cuerpo);
  }
}
