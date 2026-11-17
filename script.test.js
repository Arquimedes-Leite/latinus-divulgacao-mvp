const test = require('node:test');
const assert = require('node:assert');
const { validarTextoPromocao, atualizarPromocaoNoDOM } = require('./script.js');

test('Teste Unitário: deve aceitar promoção com tamanho válido', () => {
  assert.strictEqual(validarTextoPromocao('Combo X-Latinus + Refri por R$ 29,90'), true);
});

test('Teste Unitário: deve rejeitar promoção vazia ou muito curta', () => {
  assert.strictEqual(validarTextoPromocao('   '), false);
  assert.strictEqual(validarTextoPromocao('Oi'), false);
});

test('Teste Unitário: deve rejeitar promoção acima de 150 caracteres', () => {
  const textoLongo = 'A'.repeat(151);
  assert.strictEqual(validarTextoPromocao(textoLongo), false);
});

test('Teste de Integração: deve atualizar o texto do elemento DOM quando válido', () => {
  const mockElemento = { textContent: 'Promoção antiga' };
  const resultado = atualizarPromocaoNoDOM(mockElemento, '  Super Quarta: Batata grátis!  ');
  
  assert.strictEqual(resultado, true);
  assert.strictEqual(mockElemento.textContent, 'Super Quarta: Batata grátis!');
});
