# Relatório de Alteração de Documento — 2026-08-10

## Objetivo
Gerar um documento novo que descreva as mudanças reais implementadas na extensão em relação à documentação existente, sem alterar nenhum arquivo `.md` atual.

## Contexto
A documentação atual (`README.md`, `SPRINTER — Instruções para IA.md`) não acompanha as alterações de implementação recentes em `popup.js`, `popup.html` e `firebaseConfig.js`.

A seguir, estão as diferenças mais importantes identificadas entre a implementação atual e a documentação existente.

---

## 1. Fonte de verdade de usuários e placas

### Documentação existente
- Usuários e placas eram descritos como sendo gerenciados pela coleção Firestore `usuarios` e `placas`.
- A seleção operacional de usuário era documentada como proveniente dessa coleção `usuarios`.

### Implementação atual
- A seleção operacional de usuário e placas usa `usuarios_placas.json` como fonte de verdade.
- `loadUsuarios()` carrega `usuarios` do arquivo local e popula `usuarioSelect` a partir dele.
- `loadPlates()` carrega `placas` do mesmo arquivo local.
- A coleção Firestore `usuarios` é usada apenas para operações administrativas de liderança/PIN e para persistência de cadastro de usuário, não como fonte única de escolha operacional.

### Impacto
- A documentação deve ser atualizada para refletir que o arquivo local `usuarios_placas.json` é a fonte primária de usuários e placas.
- O fluxo administrativo e operacional está misturando fontes locais e Firestore, o que deve ser documentado claramente.

---

## 2. Salvamento de usuários

### Documentação existente
- O cadastro, edição e inativação de usuários era descrito como acontecendo na coleção Firestore `usuarios`.

### Implementação atual
- `saveUser()` agora escreve em `usuarios` no Firestore quando um usuário é criado ou editado.
- `deleteUser()` marca `ativo: false` no Firestore para desativar usuários.
- `openAdminUsers()` carrega o painel de usuários usando `loadFirestoreUsuarios()` e popula `adminUserSelect` com dados do Firestore.
- No entanto, a seleção de usuário operacional principal continua vindo do arquivo local, não do Firestore.

### Impacto
- A documentação deve explicar o modelo híbrido: a listagem operacional usa o arquivo local, mas o painel administrativo de usuários usa Firestore.

---

## 3. Validação de PIN administrativo

### Documentação existente
- O PIN administrativo era descrito como validado contra a coleção `usuarios`.

### Implementação atual
- `validateAdminPin()` consulta a coleção Firestore `usuarios` para verificar líderes ativos e validar o PIN.
- O campo `adminPin` permanece apenas para liberação de acesso à área administrativa, sem armazenar o PIN permanentemente.

### Impacto
- Este ponto está de acordo com a documentação, mas deve ser atualizado para deixar claro que a validação de PIN ainda depende do Firestore mesmo quando a seleção operacional é local.

---

## 4. Preferência de usuário

### Documentação existente
- Não há menção ao recurso de usuário preferido.

### Implementação atual
- Adicionado `PREFERRED_USER_KEY` no `chrome.storage.local`.
- O select operacional exibe um usuário preferido com estrela `★` quando presente.
- `usuarioSelect` salva a preferência ao mudar a seleção.

### Impacto
- É uma nova funcionalidade que precisa ser documentada, incluindo seu comportamento de persistência e exibição.

---

## 5. Tratamento de respostas Firestore

### Documentação existente
- Não descreve detalhes de parsing de resposta.

### Implementação atual
- Implementado `parseResponseBody()` para lidar com respostas não-JSON e erros do Firestore.
- `createDocument()` e `patchDocument()` agora tratam `data?.rawText` quando a resposta JSON não estiver disponível.

### Impacto
- Este é um ajuste técnico relevante para robustez. Documentar pode ser útil, mas não é essencial como funcionalidade de usuário.

---

## 6. Inicialização de coleções Firestore

### Documentação existente
- Estava previsto que `ensureFirestoreCollections()` criaria coleções necessárias automaticamente.

### Implementação atual
- A função `ensureFirestoreCollections()` foi modificada para não fazer nada, ou seja, para não iniciar coleções automaticamente.
- Isso indica que a inicialização de coleções não faz mais parte do fluxo obrigatório.

### Impacto
- A documentação precisa ser atualizada para remover ou qualificar essa afirmação.

---

## 7. HTML e interface administrativa

### Documentação existente
- O documento não detalha o estado atual do painel administrativo.

### Implementação atual
- `popup.html` passou a exibir o botão `adminUsersBtn` e o painel `adminUserPanel`.
- Foi removido um comentário incorreto que aparecia na página.
- O painel de placas administrativas existe, mas a ativação de seu botão permanece comentada no HTML.

### Impacto
- A documentação de interface deve ser ajustada para refletir que o painel de usuários está acessível via administração.

---

## 8. Alterações de código relevantes

### Arquivos alterados
- `popup.js`
- `popup.html`
- `firebaseConfig.js`

### Principais funcionalidades novas/mudadas
- Fonte de verdade local: `usuarios_placas.json`
- Preferência de usuário com estrela no select
- PIN administrativo validado no Firestore
- CRUD de usuários em Firestore com `createDocument()` / `patchDocument()`
- Tratamento de response body para erros Firestore
- Interface administrativa de usuários habilitada

---

## 9. Recomendações para o documento novo

O documento de alteração deve conter pelo menos:

1. Data da análise: `2026-08-10`
2. Resumo das divergências entre código e documentação
3. Lista de recursos novos e alterados
4. Nota sobre a fonte de verdade local para usuários/placas
5. Nota sobre o fluxo híbrido de usuário operacional local + administração Firestore
6. Itens de documentação a atualizar futuramente

---

## 10. Observação final

Este relatório foi gerado sem alterar nenhum dos documentos existentes.
O novo arquivo foi criado para registrar o desvio entre a implementação atual e a documentação base do projeto.
