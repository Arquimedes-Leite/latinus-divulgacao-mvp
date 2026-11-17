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
    '🌭 *Promoção no Hot Dog Latinus!*\n' +
    '*' + promo.titulo.trim() + '*\n' +
    (promo.descricao ? promo.descricao.trim() + '\n' : '') +
    '📅 Válida de ' + promo.dataInicio + ' até ' + promo.dataFim + '\n' +
    '📍 SH Jardins Cond. Mansões Entrelagos Etapa 2, CL 2 Lote 20 — Peça no iFood: ' + urlPublica
  );
}

function validarContaGoogle(email) {
  if (typeof email !== 'string') return false;
  const limpo = email.trim().toLowerCase();
  return /^[^\s@]+@(gmail\.com|googlemail\.com)$/.test(limpo);
}

function calcularDireitoLancheGratis(comprasNoCadastro) {
  const compras = Math.max(0, Number(comprasNoCadastro) || 0);
  const temDireitoGratis = compras >= 10;
  return {
    comprasRegistradas: compras,
    faltam: temDireitoGratis ? 0 : 10 - compras,
    lancheGratisDisponivel: temDireitoGratis
  };
}

// Lógica de interface (executa apenas no navegador)
if (typeof document !== 'undefined') {
  const hojeISO = new Date().toISOString().split('T');
  const urlIfoodOficial = 'https://ifood.com.br';

  let promocoesCadastradas = [
    {
      titulo: 'Combo Hot Dog Duplo + Refri Lata',
      descricao: 'Hot Dog Duplo Especial completo + refrigerante 350ml por R$ 22,00. Entrega no Entrelagos e iFood!',
      dataInicio: hojeISO,
      dataFim: '2026-12-31'
    }
  ];

  // Estado da conta do cliente (inicia com 0 compras no cadastro)
  let clienteLogado = null;
  let comprasCliente = 0;

  // Alternar Alto Contraste (Acessibilidade)
  const btnContraste = document.getElementById('btn-contraste');
  if (btnContraste) {
    btnContraste.addEventListener('click', function () {
      const ativo = document.body.classList.toggle('alto-contraste');
      btnContraste.setAttribute('aria-pressed', String(ativo));
      btnContraste.textContent = ativo ? 'Contraste Normal' : 'Alto Contraste';
    });
  }

  // Controle das 3 visões principais (Pública, Conta Cliente, Painel Proprietário)
  const viewPublica = document.getElementById('view-publica');
  const viewClienteAuth = document.getElementById('view-cliente-auth');
  const viewPainel = document.getElementById('view-painel');
  const btnAlternarVisao = document.getElementById('btn-alternar-visao');

  function mostrarVisaoPrincipal(visao) {
    [viewPublica, viewClienteAuth, viewPainel].forEach(function (v) {
      if (v) v.classList.add('oculto');
    });
    if (visao) visao.classList.remove('oculto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (btnAlternarVisao) {
    btnAlternarVisao.addEventListener('click', function () {
      const mostrandoPainel = !viewPainel.classList.contains('oculto');
      if (mostrandoPainel) {
        mostrarVisaoPrincipal(viewPublica);
        btnAlternarVisao.textContent = 'Painel do Proprietário';
        renderizarPromocoesPublicas();
      } else {
        mostrarVisaoPrincipal(viewPainel);
        btnAlternarVisao.textContent = 'Ver Página Pública';
      }
    });
  }

  // ==================== FIDELIDADE (10 COMPRAS NO CADASTRO = 1 GRÁTIS) ====================
  function atualizarPainelFidelidade() {
    const grid = document.getElementById('grid-moedas');
    const textoProgresso = document.getElementById('texto-progresso-moedas');
    const statusCliente = document.getElementById('status-cliente-fidelidade');
    const btnResgatar = document.getElementById('btn-resgatar-gratis');
    if (!grid) return;

    grid.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
      const slot = document.createElement('div');
      slot.className = 'moeda-slot';
      if (i <= comprasCliente) {
        slot.classList.add('ativa');
        slot.textContent = i === 10 ? '🎁' : '🪙 ' + i;
      } else {
        if (i === 10) slot.classList.add('premio');
        slot.textContent = i === 10 ? '🎁 GRÁTIS' : String(i);
      }
      grid.appendChild(slot);
    }

    const status = calcularDireitoLancheGratis(comprasCliente);
    if (clienteLogado) {
      statusCliente.textContent = 'Cliente: ' + clienteLogado.nome + ' (' + clienteLogado.provedor + ')';
    } else {
      statusCliente.textContent = 'Faça login para registrar suas compras';
    }

    if (status.lancheGratisDisponivel) {
      textoProgresso.innerHTML = '<strong>🎉 Você atingiu 10 compras no seu cadastro e ganhou o direito a 1 Hot Dog Tradicional GRÁTIS!</strong>';
      btnResgatar.classList.remove('oculto');
    } else {
      textoProgresso.innerHTML = '<strong>' + comprasCliente + ' de 10 compras</strong> registradas no cadastro (faltam ' + status.faltam + ' compras para o lanche grátis).';
      btnResgatar.classList.add('oculto');
    }
  }

  atualizarPainelFidelidade();

  // Botões de compra no cardápio para somar compras no cadastro
  document.querySelectorAll('.btn-comprar-moeda').forEach(function (botao) {
    botao.addEventListener('click', function () {
      if (!clienteLogado) {
        alert('Crie uma conta ou entre com o Google primeiro para registrar suas compras no cadastro!');
        mostrarVisaoPrincipal(viewClienteAuth);
        return;
      }
      const lanche = botao.getAttribute('data-lanche');
      comprasCliente += 1;
      atualizarPainelFidelidade();
      if (comprasCliente === 10) {
        alert('🎉 Compra 10/10 registrada (' + lanche + ')! Você ganhou o direito a 1 lanche grátis!');
      } else {
        alert('Compra registrada no seu cadastro: ' + lanche + ' (' + comprasCliente + '/10 compras).');
      }
    });
  });

  // Resgatar lanche grátis ao atingir 10 compras no cadastro
  const btnResgatarGratis = document.getElementById('btn-resgatar-gratis');
  if (btnResgatarGratis) {
    btnResgatarGratis.addEventListener('click', function () {
      if (comprasCliente >= 10) {
        comprasCliente -= 10;
        atualizarPainelFidelidade();
        alert('🎉 Voucher de Lanche Grátis gerado: LAT-10COMPRAS! Apresente no balcão ou no WhatsApp do Hot Dog Latinus para retirar seu lanche grátis.');
      }
    });
  }

  // ==================== CONTA CLIENTE & VALIDAÇÃO GOOGLE ====================
  const btnAbrirContaCliente = document.getElementById('btn-abrir-conta-cliente');
  const btnAbrirAuthFidelidade = document.getElementById('btn-abrir-auth-fidelidade');
  const btnFecharAuthCliente = document.getElementById('btn-fechar-auth-cliente');

  if (btnAbrirContaCliente) btnAbrirContaCliente.addEventListener('click', function () { mostrarVisaoPrincipal(viewClienteAuth); });
  if (btnAbrirAuthFidelidade) btnAbrirAuthFidelidade.addEventListener('click', function () { mostrarVisaoPrincipal(viewClienteAuth); });
  if (btnFecharAuthCliente) btnFecharAuthCliente.addEventListener('click', function () { mostrarVisaoPrincipal(viewPublica); });

  // Login com Google + Validação de e-mail @gmail.com (inicia com 0 compras)
  const btnLoginGoogle = document.getElementById('btn-login-google');
  const boxGoogleModal = document.getElementById('box-google-modal');
  const btnConfirmarGoogle = document.getElementById('btn-confirmar-google');

  if (btnLoginGoogle && boxGoogleModal) {
    btnLoginGoogle.addEventListener('click', function () {
      boxGoogleModal.classList.toggle('oculto');
    });
  }

  if (btnConfirmarGoogle) {
    btnConfirmarGoogle.addEventListener('click', function () {
      const emailGoogle = document.getElementById('google-email-input').value.trim();
      const erroGoogle = document.getElementById('erro-google');

      if (!validarContaGoogle(emailGoogle)) {
        erroGoogle.textContent = '⚠️ Informe uma conta Google válida terminada em @gmail.com.';
        erroGoogle.classList.remove('oculto');
        return;
      }

      erroGoogle.classList.add('oculto');
      const nomeExtraido = emailGoogle.split('@');
      clienteLogado = { nome: nomeExtraido, email: emailGoogle, provedor: 'Google' };
      comprasCliente = 0;
      atualizarPainelFidelidade();
      mostrarVisaoPrincipal(viewPublica);
      alert('Login com Google validado! Faça 10 compras pelo site para ganhar 1 lanche grátis.');
    });
  }

  // Abas Criar Conta / Entrar (inicia com 0 compras)
  const tabCriarConta = document.getElementById('tab-criar-conta');
  const tabEntrarConta = document.getElementById('tab-entrar-conta');
  const formCriarConta = document.getElementById('form-criar-conta');
  const formEntrarCliente = document.getElementById('form-entrar-cliente');

  if (tabCriarConta && tabEntrarConta) {
    tabCriarConta.addEventListener('click', function () {
      formCriarConta.classList.remove('oculto');
      formEntrarCliente.classList.add('oculto');
      tabCriarConta.className = 'btn-mostarda';
      tabEntrarConta.className = 'btn-contorno';
    });
    tabEntrarConta.addEventListener('click', function () {
      formEntrarCliente.classList.remove('oculto');
      formCriarConta.classList.add('oculto');
      tabEntrarConta.className = 'btn-mostarda';
      tabCriarConta.className = 'btn-contorno';
    });
  }

if (formCriarConta) {
formCriarConta.addEventListener('submit', function (e) {
e.preventDefault();
const nome = document.getElementById('cad-nome').value.trim();
const email = document.getElementById('cad-email').value.trim();
const senha = document.getElementById('cad-senha').value;
const erroCad = document.getElementById('erro-cadastro-cliente');
if (nome.length < 3 || !email.includes('@') || senha.length < 6) {
erroCad.textContent = '⚠️ Preencha nome válido, e-mail e senha com pelo menos 6 caracteres.';
erroCad.classList.remove('oculto');
return;
}
erroCad.classList.add('oculto');
clienteLogado = { nome: nome, email: email, provedor: 'Cadastro Direto' };
comprasCliente = 0;
atualizarPainelFidelidade();
mostrarVisaoPrincipal(viewPublica);
alert('Conta criada com sucesso! Complete 10 compras no seu cadastro para ganhar 1 lanche grátis.');
});
}
if (formEntrarCliente) {
formEntrarCliente.addEventListener('submit', function (e) {
e.preventDefault();
const email = document.getElementById('entrar-email').value.trim();
const senha = document.getElementById('entrar-senha').value;
const erroEntrar = document.getElementById('erro-entrar-cliente');
if (!email.includes('@') || senha.length < 6) {
erroEntrar.textContent = '⚠️ E-mail ou senha inválidos.';
erroEntrar.classList.remove('oculto');
return;
}
erroEntrar.classList.add('oculto');
clienteLogado = { nome: email.split('@'), email: email, provedor: 'E-mail' };
atualizarPainelFidelidade();
mostrarVisaoPrincipal(viewPublica);
});
}
// ==================== PROMOÇÕES E PAINEL DO PROPRIETÁRIO ====================
function renderizarPromocoesPublicas() {
const container = document.getElementById('lista-promocoes-publica');
if (!container) return;
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
const telaLogin = document.getElementById('tela-login');
const telaMenu = document.getElementById('tela-menu');
const telaNovaPromocao = document.getElementById('tela-nova-promocao');
const telaDivulgar = document.getElementById('tela-divulgar');
function mostrarTelaPainel(telaAlvo) {
[telaLogin, telaMenu, telaNovaPromocao, telaDivulgar].forEach(function (t) {
if (t) t.classList.add('oculto');
});
if (telaAlvo) telaAlvo.classList.remove('oculto');
}
const formLogin = document.getElementById('form-login');
if (formLogin) {
formLogin.addEventListener('submit', function (e) {
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
}
const btnSair = document.getElementById('btn-sair');
if (btnSair) btnSair.addEventListener('click', function () { mostrarTelaPainel(telaLogin); });
const btnIrNovaPromocao = document.getElementById('btn-ir-nova-promocao');
if (btnIrNovaPromocao) {
btnIrNovaPromocao.addEventListener('click', function () {
document.getElementById('promo-inicio').value = hojeISO;
document.getElementById('erro-promocao').classList.add('oculto');
mostrarTelaPainel(telaNovaPromocao);
});
}
const btnIrProdutos = document.getElementById('btn-ir-produtos');
if (btnIrProdutos) {
btnIrProdutos.addEventListener('click', function () {
alert('Cardápio sincronizado com o iFood e página pública.');
});
}
const btnIrDivulgar = document.getElementById('btn-ir-divulgar');
if (btnIrDivulgar) {
btnIrDivulgar.addEventListener('click', function () {
prepararTelaDivulgar(promocoesCadastradas[promocoesCadastradas.length - 1]);
mostrarTelaPainel(telaDivulgar);
});
}
const btnVoltarMenu1 = document.getElementById('btn-voltar-menu-1');
if (btnVoltarMenu1) btnVoltarMenu1.addEventListener('click', function () { mostrarTelaPainel(telaMenu); });
const btnCancelarPromocao = document.getElementById('btn-cancelar-promocao');
if (btnCancelarPromocao) btnCancelarPromocao.addEventListener('click', function () { mostrarTelaPainel(telaMenu); });
const btnVoltarMenu2 = document.getElementById('btn-voltar-menu-2');
if (btnVoltarMenu2) btnVoltarMenu2.addEventListener('click', function () { mostrarTelaPainel(telaMenu); });
const formPromocao = document.getElementById('form-promocao');
if (formPromocao) {
formPromocao.addEventListener('submit', function (e) {
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
}
function prepararTelaDivulgar(promo) {
document.getElementById('resumo-promo-salva').textContent =
promo.titulo + ' — Válida de ' + promo.dataInicio + ' a ' + promo.dataFim;
document.getElementById('texto-whatsapp').value = gerarTextoWhatsApp(promo, urlIfoodOficial);
document.getElementById('box-qrcode').classList.add('oculto');
}
const btnCopiarWhatsapp = document.getElementById('btn-copiar-whatsapp');
if (btnCopiarWhatsapp) {
btnCopiarWhatsapp.addEventListener('click', function () {
const texto = document.getElementById('texto-whatsapp').value;
if (navigator.clipboard) navigator.clipboard.writeText(texto);
alert('Texto pronto copiado! Cole no grupo de WhatsApp dos moradores.');
});
}
const btnCopiarLink = document.getElementById('btn-copiar-link');
if (btnCopiarLink) {
btnCopiarLink.addEventListener('click', function () {
if (navigator.clipboard) navigator.clipboard.writeText(urlIfoodOficial);
alert('Link oficial copiado: ' + urlIfoodOficial);
});
}
const btnVerQrcode = document.getElementById('btn-ver-qrcode');
if (btnVerQrcode) {
btnVerQrcode.addEventListener('click', function () {
const boxQr = document.getElementById('box-qrcode');
const imgQr = document.getElementById('img-qrcode');
imgQr.src = 'qrserver.com' + encodeURIComponent(urlIfoodOficial);
boxQr.classList.remove('oculto');
});
}
}
if (typeof module !== 'undefined') {
module.exports = {
validarPromocao,
filtrarPromocoesAtivas,
gerarTextoWhatsApp,
validarContaGoogle,
calcularDireitoLancheGratis
};
}
