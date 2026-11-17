const formPromocao = document.getElementById('form-promocao');
const inputNovaPromocao = document.getElementById('nova-promocao');
const textoPromocao = document.getElementById('texto-promocao');

function validarTextoPromocao(texto) {
  return texto.length >= 5 && texto.length <= 150;
}

formPromocao.addEventListener('submit', function (event) {
  event.preventDefault();

  const novaMensagem = inputNovaPromocao.value.trim();

  if (!validarTextoPromocao(novaMensagem)) {
    alert('A promoção deve ter entre 5 e 150 caracteres.');
    return;
  }

  textoPromocao.textContent = novaMensagem;
  inputNovaPromocao.value = '';
  alert('Promoção atualizada com sucesso!');
});
