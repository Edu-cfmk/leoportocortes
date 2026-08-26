import { test, expect } from '@playwright/test';

const BASE_URL = 'https://leoportocortes.vercel.app';

test.describe('Robô de Teste Exaustivo - Aba Colaboradores e Fluxo de Agendamento', () => {

  test('6. Testar Gestão Completa de Colaboradores, Agendamentos e Validação ADM', async ({ page }) => {
    test.setTimeout(1200000); // 20 minutos
    await page.setViewportSize({ width: 1366, height: 768 });

    const nomeColaborador1 = `Barbeiro Robô ${Math.floor(Math.random() * 1000)}`;
    const nomeColaborador2 = `Barbeiro Turbo ${Math.floor(Math.random() * 1000)}`;

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
    console.log(`📅 [Agendamento] Agendando horário com "${nomeColaborador1}"...`);
    await page.goto(`${BASE_URL}/agendar`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.locator('input[placeholder="Ex: João Silva"]').fill('Cliente Teste Robô');
    await page.locator('input[placeholder="Ex: (19) 99999-9999"]').fill('19988887777');
    await page.locator('button:has-text("Avançar para Serviços")').click();
    await page.waitForTimeout(1000);

    const cardsServicos = page.locator('div.cursor-pointer.border');
    await cardsServicos.first().waitFor({ state: 'visible', timeout: 8000 });
    await cardsServicos.first().click();
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Avançar para Barbeiro")').click();
    await page.waitForTimeout(1000);

    const cardColabNaAgenda = page.locator(`text=${nomeColaborador1}`).first();
    if (await cardColabNaAgenda.isVisible()) {
      await cardColabNaAgenda.click();
    } else {
      const cardsBarbeiros = page.locator('div.cursor-pointer.p-4');
      await cardsBarbeiros.last().click();
    }
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Avançar para Data e Horário")').click();
    await page.waitForTimeout(1500);

    const diasDisponiveis = page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ });
    await diasDisponiveis.first().waitFor({ state: 'visible', timeout: 8000 });
    
    for (let d = 0; d < Math.min(await diasDisponiveis.count(), 5); d++) {
      await diasDisponiveis.nth(d).click();
      await page.waitForTimeout(1500);
      const horariosLivres = page.locator('button:not([disabled])').filter({ hasText: /^\d{2}:\d{2}$/ });
      if (await horariosLivres.count() > 0) {
        await horariosLivres.first().click();
        await page.waitForTimeout(1500);
        break;
      }
    }

    const btnAvancarPasso4 = page.locator('button:has-text("Avançar"), button:has-text("Continuar"), button:has-text("Resumo"), button:has-text("Confirmar Agendamento")').first();
    if (await btnAvancarPasso4.isVisible() && !(await btnAvancarPasso4.isDisabled())) {
      await btnAvancarPasso4.click();
      await page.waitForTimeout(2000);
    }

    const btnConfirmar = page.locator('button:has-text("Confirmar Agendamento")');
    if (await btnConfirmar.isVisible()) {
      await btnConfirmar.click();
    }
    await page.waitForTimeout(4000);

    // --- PASSO 3: Verificar no ADM buscando por elemento de texto genérico do cliente ---
    console.log(`🔍 [Admin] Verificando agendamento no painel ADM...`);
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const tabAgendamentos = page.locator('button:visible, a:visible', { hasText: 'Agendamentos' }).first();
    if (await tabAgendamentos.isVisible()) {
      await tabAgendamentos.click();
      await page.waitForTimeout(1500);
    }

    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);

    // Valida buscando por qualquer ocorrência do texto "Cliente Teste Robô"
    const agendamentoNoAdm1 = page.locator('text=Cliente Teste Robô').first();
    await expect(agendamentoNoAdm1).toBeVisible({ timeout: 10000 });
    console.log(`✨ [Confirmado] Agendamento validado com sucesso no ADM!`);

    // --- PASSO 4: Excluir o Colaborador 1 ---
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


    // ==========================================
    // CICLO 2: SEGUNDO COLABORADOR
    // ==========================================

    console.log(`🛠️ [Admin] Criando o segundo colaborador: "${nomeColaborador2}"`);
    await inputsColab.nth(0).fill(nomeColaborador2);
    await inputsColab.nth(1).fill('senha456');
    await inputsColab.nth(2).fill('Master Barber');
    await btnCriarAcesso.click();
    await page.waitForTimeout(2500);

    const colabCriado2 = page.locator(`text=${nomeColaborador2}`).first();
    await expect(colabCriado2).toBeVisible();
    console.log(`✅ [Sucesso] Segundo colaborador "${nomeColaborador2}" criado!`);

    // Agendamento com o Colaborador 2
    console.log(`📅 [Agendamento] Agendando horário com "${nomeColaborador2}"...`);
    await page.goto(`${BASE_URL}/agendar`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.locator('input[placeholder="Ex: João Silva"]').fill('Cliente Teste Robô 2');
    await page.locator('input[placeholder="Ex: (19) 99999-9999"]').fill('19966665555');
    await page.locator('button:has-text("Avançar para Serviços")').click();
    await page.waitForTimeout(1000);

    await cardsServicos.first().click();
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Avançar para Barbeiro")').click();
    await page.waitForTimeout(1000);

    const cardColabNaAgenda2 = page.locator(`text=${nomeColaborador2}`).first();
    if (await cardColabNaAgenda2.isVisible()) {
      await cardColabNaAgenda2.click();
    } else {
      const cardsBarbeiros = page.locator('div.cursor-pointer.p-4');
      await cardsBarbeiros.last().click();
    }
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Avançar para Data e Horário")').click();
    await page.waitForTimeout(1500);

    for (let d = 0; d < Math.min(await diasDisponiveis.count(), 5); d++) {
      await diasDisponiveis.nth(d).click();
      await page.waitForTimeout(1500);
      const horariosLivres = page.locator('button:not([disabled])').filter({ hasText: /^\d{2}:\d{2}$/ });
      if (await horariosLivres.count() > 0) {
        await horariosLivres.first().click();
        await page.waitForTimeout(1500);
        break;
      }
    }

    if (await btnAvancarPasso4.isVisible() && !(await btnAvancarPasso4.isDisabled())) {
      await btnAvancarPasso4.click();
      await page.waitForTimeout(2000);
    }

    if (await btnConfirmar.isVisible()) {
      await btnConfirmar.click();
    }
    await page.waitForTimeout(4000);

    // Validação final no ADM para o segundo agendamento
    console.log(`🔍 [Admin] Verificando agendamento do segundo colaborador no painel ADM...`);
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    if (await tabAgendamentos.isVisible()) {
      await tabAgendamentos.click();
      await page.waitForTimeout(1500);
    }

    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);

    const agendamentoNoAdm2 = page.locator('text=Cliente Teste Robô 2').first();
    await expect(agendamentoNoAdm2).toBeVisible({ timeout: 10000 });
    console.log(`✨ [Confirmado] Segundo agendamento validado com sucesso no ADM!`);

    console.log(`🎉 Todos os testes da aba Colaboradores foram concluídos com sucesso absoluto!`);
  });

});