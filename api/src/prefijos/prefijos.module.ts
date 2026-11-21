import { Module } from '@nestjs/common';
import { PrefijosBisnietosController } from './bisnietos/prefijos-bisnietos.controller.js';
import { PrefijosBisnietosService } from './bisnietos/prefijos-bisnietos.service.js';
import { PrefijosHijosController } from './hijos/prefijos-hijos.controller.js';
import { PrefijosHijosService } from './hijos/prefijos-hijos.service.js';
import { PrefijosNietosController } from './nietos/prefijos-nietos.controller.js';
import { PrefijosNietosService } from './nietos/prefijos-nietos.service.js';
import { PrefijosController } from './padres/prefijos.controller.js';
import { PrefijosService } from './padres/prefijos.service.js';

@Module({
  controllers: [
    PrefijosController,
    PrefijosHijosController,
    PrefijosNietosController,
    PrefijosBisnietosController,
  ],
  providers: [
    PrefijosService,
    PrefijosHijosService,
    PrefijosNietosService,
    PrefijosBisnietosService,
  ],
})
export class PrefijosModule {}
