import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrefijosHijosService } from '../hijos/prefijos-hijos.service.js';
import { PrefijosNietosService } from './prefijos-nietos.service.js';
import { PrefijosService } from '../padres/prefijos.service.js';

describe('PrefijosNietosService', () => {
  let service: PrefijosNietosService;

  beforeEach(() => {
    const padres = new PrefijosService();
    padres.registrar({ numero: '5', nombre: 'Ventas' });
    const hijos = new PrefijosHijosService(padres);
    hijos.registrar({ numero: '51', nombre: 'Ventas norte', numeroPadre: '5' });
    service = new PrefijosNietosService(hijos);
  });

  it('registra un prefijo de cuatro dígitos bajo un hijo existente', () => {
    const creado = service.registrar({
      numero: ' 5101 ',
      nombre: ' Bogotá ',
      numeroPadre: '51',
    });

    expect(creado).toEqual({
      numero: '5101',
      nombre: 'Bogotá',
      numeroPadre: '51',
    });
    expect(service.listar()).toEqual([creado]);
  });

  it.each([
    [{ numero: '', nombre: 'X', numeroPadre: '51' }],
    [{ numero: '510', nombre: 'X', numeroPadre: '51' }],
    [{ numero: '51011', nombre: 'X', numeroPadre: '51' }],
    [{ numero: '51a1', nombre: 'X', numeroPadre: '51' }],
    [{ numero: '5101', nombre: '', numeroPadre: '51' }],
    [{ numero: '5101', nombre: 'x'.repeat(61), numeroPadre: '51' }],
    [{ numero: '5101', nombre: 'X', numeroPadre: '' }],
    [undefined],
  ])('rechaza datos inválidos: %j', (entrada) => {
    expect(() => service.registrar(entrada)).toThrow(BadRequestException);
  });

  it('rechaza un prefijo hijo que no existe', () => {
    expect(() =>
      service.registrar({ numero: '9901', nombre: 'X', numeroPadre: '99' }),
    ).toThrow(NotFoundException);
  });

  it('rechaza un prefijo repetido', () => {
    service.registrar({ numero: '5101', nombre: 'A', numeroPadre: '51' });

    expect(() =>
      service.registrar({ numero: '5101', nombre: 'B', numeroPadre: '51' }),
    ).toThrow(ConflictException);
  });
});
