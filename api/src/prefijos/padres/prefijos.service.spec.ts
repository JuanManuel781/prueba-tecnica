import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrefijosService } from './prefijos.service.js';

describe('PrefijosService', () => {
  let service: PrefijosService;

  beforeEach(() => {
    service = new PrefijosService();
  });

  it('registra un prefijo válido y lo lista', () => {
    const creado = service.registrar({ numero: ' 5 ', nombre: ' Ventas ' });

    expect(creado).toEqual({ numero: '5', nombre: 'Ventas' });
    expect(service.listar()).toEqual([{ numero: '5', nombre: 'Ventas' }]);
  });

  it.each([
    [{ numero: '', nombre: 'Ventas' }],
    [{ numero: '12', nombre: 'Ventas' }],
    [{ numero: 'a', nombre: 'Ventas' }],
    [{ numero: '1', nombre: '' }],
    [{ numero: '1', nombre: 'x'.repeat(61) }],
    [{ numero: 1, nombre: 'Ventas' }],
    [undefined],
  ])('rechaza datos inválidos: %j', (entrada) => {
    expect(() => service.registrar(entrada)).toThrow(BadRequestException);
  });

  it('rechaza un prefijo repetido', () => {
    service.registrar({ numero: '3', nombre: 'Soporte' });

    expect(() => service.registrar({ numero: '3', nombre: 'Otro' })).toThrow(
      ConflictException,
    );
  });
});
