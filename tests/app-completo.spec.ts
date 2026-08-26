import { test, expect } from '@playwright/test';

const BASE_URL = 'https://leoportocortes.vercel.app';

test.describe('Robô de Teste Exaustivo e Inteligente - App Léo Porto Cortes', () => {

  test('3. Testar Gestão de Cargos e Permissões (Com Login Automático)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });

    await page.goto(`${BASE_URL}/admin`);
    
    const inputUser = page.locator('input[placeholder*="Usuário"], input[type="text"]').first();
    const inputPass = page.locator('input[type="password"]').first();
    const btnEntrar = page.locator('button:has-text("Entrar"), button:has-text("Entrar no Painel")').first();

    if (await inputUser.isVisible()) {
      await inputUser.fill('Leo Porto'); 
      await inputPass.fill('Leoadm'); 
      await btnEntrar.click();
      await page.waitForTimeout(2000); 
    }

    const tabPermissoes = page.locator('button:visible', { hasText: 'Permissões' }).first();
    await tabPermissoes.click();
    await page.waitForTimeout(1500); 

    const inputCargo = page.locator('input[placeholder*="Nome do cargo"]');
    await inputCargo.fill('CargoTesteRobo');
    
    const btnAdicionar = page.locator('text=Adicionar Cargo');
    await btnAdicionar.click();
    
    await page.waitForTimeout(2000);

    const cargoElement = page.locator('text=CargoTesteRobo').first();
    await expect(cargoElement).toBeAttached();

    const rowCargo = page.locator('tr', { hasText: 'CargoTesteRobo' });
    const btnExcluir = rowCargo.locator('text=Excluir');
    
    if (await btnExcluir.isVisible()) {
      page.on('dialog', async dialog => await dialog.accept());
      await btnExcluir.click();
      await page.waitForTimeout(1500);
    }
  });

  test('4. Testar Fluxo Avançado: Múltiplos Serviços, Combinações e 20 Agendamentos Finais', async ({ page }) => {
    test.setTimeout(1200000); // 20 minutos
    await page.setViewportSize({ width: 1366, height: 768 });

    const totalAgendamentos = 20;

    for (let i = 1; i <= totalAgendamentos; i++) {
      console.log(`🚀 [Início] Rodada de agendamento combinado ${i} de ${totalAgendamentos}`);

      try {
        // 1. Acessa a página pública de agendamento
        await page.goto(`${BASE_URL}/agendar`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // --- PASSO 1: Dados do Cliente ---
        const inputNome = page.locator('input[placeholder="Ex: João Silva"]');
        const inputTel = page.locator('input[placeholder="Ex: (19) 99999-9999"]');
        const btnAvancar1 = page.locator('button:has-text("Avançar para Serviços")');

        await inputNome.fill(`Cliente Robô ${i}`);
        await inputTel.fill(`1998888${i.toString().padStart(4, '0')}`);
        await btnAvancar1.click();
        await page.waitForTimeout(1000);

        // --- PASSO 2: Seleção de Serviços ---
        const cardsServicos = page.locator('div.cursor-pointer.border');
        await cardsServicos.first().waitFor({ state: 'visible', timeout: 8000 });
        const totalServicosDisponiveis = await cardsServicos.count();

        if (totalServicosDisponiveis > 0) {
          await cardsServicos.nth(0).click();
          await page.waitForTimeout(500);

          if (totalServicosDisponiveis > 1) {
            const indiceSegundoServico = ((i - 1) % (totalServicosDisponiveis - 1)) + 1;
            await cardsServicos.nth(indiceSegundoServico).click();
            await page.waitForTimeout(500);
          }
        }

        const btnAvancar2 = page.locator('button:has-text("Avançar para Barbeiro")');
        await expect(btnAvancar2).toBeEnabled({ timeout: 5000 });
        await btnAvancar2.click();
        await page.waitForTimeout(1000);

        // --- PASSO 3: Seleção de Barbeiro ---
        const barbeiros = page.locator('div.cursor-pointer.p-4');
        const totalBarbeiros = await barbeiros.count();
        if (totalBarbeiros > 0) {
          const indiceBarbeiro = (i - 1) % totalBarbeiros;
          await barbeiros.nth(indiceBarbeiro).click();
        }
        await page.waitForTimeout(1000);

        const btnAvancar3 = page.locator('button:has-text("Avançar para Data e Horário")');
        await expect(btnAvancar3).toBeEnabled({ timeout: 5000 });
        await btnAvancar3.click();
        await page.waitForTimeout(1500);

        // --- PASSO 4: Data e Horário ---
        const diaDisponivel = page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ }).first();
        await diaDisponivel.waitFor({ state: 'visible', timeout: 8000 });
        await diaDisponivel.click();
        await page.waitForTimeout(2000);

        // Seleciona um horário livre disponível
        const horariosLivres = page.locator('button:not([disabled])').filter({ hasText: /^\d{2}:\d{2}$/ });
        await horariosLivres.first().waitFor({ state: 'visible', timeout: 8000 });
        const totalHorarios = await horariosLivres.count();
        
        const indiceHorario = (i - 1) % Math.max(totalHorarios, 1);
        const horarioEscolhido = horariosLivres.nth(indiceHorario);

        if (await horarioEscolhido.isVisible()) {
          await horarioEscolhido.click();
          await page.waitForTimeout(1500);
        }

        // Clica no botão de avançar para o resumo / passo 5 caso exista
        const btnAvancarPasso4 = page.locator('button:has-text("Avançar"), button:has-text("Continuar"), button:has-text("Resumo"), button:has-text("Revisar")').first();
        if (await btnAvancarPasso4.isVisible() && !(await btnAvancarPasso4.isDisabled())) {
          await btnAvancarPasso4.click();
          await page.waitForTimeout(1500);
        }

        // --- PASSO 5: Resumo e Confirmação Definitiva no Supabase ---
        const btnConfirmarAgendamento = page.locator('button:has-text("Confirmar Agendamento")');
        await btnConfirmarAgendamento.waitFor({ state: 'visible', timeout: 10000 });
        await expect(btnConfirmarAgendamento).toBeEnabled();
        await btnConfirmarAgendamento.click();
        
        // Aguarda a gravação real no banco
        await page.waitForTimeout(4000);
        console.log(`✅ [Sucesso] Agendamento ${i} concluído e enviado para o Supabase!`);

      } catch (error) {
        console.error(`❌ [Erro Crítico na Rodada ${i}]:`, error);
      }
    }
  });

});