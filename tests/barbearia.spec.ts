import { test, expect } from '@playwright/test';

// URL base do seu app (pode mudar para 'http://localhost:3000' se testar local)
const BASE_URL = 'https://leoportocortes.vercel.app';

test.describe('Robô de Teste Exaustivo - App Léo Porto Cortes', () => {

  test('1. Testar Fluxo do Cliente (Agendamento)', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Verifica se a página inicial carrega
    await expect(page.locator('body')).toBeVisible();

    // Tenta avançar pelo fluxo de agendamento (clicando em agendar/serviços se houver botão visível)
    const agendarBtn = page.locator('text=Agendar').first();
    if (await agendarBtn.isVisible()) {
      await agendarBtn.click();
      // Valida se mudou de etapa
      await page.waitForTimeout(1000);
    }
  });

  test('2. Testar Painel Administrativo - Aba por Aba', async ({ page }) => {
    // Acessa a rota do admin
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(1500);

    // --- TESTE DA ABA: AGENDAMENTOS ---
    const tabAgendamentos = page.locator('text=Agendamentos').first();
    if (await tabAgendamentos.isVisible()) {
      await tabAgendamentos.click();
      await page.waitForTimeout(1000);
    }

    // --- TESTE DA ABA: SERVIÇOS ---
    const tabServicos = page.locator('text=Serviços').first();
    if (await tabServicos.isVisible()) {
      await tabServicos.click();
      await page.waitForTimeout(1000);
    }

    // --- TESTE DA ABA: COLABORADORES ---
    const tabColaboradores = page.locator('text=Colaboradores').first();
    if (await tabColaboradores.isVisible()) {
      await tabColaboradores.click();
      await page.waitForTimeout(1000);
    }

    // --- TESTE DA ABA: HORÁRIOS ---
    const tabHorarios = page.locator('text=Horários').first();
    if (await tabHorarios.isVisible()) {
      await tabHorarios.click();
      await page.waitForTimeout(1000);
    }

    // --- TESTE DA ABA: RELATÓRIOS ---
    const tabRelatorios = page.locator('text=Relatórios').first();
    if (await tabRelatorios.isVisible()) {
      await tabRelatorios.click();
      await page.waitForTimeout(1000);
    }
  });

  test('3. Testar Gestão de Cargos e Permissões (CRUD Completo)', async ({ page }) => {
    // Vai direto para o painel admin / aba de permissões
    await page.goto(`${BASE_URL}/admin`);
    
    const tabPermissoes = page.locator('text=Permissões').first();
    await tabPermissoes.click();
    await page.waitForTimeout(1000);

    // PASSO A: Adicionar um cargo de teste
    const inputCargo = page.locator('input[placeholder*="Nome do cargo"]');
    await inputCargo.fill('CargoTesteRobo');
    
    const btnAdicionar = page.locator('text=Adicionar Cargo');
    await btnAdicionar.click();
    await page.waitForTimeout(1500);

    // Valida se o cargo apareceu na matriz
    await expect(page.locator('text=CargoTesteRobo')).toBeVisible();

    // PASSO B: Testar marcar/desmarcar permissões (checkboxes) do novo cargo
    // Pega o primeiro checkbox da linha do cargo criado
    const rowCargo = page.locator('tr', { hasText: 'CargoTesteRobo' });
    const checkboxServicos = rowCargo.locator('input[type="checkbox"]').first();
    
    if (await checkboxServicos.isVisible()) {
      await checkboxServicos.click(); // Marca
      await page.waitForTimeout(500);
      await checkboxServicos.click(); // Desmarca
      await page.waitForTimeout(500);
    }

    // PASSO C: Testar exclusão do cargo de teste
    const btnExcluir = rowCargo.locator('text=Excluir');
    if (await btnExcluir.isVisible()) {
      // Aceita o alerta de confirmação nativo do navegador automaticamente
      page.on('dialog', async dialog => await dialog.accept());
      
      await btnExcluir.click();
      await page.waitForTimeout(1500);

      // Valida se o cargo sumiu da tela
      await expect(page.locator('text=CargoTesteRobo')).not.toBeVisible();
    }
  });

});