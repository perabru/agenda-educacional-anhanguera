# Agenda Docente Anhanguera

Agenda acadêmica com calendário, disciplinas e catálogo de materiais, disponível como PWA em Android, iPhone e computadores.

## Instalação

- **Android:** abra no Chrome e toque em **Instalar aplicativo**. Se a confirmação automática não aparecer, use o menu do navegador e escolha **Instalar aplicativo** ou **Adicionar à tela inicial**.
- **iPhone/iPad:** abra no Safari, toque em **Compartilhar → Adicionar à Tela de Início → Adicionar**. Mantenha **Abrir como App** ativado quando essa opção aparecer.
- **Computador:** use o botão de instalação no Chrome/Edge ou o ícone junto à barra de endereço.

## Uso offline e atualizações

Após o primeiro carregamento completo com internet, o aplicativo guarda a interface, a base acadêmica e o catálogo para consulta offline. PDFs, links do Google Drive, sincronização e IA precisam de conexão. Ajustes, importações e planos permanecem no armazenamento local do navegador/aplicativo utilizado.

Uma nova versão é oferecida pelo botão **Atualizar aplicativo**, sem recarregar a página durante o trabalho. Somente os arquivos estáticos deste projeto entram no cache; arquivos externos e chamadas de API não são armazenados pelo service worker.

## Publicação

O projeto é estático e usa caminhos relativos para funcionar no subdiretório do GitHub Pages. Publique todos os arquivos, incluindo `manifest.webmanifest`, `sw.js`, `pwa.js` e `icons/`, por HTTPS. Para testar localmente, use um servidor em `localhost`.

Ao alterar arquivos da interface, incremente `VERSION` em `sw.js` e mantenha os nomes/versões da lista `SHELL` alinhados com os recursos referenciados no HTML.

## Auditoria pública dos materiais · 27/10/2026

A revisão abrange os 209 cursos e as 1.227 disciplinas da base 26.2. Foram acrescentadas 718 referências públicas em repositórios KLS/Colaborar, preservando os 2.660 arquivos do Drive e as 20 referências públicas anteriores. 272 disciplinas passaram a ter material associado.

O relatório `auditoria-materiais.html` permite filtrar por curso, disciplina, novas fontes e últimas disciplinas ainda sem material. Os dados completos estão em `auditoria-materiais.json`. Há 744 disciplinas sem fonte pública verificada vinculada ao catálogo nesta auditoria. Roteiros e versões específicos da turma continuam tendo o AVA/coordenação como referência.

Livros e conteúdos de apoio não geram encontros fictícios. Materiais identificados como versão do professor ficam fora do compartilhamento para alunos. As novas URLs foram conferidas por resposta HTTP e tipo de arquivo; isso não confirma equivalência integral entre uma edição histórica e o plano atual.
