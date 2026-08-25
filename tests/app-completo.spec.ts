import { test, expect } from '@playwright/test';

const BASE_URL = 'https://leoportocortes.vercel.app';

test.describe('Robô de Teste Exaustivo - App Léo Porto Cortes', () => {

  test('3. Testar Gestão de Cargos e Permissões (Com Login Automático)', async ({ page }) => {
    // 1. Configura o tamanho da tela grande
    await page.setViewportSize({ width: 1366, height: 768 });

    // 2. Acessa a página de admin
    await page.goto(`${BASE_URL}/admin`);
    
    // 3. Preenche o login e a senha de administrador
    const inputUser = page.locator('input[placeholder*="Usuário"], input[type="text"]').first();
    const inputPass = page.locator('input[type="password"]').first();
    const btnEntrar = page.locator('button:has-text("Entrar"), button:has-text("Entrar no Painel")').first();

    if (await inputUser.isVisible()) {
      await inputUser.fill('Leo Porto'); 
      await inputPass.fill('Leoadm'); 
      await btnEntrar.click();
      await page.waitForTimeout(3000); 
    }

    // 4. Clica no botão de Permissões visível
    const tabPermissoes = page.locator('button:visible', { hasText: 'Permissões' }).first();
    await tabPermissoes.click();
    await page.waitForTimeout(2000); 

    // 5. Adiciona um cargo de teste
    const inputCargo = page.locator('input[placeholder*="Nome do cargo"]');
    await inputCargo.fill('CargoTesteRobo');
    
    const btnAdicionar = page.locator('text=Adicionar Cargo');
    await btnAdicionar.click();
    
    // Aguarda a tabela processar a inclusão
    await page.waitForTimeout(3000);

    // 6. Confirma que o cargo foi criado no sistema (verificando se o elemento está anexado/presente)
    const cargoElement = page.locator('text=CargoTesteRobo').first();
    await expect(cargoElement).toBeAttached();

    // 7. Exclui o cargo de teste para limpar o ambiente perfeitamente
    const rowCargo = page.locator('tr', { hasText: 'CargoTesteRobo' });
    const btnExcluir = rowCargo.locator('text=Excluir');
    
    if (await btnExcluir.isVisible()) {
      page.on('dialog', async dialog => await dialog.accept());
      await btnExcluir.click();
      await page.waitForTimeout(2000);
    }
  });

});