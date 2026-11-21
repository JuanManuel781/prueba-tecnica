import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrefijosBisnietosService } from './prefijos-bisnietos.service.js';
import { PrefijosHijosService } from '../hijos/prefijos-hijos.service.js';
import { PrefijosNietosService } from '../nietos/prefijos-nietos.service.js';
import { PrefijosService } from '../padres/prefijos.service.js';

describe('PrefijosBisnietosService', () => {
  let service: PrefijosBisnietosService;

  beforeEach(() => {
    const padres = new PrefijosService();
    padres.registrar({ numero: '5', nombre: 'Ventas' });
    const hijos = new PrefijosHijosService(padres);
    hijos.registrar({ numero: '51', nombre: 'Ventas norte', numeroPadre: '5' });
    const nietos = new PrefijosNietosService(hijos);
    nietos.registrar({ numero: '5101', nombre: 'Bogotá', numeroPadre: '51' });
    service = new PrefijosBisnietosService(nietos);
  });

  it('registra un prefijo de seis dígitos bajo uno de cuatro existente', () => {
    const creado = service.registrar({
      numero: ' 510101 ',
      nombre: ' Chapinero ',
      numeroPadre: '5101',
    });

    expect(creado).toEqual({
      numero: '510101',
      nombre: 'Chapinero',
      numeroPadre: '5101',
    });
    expect(service.listar()).toEqual([creado]);
  });

  it.each([
    [{ numero: '', nombre: 'X', numeroPadre: '5101' }],
    [{ numero: '51010', nombre: 'X', numeroPadre: '5101' }],
    [{ numero: '5101011', nombre: 'X', numeroPadre: '5101' }],
    [{ numero: '5101a1', nombre: 'X', numeroPadre: '5101' }],
    [{ numero: '510101', nombre: '', numeroPadre: '5101' }],
    [{ numero: '510101', nombre: 'x'.repeat(61), numeroPadre: '5101' }],
    [{ numero: '510101', nombre: 'X', numeroPadre: '' }],
    [undefined],
  ])('rechaza datos inválidos: %j', (entrada) => {
    expect(() => service.registrar(entrada)).toThrow(BadRequestException);
  });

  it('rechaza un prefijo de cuatro dígitos que no existe', () => {
    expect(() =>
      service.registrar({ numero: '990101', nombre: 'X', numeroPadre: '9901' }),
    ).toThrow(NotFoundException);
  });

  it('rechaza un prefijo repetido', () => {
    service.registrar({ numero: '510101', nombre: 'A', numeroPadre: '5101' });

    expect(() =>
      service.registrar({ numero: '510101', nombre: 'B', numeroPadre: '5101' }),
    ).toThrow(ConflictException);
  });
});
