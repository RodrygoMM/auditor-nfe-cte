# Sprint Plan — Conferencia NF

## Sprint 1 — Alinhamento e correções iniciais

### Objetivos

1. Corrigir o bug do painel de consulta por placa.

   * Ajustar `openSearchPanel()` para resetar o elemento `searchPlacaSelect`.

2. Revisar o relatório de produtividade.

   * Alinhar o cálculo ao modelo documentado de `eventos`.
   * Remover dependências de campos não documentados:

     * `quantidade`;
     * `qtd`;
     * `amount`.

3. Atualizar a documentação de estado.

   * Verificar a correspondência entre documentação e implementação.
   * Registrar as funcionalidades existentes.
   * Consolidar o estado real do projeto.

4. Criar uma matriz de comparação entre documentação e implementação.

### Resultado

Sprint concluída.

Os ajustes de interface, produtividade e documentação foram realizados e validados.

---

# Sprint 2 — Auditoria e edição de eventos

### Objetivos

1. Implementar gravação em `auditoria` para alterações administrativas.

2. Adicionar capacidade de editar registros de `eventos` com proteção administrativa.

3. Atualizar a documentação para refletir as novas funcionalidades.

### Resultado

Sprint concluída.

A implementação passou a contemplar:

* edição administrativa de eventos;
* registro de alterações;
* coleção `auditoria`;
* identificação do usuário responsável;
* registro de valores anterior e posterior;
* integração desses recursos ao fluxo administrativo.

Os recursos foram testados durante a validação final do projeto.

---

# Sprint 3 — Refinamento de segurança e regras

### Objetivos originalmente planejados

1. Revisar as regras do Firestore para refletir de forma mais granular a autorização operacional.

2. Validar distinções entre conferente e líder diretamente na camada de segurança.

3. Ajustar a documentação para deixar explícito o papel de:

```text
request.auth != null
```

### Decisão

A Sprint 3 não será executada neste ciclo.

A implementação atual permanece utilizando:

```text
allow read, write: if request.auth != null;
```

A autenticação técnica estabelece a sessão de acesso ao Firestore, enquanto a aplicação realiza o controle operacional de conferente e líder.

Uma futura autorização granular diretamente nas regras do Firestore poderá ser considerada caso o projeto seja retomado.

Essa evolução não constitui uma pendência da versão atual.

---

# Estado final do projeto

* Sprint 1 concluída.
* Sprint 2 concluída.
* Sprint 3 encerrada por decisão de escopo.
* Auditoria implementada e testada.
* Edição de eventos implementada e testada.
* Cadastro, edição e inativação de usuários implementados e testados.
* Cadastro, edição e inativação de placas implementados e testados.
* Registro e consulta de eventos implementados e testados.
* Extrato implementado e testado.
* Produtividade implementada e testada.
* Autenticação técnica implementada e testada.
* Área administrativa implementada e protegida por PIN de líder.
* Documentação alinhada à implementação.
* Projeto congelado.

---

# Decisões consolidadas

A versão final mantém algumas decisões deliberadas de simplificação:

* autenticação técnica única;
* identificação operacional através da coleção `usuarios`;
* autorização administrativa por líder e PIN;
* inativação suave em vez de exclusão física;
* produtividade baseada na contagem de eventos;
* placa obrigatória;
* cliente opcional;
* escopo reduzido;
* auditoria de alterações;
* edição administrativa de eventos.

Essas decisões fazem parte da arquitetura da versão congelada.

---

# Fonte de verdade

Os documentos Markdown do projeto representam a referência documental da versão atual.

A implementação existente e a documentação devem ser consideradas conjuntamente para compreender o comportamento final da extensão.

Qualquer alteração posterior deverá ser tratada como uma nova evolução do projeto e deverá possuir solicitação explícita.

---

# Status final

**PROJETO CONCLUÍDO E CONGELADO**

Não existem sprints pendentes neste ciclo.

Novas funcionalidades, alterações arquiteturais ou mudanças de segurança deverão ser tratadas em uma nova versão do projeto.
