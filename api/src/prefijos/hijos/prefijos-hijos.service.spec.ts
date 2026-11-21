import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrefijosHijosService } from './prefijos-hijos.service.js';
import { PrefijosService } from '../padres/prefijos.service.js';

describe('PrefijosHijosService', () => {
  let service: PrefijosHijosService;

  beforeEach(() => {
    const padres = new PrefijosService();
    padres.registrar({ numero: '5', nombre: 'Ventas' });
    service = new PrefijosHijosService(padres);
  });

  it('registra un hijo asociado a un padre existente', () => {
    const creado = service.registrar({
      numero: ' 51 ',
      nombre: ' Ventas norte ',
      numeroPadre: '5',
    });

    expect(creado).toEqual({
      numero: '51',
      nombre: 'Ventas norte',
      numeroPadre: '5',
    });
    expect(service.listar()).toEqual([creado]);
  });

  it.each([
    [{ numero: '', nombre: 'X', numeroPadre: '5' }],
    [{ numero: '5', nombre: 'X', numeroPadre: '5' }],
    [{ numero: '512', nombre: 'X', numeroPadre: '5' }],
    [{ numero: 'ab', nombre: 'X', numeroPadre: '5' }],
    [{ numero: '51', nombre: '', numeroPadre: '5' }],
    [{ numero: '51', nombre: 'x'.repeat(61), numeroPadre: '5' }],
    [{ numero: '51', nombre: 'X', numeroPadre: '' }],
    [undefined],
  ])('rechaza datos inválidos: %j', (entrada) => {
    expect(() => service.registrar(entrada)).toThrow(BadRequestException);
  });

  it('rechaza un padre que no existe', () => {
    expect(() =>
      service.registrar({ numero: '91', nombre: 'X', numeroPadre: '9' }),
    ).toThrow(NotFoundException);
  });

  it('rechaza un hijo repetido', () => {
    service.registrar({ numero: '51', nombre: 'A', numeroPadre: '5' });

    expect(() =>
      service.registrar({ numero: '51', nombre: 'B', numeroPadre: '5' }),
    ).toThrow(ConflictException);
  });
});
