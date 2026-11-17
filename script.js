// Regras de negócio puras (testáveis via Node.js e usadas no navegador)
function validarPromocao(titulo, dataInicio, dataFim, dataHoje) {
  if (typeof titulo !== 'string' || titulo.trim().length < 3) {
    return { valido: false, erro: 'Informe um título válido para a promoção (mínimo 3 caracteres).' };
  }
  if (!dataInicio || !dataFim) {
    return { valido: false, erro: 'As datas de início e de fim são obrigatórias.' };
  }
  if (dataFim < dataInicio) {
    return { valido: false, erro: 'A data de fim não pode ser anterior à data de início.' };
  }
  if (dataHoje && dataFim < dataHoje) {
    return { valido: false, erro: 'A data de fim não pode já ter passado.' };
  }
  return { valido: true, erro: '' };
}

function filtrarPromocoesAtivas(promocoes, dataHoje) {
  return promocoes.filter(function (promo) {
    return promo.dataInicio <= dataHoje && promo.dataFim >= dataHoje;
  });
}

function gerarTextoWhatsApp(promo, urlPublica) {
  return (
    '🍔 *Promoção no Latinus!*\n' +
    '*' + promo.titulo.trim() + '*\n' +
    (promo.descricao ? promo.descricao.trim() + '\n' : '') +
    '📅 Válida de ' + promo.dataInicio + ' até ' + promo.dataFim + '\n' +
    '📍 Setor Comercial do Condomínio — Veja o cardápio completo: ' + urlPublica
  );
}

