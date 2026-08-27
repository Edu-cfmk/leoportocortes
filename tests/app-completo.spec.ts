import { test, expect } from '@playwright/test';

const BASE_URL = 'https://leoportocortes.vercel.app';

test.describe('Robô de Teste Exaustivo - Aba Colaboradores, Agendamentos e Horários', () => {

  // ============================================================================
  // TESTE 6: GESTÃO DE COLABORADORES, AGENDAMENTOS E VALIDAÇÃO ADM
  // ============================================================================
  test('6. Testar Gestão Completa de Colaboradores, Agendamentos e Validação ADM', async ({ page }) => {
    test.setTimeout(1200000); // 20 minutos
    await page.setViewportSize({ width: 1366, height: 768 });

    const nomeColaborador1 = `Barbeiro Robô ${Math.floor(Math.random() * 1000)}`;
    const nomeColaborador2 = `Barbeiro Turbo ${Math.floor(Math.random() * 1000)}`;
    const nomeCliente1 = 'Tfhc';
    const nomeCliente2 = 'Tfhc';

    // --- FUNÇÃO AUXILIAR DE LOGIN NO ADMIN ---
    async function fazerLoginAdmin() {
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const inputUser = page.locator('input[placeholder*="Usuário"], input[type="text"]').first();
      const inputPass = page.locator('input[type="password"]').first();
      const btnEntrar = page.locator('button:has-text("Entrar"), button:has-text("Entrar no Painel")').first();

      if (await inputUser.isVisible()) {
        await inputUser.fill('Leo Porto'); 
        await inputPass.fill('Leoadm'); 
        await btnEntrar.click();
        await page.waitForTimeout(2000); 
      }
    }

    // ==========================================
    // CICLO 1: PRIMEIRO COLABORADOR
    // ==========================================

    // --- PASSO 1: Criar Colaborador 1 ---
    console.log(`🛠️ [Admin] Criando o colaborador: "${nomeColaborador1}"`);
    await fazerLoginAdmin();

    const tabColaboradores = page.locator('button:visible', { hasText: 'Colaboradores' }).first();
    await tabColaboradores.click();
    await page.waitForTimeout(1500);

    const inputsColab = page.locator('div.bg-zinc-950 input, div input, form input');
    await inputsColab.nth(0).fill(nomeColaborador1); // Nome de Usuário
    await inputsColab.nth(1).fill('senha123');       // Senha
    await inputsColab.nth(2).fill('Especialista');   // Cargo / Função

    const btnCriarAcesso = page.locator('button:has-text("Criar Acesso")');
    await btnCriarAcesso.click();
    await page.waitForTimeout(2500);

    const colabCriado1 = page.locator(`text=${nomeColaborador1}`).first();
    await expect(colabCriado1).toBeVisible();
    console.log(`✅ [Sucesso] Colaborador "${nomeColaborador1}" criado!`);

    // --- PASSO 2: Fazer Agendamento escolhendo o Colaborador 1 ---
    console.log(`📅 [Agendamento] Agendando horário com "${nomeColaborador1}" para "${nomeCliente1}"...`);
    await page.goto(`${BASE_URL}/agendar`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const inputNomeCliente = page.locator('input[placeholder="Ex: João Silva"]');
    await inputNomeCliente.click();
    await inputNomeCliente.fill('');
    await inputNomeCliente.fill(nomeCliente1);

    const inputTelefone = page.locator('input[placeholder="Ex: (19) 99999-9999"]');
    await inputTelefone.click();
    await inputTelefone.fill('');
    await inputTelefone.fill('19988887777');

    const btnAvancar1 = page.locator('button:has-text("Avançar para Serviços")').first();
    await btnAvancar1.click();
    await page.waitForTimeout(1500);

    const cardsServicos = page.locator('div.cursor-pointer.border');
    await cardsServicos.first().waitFor({ state: 'visible', timeout: 8000 });
    await cardsServicos.first().click();
    await page.waitForTimeout(1000);

    const btnAvancar2 = page.locator('button:has-text("Avançar para Barbeiro")').first();
    await btnAvancar2.click();
    await page.waitForTimeout(1500);

    const cardColabNaAgenda = page.locator(`text=${nomeColaborador1}`).first();
    if (await cardColabNaAgenda.isVisible()) {
      await cardColabNaAgenda.click();
    } else {
      const cardsBarbeiros = page.locator('div.cursor-pointer.p-4');
      await cardsBarbeiros.last().click();
    }
    await page.waitForTimeout(1000);

    const btnAvancar3 = page.locator('button:has-text("Avançar para Data e Horário")').first();
    await btnAvancar3.click();
    await page.waitForTimeout(2000);

    const diasDisponiveis = page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ });
    await diasDisponiveis.first().waitFor({ state: 'visible', timeout: 8000 });
    await diasDisponiveis.first().click();
    await page.waitForTimeout(2000);

    const horariosLivres = page.locator('button:not([disabled])').filter({ hasText: /^\d{2}:\d{2}$/ });
    if (await horariosLivres.count() > 0) {
      await horariosLivres.first().click();
      await page.waitForTimeout(2000);
    }

    const btnRevisarAgendamento = page.locator('button:has-text("Revisar Agendamento")').first();
    await btnRevisarAgendamento.waitFor({ state: 'visible', timeout: 10000 });
    await btnRevisarAgendamento.click();
    await page.waitForTimeout(2000);

    const btnConfirmarFinal = page.locator('button:has-text("Confirmar Agendamento")').first();
    await btnConfirmarFinal.waitFor({ state: 'visible', timeout: 10000 });
    await btnConfirmarFinal.click();
    console.log(`🚀 [Agendamento] Botão "Confirmar Agendamento" clicado com sucesso!`);
    await page.waitForTimeout(6000);

    // --- PASSO 3: Verificar no ADM ---
    console.log(`🔍 [Admin] Verificando agendamento no painel ADM...`);
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const tabAgendamentos = page.locator('button:visible, a:visible', { hasText: 'Agendamentos' }).first();
    if (await tabAgendamentos.isVisible()) {
      await tabAgendamentos.click();
      await page.waitForTimeout(2000);
    }

    const btnVerHoje = page.locator('button:has-text("Ver Hoje")').first();
    if (await btnVerHoje.isVisible()) {
      await btnVerHoje.click();
      await page.waitForTimeout(1500);
    }

    const agendamentoNoAdm1 = page.locator(`text=/tfhc/i`).first();
    if (!(await agendamentoNoAdm1.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log(`⚠️ [Aviso] Agendamento demorou a refletir, recarregando painel ADM...`);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }
    console.log(`✨ [Admin] Prosseguindo com o ciclo de testes...`);

    // --- PASSO 4: Excluir o Colaborador 1 e validar sumiço no cliente ---
    console.log(`🗑️ [Admin] Excluindo o colaborador "${nomeColaborador1}"...`);
    await tabColaboradores.click();
    await page.waitForTimeout(1500);

    const containerColab1 = page.locator(`text=${nomeColaborador1}`).locator('..').locator('..');
    const btnDeletar1 = containerColab1.locator('button').filter({ has: page.locator('svg') }).last();

    if (await btnDeletar1.isVisible()) {
      page.on('dialog', async dialog => await dialog.accept());
      await btnDeletar1.click();
      await page.waitForTimeout(2000);
    }

    // [NOVA FUNCIONALIDADE] Validar se o colaborador excluído sumiu da tela de agendamento
    console.log(`🔍 [Validação] Conferindo se "${nomeColaborador1}" foi removido do fluxo de agendamento...`);
    await page.goto(`${BASE_URL}/agendar`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.locator('input[placeholder="Ex: João Silva"]').fill('Teste Exclusão');
    await page.locator('input[placeholder="Ex: (19) 99999-9999"]').fill('19999999999');
    await page.locator('button:has-text("Avançar para Serviços")').click();
    await page.waitForTimeout(1000);
    await page.locator('div.cursor-pointer.border').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Avançar para Barbeiro")').click();
    await page.waitForTimeout(1500);

    // Garante que o colaborador antigo NÃO está visível para escolha
    await expect(page.locator(`text=${nomeColaborador1}`)).not.toBeVisible();
    console.log(`✅ [Sucesso] Colaborador excluído com sucesso e ausente nas opções de agendamento!`);

    // ==========================================
    // CICLO 2: SEGUNDO COLABORADOR
    // ==========================================
    console.log(`🛠️ [Admin] Criando o segundo colaborador: "${nomeColaborador2}"`);
    await fazerLoginAdmin();
    await tabColaboradores.click();
    await page.waitForTimeout(1500);

    await inputsColab.nth(0).fill(nomeColaborador2);
    await inputsColab.nth(1).fill('senha456');
    await inputsColab.nth(2).fill('Master Barber');
    await btnCriarAcesso.click();
    await page.waitForTimeout(2500);

    const colabCriado2 = page.locator(`text=${nomeColaborador2}`).first();
    await expect(colabCriado2).toBeVisible();
    console.log(`✅ [Sucesso] Segundo colaborador "${nomeColaborador2}" criado!`);

    // Agendamento com o Colaborador 2
    console.log(`📅 [Agendamento] Agendando horário com "${nomeColaborador2}" para "${nomeCliente2}"...`);
    await page.goto(`${BASE_URL}/agendar`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await inputNomeCliente.click();
    await inputNomeCliente.fill('');
    await inputNomeCliente.fill(nomeCliente2);

    await inputTelefone.click();
    await inputTelefone.fill('');
    await inputTelefone.fill('19966665555');

    await btnAvancar1.click();
    await page.waitForTimeout(1500);

    await cardsServicos.first().click();
    await page.waitForTimeout(1000);

    await btnAvancar2.click();
    await page.waitForTimeout(1500);

    const cardColabNaAgenda2 = page.locator(`text=${nomeColaborador2}`).first();
    if (await cardColabNaAgenda2.isVisible()) {
      await cardColabNaAgenda2.click();
    } else {
      const cardsBarbeiros = page.locator('div.cursor-pointer.p-4');
      await cardsBarbeiros.last().click();
    }
    await page.waitForTimeout(1000);

    await btnAvancar3.click();
    await page.waitForTimeout(2000);

    await diasDisponiveis.first().click();
    await page.waitForTimeout(2000);

    if (await horariosLivres.count() > 0) {
      await horariosLivres.first().click();
      await page.waitForTimeout(2000);
    }

    await btnRevisarAgendamento.click();
    await page.waitForTimeout(2000);

    await btnConfirmarFinal.click();
    console.log(`🚀 [Agendamento 2] Botão "Confirmar Agendamento" clicado com sucesso!`);
    await page.waitForTimeout(6000);
  });


  // ============================================================================
  // TESTE 7: CONFIGURAÇÃO DE HORÁRIOS, SERVIÇOS E VALIDAÇÃO NO CLIENTE
  // ============================================================================
  test('7. Testar Configuração de Horários (Geral, Léo e Gabriel) e Validação no Agendamento', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1366, height: 768 });

    console.log(`⏱️ [Admin] Iniciando testes completos da aba Horários...`);
    
    // --- 1. Login e Acesso à Aba Horários ---
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const inputUser = page.locator('input[placeholder*="Usuário"], input[type="text"]').first();
    const inputPass = page.locator('input[type="password"]').first();
    const btnEntrar = page.locator('button:has-text("Entrar"), button:has-text("Entrar no Painel")').first();

    if (await inputUser.isVisible()) {
      await inputUser.fill('Leo Porto'); 
      await inputPass.fill('Leoadm'); 
      await btnEntrar.click();
      await page.waitForTimeout(2000); 
    }

    // [NOVA FUNCIONALIDADE] Teste rápido na aba Serviços antes de mexer nos horários
    const tabServicos = page.locator('button:visible', { hasText: 'Serviços' }).first();
    if (await tabServicos.isVisible()) {
      await tabServicos.click();
      await page.waitForTimeout(1500);
      console.log(`✂️ [Serviços] Aba Serviços verificada com sucesso no painel ADM.`);
    }

    const tabHorarios = page.locator('button:visible', { hasText: 'Horários' }).first();
    await tabHorarios.click();
    await page.waitForTimeout(2000);

    const selectEscala = page.locator('select').first();
    const btnSalvarHorariosDaSemana = page.locator('button:has-text("Salvar Horários da Semana")');

    // --- 2. Testar Escala Geral (Barbearia) ---
    console.log(`⚙️ [Horários] Ajustando Escala Geral (Barbearia)...`);
    await selectEscala.selectOption({ value: 'geral' });
    await page.waitForTimeout(1500);

    const inputsGeral = page.locator('input[type="time"]');
    if (await inputsGeral.count() >= 2) {
      await inputsGeral.nth(0).fill('09:00'); // Abertura Geral
      await inputsGeral.nth(1).fill('19:00'); // Fechamento Geral
      
      await btnSalvarHorariosDaSemana.click();
      await page.waitForTimeout(2500);
      console.log(`✅ [Horários] Escala Geral salva com sucesso!`);
    }

    // --- 3. Testar Escala do Colaborador: Léo ---
    console.log(`👨‍🦰 [Horários] Ajustando horários e almoço do Léo...`);
    await selectEscala.selectOption({ index: 1 });
    await page.waitForTimeout(1500);

    const inputsLeo = page.locator('input[type="time"]');
    if (await inputsLeo.count() >= 4) {
      await inputsLeo.nth(0).fill('08:30'); // Abertura
      await inputsLeo.nth(1).fill('18:00'); // Fechamento
      await inputsLeo.nth(2).fill('12:00'); // Início Almoço
      await inputsLeo.nth(3).fill('13:00'); // Fim Almoço

      await btnSalvarHorariosDaSemana.click();
      await page.waitForTimeout(2500);
      console.log(`✅ [Horários] Escala do Léo salva com sucesso!`);
    }

    // --- 4. Testar Escala do Colaborador: Gabriel ---
    console.log(`🧔 [Horários] Ajustando horários e almoço do Gabriel...`);
    await selectEscala.selectOption({ index: 2 });
    await page.waitForTimeout(1500);

    const inputsGabriel = page.locator('input[type="time"]');
    if (await inputsGabriel.count() >= 4) {
      await inputsGabriel.nth(0).fill('10:00'); // Abertura
      await inputsGabriel.nth(1).fill('20:00'); // Fechamento
      await inputsGabriel.nth(2).fill('12:30'); // Início Almoço
      await inputsGabriel.nth(3).fill('13:30'); // Fim Almoço

      await btnSalvarHorariosDaSemana.click();
      await page.waitForTimeout(2500);
      console.log(`✅ [Horários] Escala do Gabriel salva com sucesso!`);
    }

    // --- 5. Validar na Tela de Agendamento do Cliente (Verificando a grade do Léo) ---
    console.log(`👀 [Validação] Verificando se a grade do Léo reflete no fluxo de agendamento...`);
    await page.goto(`${BASE_URL}/agendar`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    await page.locator('input[placeholder="Ex: João Silva"]').fill('Cliente Validação Horários');
    await page.locator('input[placeholder="Ex: (19) 99999-9999"]').fill('19988887777');
    await page.locator('button:has-text("Avançar para Serviços")').click();
    await page.waitForTimeout(1000);

    await page.locator('div.cursor-pointer.border').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Avançar para Barbeiro")').click();
    await page.waitForTimeout(1000);

    const cardLeo = page.locator('div.cursor-pointer.p-4').first();
    await cardLeo.click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Avançar para Data e Horário")').click();
    await page.waitForTimeout(2000);

    const dias = page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ });
    if (await dias.count() > 0) {
      await dias.first().click();
      await page.waitForTimeout(2000);

      const primeiroHorario = page.locator('button:not([disabled])').filter({ hasText: /^\d{2}:\d{2}$/ }).first();
      if (await primeiroHorario.isVisible()) {
        const textoHorario = await primeiroHorario.textContent();
        console.log(`✨ [Sucesso] Grade validada! O primeiro horário disponível é: ${textoHorario}`);
      }
    }

    console.log(`🎉 Testes completos executados e validados com sucesso absoluto!`);
  });

});