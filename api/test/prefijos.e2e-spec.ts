import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Prefijos (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registra y lista prefijos', async () => {
    await request(app.getHttpServer()).get('/prefijos').expect(200).expect([]);

    await request(app.getHttpServer())
      .post('/prefijos/registrar-prefijos')
      .send({ numero: '5', nombre: 'Ventas' })
      .expect(201)
      .expect({ numero: '5', nombre: 'Ventas' });

    await request(app.getHttpServer())
      .get('/prefijos')
      .expect(200)
      .expect([{ numero: '5', nombre: 'Ventas' }]);
  });

  it('responde 400 con datos inválidos', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/prefijos/registrar-prefijos')
      .send({ numero: '55', nombre: '' })
      .expect(400);

    expect(respuesta.body.message).toEqual([
      'El prefijo debe ser un solo dígito (0-9).',
      'El nombre es obligatorio.',
    ]);
  });

  it('responde 409 con un prefijo repetido', async () => {
    await request(app.getHttpServer())
      .post('/prefijos/registrar-prefijos')
      .send({ numero: '3', nombre: 'Soporte' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/prefijos/registrar-prefijos')
      .send({ numero: '3', nombre: 'Otro' })
      .expect(409);
  });
});

describe('Prefijos hijos (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registra un hijo bajo un padre existente y lo lista', async () => {
    await request(app.getHttpServer())
      .post('/prefijos/registrar-prefijos')
      .send({ numero: '5', nombre: 'Ventas' })
      .expect(201);

    const hijo = { numero: '51', nombre: 'Ventas norte', numeroPadre: '5' };

    await request(app.getHttpServer())
      .post('/prefijos-hijos/registrar-prefijos-hijos')
      .send(hijo)
      .expect(201)
      .expect(hijo);

    await request(app.getHttpServer())
      .get('/prefijos-hijos')
      .expect(200)
      .expect([hijo]);
  });

  it('responde 404 si el padre no existe', async () => {
    await request(app.getHttpServer())
      .post('/prefijos-hijos/registrar-prefijos-hijos')
      .send({ numero: '91', nombre: 'X', numeroPadre: '9' })
      .expect(404);
  });
});

describe('Prefijos nietos (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registra un prefijo de cuatro dígitos bajo un hijo existente', async () => {
    await request(app.getHttpServer())
      .post('/prefijos/registrar-prefijos')
      .send({ numero: '5', nombre: 'Ventas' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/prefijos-hijos/registrar-prefijos-hijos')
      .send({ numero: '51', nombre: 'Ventas norte', numeroPadre: '5' })
      .expect(201);

    const nieto = { numero: '5101', nombre: 'Bogotá', numeroPadre: '51' };

    await request(app.getHttpServer())
      .post('/prefijos-nietos/registrar-prefijos-nietos')
      .send(nieto)
      .expect(201)
      .expect(nieto);

    await request(app.getHttpServer())
      .get('/prefijos-nietos')
      .expect(200)
      .expect([nieto]);
  });

  it('responde 404 si el prefijo hijo no existe', async () => {
    await request(app.getHttpServer())
      .post('/prefijos-nietos/registrar-prefijos-nietos')
      .send({ numero: '9901', nombre: 'X', numeroPadre: '99' })
      .expect(404);
  });
});

describe('Prefijos bisnietos (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registra un prefijo de seis dígitos bajo uno de cuatro existente', async () => {
    await request(app.getHttpServer())
      .post('/prefijos/registrar-prefijos')
      .send({ numero: '5', nombre: 'Ventas' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/prefijos-hijos/registrar-prefijos-hijos')
      .send({ numero: '51', nombre: 'Ventas norte', numeroPadre: '5' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/prefijos-nietos/registrar-prefijos-nietos')
      .send({ numero: '5101', nombre: 'Bogotá', numeroPadre: '51' })
      .expect(201);

    const bisnieto = {
      numero: '510101',
      nombre: 'Chapinero',
      numeroPadre: '5101',
    };

    await request(app.getHttpServer())
      .post('/prefijos-bisnietos/registrar-prefijos-bisnietos')
      .send(bisnieto)
      .expect(201)
      .expect(bisnieto);

    await request(app.getHttpServer())
      .get('/prefijos-bisnietos')
      .expect(200)
      .expect([bisnieto]);
  });

  it('responde 404 si el prefijo de cuatro dígitos no existe', async () => {
    await request(app.getHttpServer())
      .post('/prefijos-bisnietos/registrar-prefijos-bisnietos')
      .send({ numero: '990101', nombre: 'X', numeroPadre: '9901' })
      .expect(404);
  });
});
