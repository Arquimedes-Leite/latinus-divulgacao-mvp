const test = require('node:test');
const assert = require('node:assert');
const { validarPromocao, filtrarPromocoesAtivas, gerarTextoWhatsApp } = require('./script.js');

test('Teste Unitário: deve aceitar promoção com título e datas válidas', () => {
  const res = validarPromocao('Combo Lanche + Refri', '2026-11-17', '2026-11-22', '2026-11-17');
  assert.strictEqual(res.valido, true);
});

test('Teste Unitário: deve recusar promoção quando data de fim for anterior à data de início', () => {
  const res = validarPromocao('Combo Lanche + Refri', '2026-11-17', '2026-11-15', '2026-11-17');
  assert.strictEqual(res.valido, false);
  assert.strictEqual(res.erro, 'A data de fim não pode ser anterior à data de início.');
});

test('Teste Unitário: deve filtrar e ocultar promoções vencidas na página pública', () => {
  const lista = [
    { titulo: 'Promoção Vencida', dataInicio: '2026-11-01', dataFim: '2026-11-10' },
    { titulo: 'Promoção Ativa', dataInicio: '2026-11-15', dataFim: '2026-11-25' }
  ];
  const ativas = filtrarPromocoesAtivas(lista, '2026-11-17');
  assert.strictEqual(ativas.length, 1);
  assert.strictEqual(ativas[0].titulo, 'Promoção Ativa');
});

test('Teste de Integração: deve gerar texto formatado para divulgação no WhatsApp', () => {
  const promo = {
    titulo: 'Combo Lanche + Refri',
    descricao: 'X-Burger com batata',
    dataInicio: '2026-11-17',
    dataFim: '2026-11-22'
  };
  const texto = gerarTextoWhatsApp(promo, 'https://exemplo.com');
  assert.ok(texto.includes('Combo Lanche + Refri'));
  assert.ok(texto.includes('2026-11-17 até 2026-11-22'));
});
