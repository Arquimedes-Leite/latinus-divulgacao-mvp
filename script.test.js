const test = require('node:test');
const assert = require('node:assert');
const {
  validarPromocao,
  filtrarPromocoesAtivas,
  gerarTextoWhatsApp,
  validarContaGoogle,
  calcularDireitoLancheGratis
} = require('./script.js');

test('Teste Unitário: deve aceitar promoção com título e datas válidas', () => {
  const res = validarPromocao('Combo Hot Dog Duplo', '2026-11-17', '2026-11-22', '2026-11-17');
  assert.strictEqual(res.valido, true);
});

test('Teste Unitário: deve recusar promoção quando data de fim for anterior à data de início', () => {
  const res = validarPromocao('Combo Hot Dog Duplo', '2026-11-17', '2026-11-15', '2026-11-17');
  assert.strictEqual(res.valido, false);
});

test('Teste Unitário: deve validar conta Google (@gmail.com)', () => {
  assert.strictEqual(validarContaGoogle('morador.entrelagos@gmail.com'), true);
  assert.strictEqual(validarContaGoogle('usuario@hotmail.com'), false);
});

test('Teste Unitário: deve liberar 1 lanche grátis apenas quando o cadastro atingir 10 compras', () => {
  const comNoveCompras = calcularDireitoLancheGratis(9);
  assert.strictEqual(comNoveCompras.lancheGratisDisponivel, false);
  assert.strictEqual(comNoveCompras.faltam, 1);

  const comDezCompras = calcularDireitoLancheGratis(10);
  assert.strictEqual(comDezCompras.lancheGratisDisponivel, true);
  assert.strictEqual(comDezCompras.faltam, 0);
});

test('Teste de Integração: deve gerar texto formatado para divulgação no WhatsApp', () => {
  const promo = {
    titulo: 'Combo Hot Dog Duplo',
    descricao: '2 salsichas + refri lata',
    dataInicio: '2026-11-17',
    dataFim: '2026-11-22'
  };
  const texto = gerarTextoWhatsApp(promo, 'https://ifood.com.br');
  assert.ok(texto.includes('Combo Hot Dog Duplo'));
  assert.ok(texto.includes('Entrelagos'));
});
