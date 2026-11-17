const formPromocao = document.getElementById('form-promocao');
const inputNovaPromocao = document.getElementById('nova-promocao');
const textoPromocao = document.getElementById('texto-promocao');

formPromocao.addEventListener('submit', function (event) {
  event.preventDefault();

  const novaMensagem = inputNovaPromocao.value.trim();

  if (novaMensagem.length < 5) {
    alert('Por favor, digite uma descrição válida para a promoção.');
    return;
  }

  textoPromocao.textContent = novaMensagem;
  inputNovaPromocao.value = '';
  alert('Promoção atualizada com sucesso!');
});