// Lógica de interface (executa apenas no navegador)
if (typeof document !== 'undefined') {
  const hojeISO = new Date().toISOString().split('T')[0];
  const urlPublicaExemplo = 'https://exemplo.com';

  let promocoesCadastradas = [
    {
      titulo: 'Combo Lanche + Refri',
      descricao: 'X-Burger com batata e refrigerante por R$ 25,00.',
      dataInicio: hojeISO,
      dataFim: '2026-12-31'
    }
  ];

  // Alternar Alto Contraste (Acessibilidade)
  const btnContraste = document.getElementById('btn-contraste');
  btnContraste.addEventListener('click', function () {
    const ativo = document.body.classList.toggle('alto-contraste');
    btnContraste.setAttribute('aria-pressed', String(ativo));
    btnContraste.textContent = ativo ? 'Contraste Normal' : 'Alto Contraste';
  });

  // Alternar entre Página Pública e Painel do Proprietário
  const viewPublica = document.getElementById('view-publica');
  const viewPainel = document.getElementById('view-painel');
  const btnAlternarVisao = document.getElementById('btn-alternar-visao');

  btnAlternarVisao.addEventListener('click', function () {
    const mostrandoPainel = !viewPainel.classList.contains('oculto');
    if (mostrandoPainel) {
      viewPainel.classList.add('oculto');
      viewPublica.classList.remove('oculto');
      btnAlternarVisao.textContent = 'Painel do Proprietário';
      renderizarPromocoesPublicas();
    } else {
      viewPublica.classList.add('oculto');
      viewPainel.classList.remove('oculto');
      btnAlternarVisao.textContent = 'Ver Página Pública';
    }
  });

  // Renderizar promoções vigentes na Página Pública
  function renderizarPromocoesPublicas() {
    const container = document.getElementById('lista-promocoes-publica');
    const ativas = filtrarPromocoesAtivas(promocoesCadastradas, hojeISO);
    container.innerHTML = '';

    if (ativas.length === 0) {
      container.textContent = 'Nenhuma promoção ativa no momento. Confira nosso cardápio abaixo!';
      return;
    }

    ativas.forEach(function (promo) {
      const div = document.createElement('div');
      div.className = 'alerta-sucesso';
      const strong = document.createElement('strong');
      strong.textContent = promo.titulo;
      const pDesc = document.createElement('p');
      pDesc.textContent = promo.descricao;
      const small = document.createElement('small');
      small.textContent = 'Válida até: ' + promo.dataFim;

      div.appendChild(strong);
      div.appendChild(pDesc);
      div.appendChild(small);
      container.appendChild(div);
    });
  }

  renderizarPromocoesPublicas();

  // Navegação das 3 telas do Painel
  const telaLogin = document.getElementById('tela-login');
  const telaMenu = document.getElementById('tela-menu');
  const telaNovaPromocao = document.getElementById('tela-nova-promocao');
  const telaDivulgar = document.getElementById('tela-divulgar');

  function mostrarTelaPainel(telaAlvo) {
    [telaLogin, telaMenu, telaNovaPromocao, telaDivulgar].forEach(function (t) {
      t.classList.add('oculto');
    });
    telaAlvo.classList.remove('oculto');
  }

  // Tela 1: Login
  document.getElementById('form-login').addEventListener('submit', function (e) {
    e.preventDefault();
    const usuario = document.getElementById('login-usuario').value.trim();
    const senha = document.getElementById('login-senha').value;
    const erroLogin = document.getElementById('erro-login');

    if (usuario === 'dono.latinus' && senha.length >= 6) {
      erroLogin.classList.add('oculto');
      mostrarTelaPainel(telaMenu);
    } else {
      erroLogin.classList.remove('oculto');
    }
  });

  document.getElementById('btn-sair').addEventListener('click', function () {
    mostrarTelaPainel(telaLogin);
  });

  document.getElementById('btn-ir-nova-promocao').addEventListener('click', function () {
    document.getElementById('promo-inicio').value = hojeISO;
    document.getElementById('erro-promocao').classList.add('oculto');
    mostrarTelaPainel(telaNovaPromocao);
  });

  document.getElementById('btn-ir-produtos').addEventListener('click', function () {
    alert('Módulo de produtos disponível no cardápio principal (escopo priorizado em promoções).');
  });

  document.getElementById('btn-ir-divulgar').addEventListener('click', function () {
    prepararTelaDivulgar(promocoesCadastradas[promocoesCadastradas.length - 1]);
    mostrarTelaPainel(telaDivulgar);
  });

  document.getElementById('btn-voltar-menu-1').addEventListener('click', function () {
    mostrarTelaPainel(telaMenu);
  });

  document.getElementById('btn-cancelar-promocao').addEventListener('click', function () {
    mostrarTelaPainel(telaMenu);
  });

  document.getElementById('btn-voltar-menu-2').addEventListener('click', function () {
    mostrarTelaPainel(telaMenu);
  });

  // Tela 2: Cadastro de Nova Promoção
  document.getElementById('form-promocao').addEventListener('submit', function (e) {
    e.preventDefault();
    const inputTitulo = document.getElementById('promo-titulo');
    const inputDesc = document.getElementById('promo-descricao');
    const inputInicio = document.getElementById('promo-inicio');
    const inputFim = document.getElementById('promo-fim');
    const boxErro = document.getElementById('erro-promocao');

    inputFim.classList.remove('campo-invalido');
    const resultado = validarPromocao(inputTitulo.value, inputInicio.value, inputFim.value, hojeISO);

    if (!resultado.valido) {
      boxErro.textContent = '⚠️ ' + resultado.erro;
      boxErro.classList.remove('oculto');
      inputFim.classList.add('campo-invalido');
      inputFim.focus();
      return;
    }

    boxErro.classList.add('oculto');
    const novaPromo = {
      titulo: inputTitulo.value.trim(),
      descricao: inputDesc.value.trim(),
      dataInicio: inputInicio.value,
      dataFim: inputFim.value
    };

    promocoesCadastradas.push(novaPromo);
    prepararTelaDivulgar(novaPromo);
    mostrarTelaPainel(telaDivulgar);
  });

  // Tela 3: Divulgação
  function prepararTelaDivulgar(promo) {
    document.getElementById('resumo-promo-salva').textContent =
      promo.titulo + ' — Válida de ' + promo.dataInicio + ' a ' + promo.dataFim;
    document.getElementById('texto-whatsapp').value = gerarTextoWhatsApp(promo, urlPublicaExemplo);
    document.getElementById('box-qrcode').classList.add('oculto');
  }

  document.getElementById('btn-copiar-whatsapp').addEventListener('click', function () {
    const texto = document.getElementById('texto-whatsapp').value;
    if (navigator.clipboard) navigator.clipboard.writeText(texto);
    alert('Texto pronto copiado! Cole no grupo de WhatsApp dos moradores.');
  });

  document.getElementById('btn-copiar-link').addEventListener('click', function () {
    if (navigator.clipboard) navigator.clipboard.writeText(urlPublicaExemplo);
    alert('Link da página pública copiado: ' + urlPublicaExemplo);
  });

  document.getElementById('btn-ver-qrcode').addEventListener('click', function () {
    const boxQr = document.getElementById('box-qrcode');
    const imgQr = document.getElementById('img-qrcode');
    imgQr.src = 'https://qrserver.com' + encodeURIComponent(urlPublicaExemplo);
    boxQr.classList.remove('oculto');
  });
}

if (typeof module !== 'undefined') {
  module.exports = { validarPromocao, filtrarPromocoesAtivas, gerarTextoWhatsApp };
}
