function validarTextoPromocao(texto) {
  if (typeof texto !== 'string') return false;
  const limpo = texto.trim();
  return limpo.length >= 5 && limpo.length <= 150;
}

function atualizarPromocaoNoDOM(elementoTexto, novaMensagem) {
  if (!validarTextoPromocao(novaMensagem)) {
    return false;
  }
  elementoTexto.textContent = novaMensagem.trim();
  return true;
}

if (typeof document !== 'undefined') {
  const formPromocao = document.getElementById('form-promocao');
  const inputNovaPromocao = document.getElementById('nova-promocao');
  const textoPromocao = document.getElementById('texto-promocao');

  if (formPromocao) {
    formPromocao.addEventListener('submit', function (event) {
      event.preventDefault();
      const sucesso = atualizarPromocaoNoDOM(textoPromocao, inputNovaPromocao.value);
      if (!sucesso) {
        alert('A promoção deve ter entre 5 e 150 caracteres.');
        return;
      }
      inputNovaPromocao.value = '';
      alert('Promoção atualizada com sucesso!');
    });
  }
}

if (typeof module !== 'undefined') {
  module.exports = { validarTextoPromocao, atualizarPromocaoNoDOM };
}
