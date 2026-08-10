# SPRINTER — Instruções para IA

## 1. Identidade do projeto

Você está trabalhando no projeto **Conferencia NF**.

O projeto é uma extensão Chrome desenvolvida para auxiliar a expedição no registro e rastreamento de conferências de cargas.

A extensão substitui um controle anteriormente realizado em um caderno físico.

O objetivo é manter um registro digital simples, rápido e pesquisável.

---

## 2. Regra fundamental

**Não transforme este projeto em um sistema complexo sem solicitação explícita.**

A prioridade é simplicidade operacional.

Antes de propor ou implementar qualquer funcionalidade, verifique se ela possui relação direta com o objetivo da extensão:

> registrar, localizar e rastrear conferências por placa.

O projeto não deve ser transformado em WMS, TMS ou sistema de gestão logística completo.

---

## 3. Stack

Tecnologias utilizadas:

```text
Extensão Chrome
JavaScript
Firebase Authentication
Cloud Firestore
```

Projeto Firebase:

```text
conferencia-nf
```

---

## 4. Arquitetura de autenticação

Existe uma conta técnica utilizada para autenticação da aplicação.

Os funcionários **não possuem contas individuais no Firebase Authentication**.

A identificação operacional dos funcionários é realizada através da coleção:

```text
usuarios
```

Não criar automaticamente contas Firebase para funcionários.

Não solicitar e-mail ou senha do Firebase para conferentes ou líderes durante a operação normal.

---

## 5. Usuários

Coleção:

```text
usuarios
```

Campos:

```text
nome
ativo
lider
password
```

### `nome`

Nome utilizado para identificar o funcionário operacionalmente.

### `ativo`

Define se o usuário está disponível para utilização.

```text
true  = ativo
false = inativo
```

### `lider`

Define se o usuário possui privilégios administrativos.

```text
true  = líder
false = conferente
```

### `password`

Representa o PIN operacional utilizado para validação administrativa.

É armazenado como string.

Não confundir:

```text
Firebase Authentication password
```

com:

```text
usuarios.password
```

São mecanismos diferentes.

---

## 6. Operações operacionais

Conferentes podem:

```text
registrar conferência
consultar placa
consultar extrato
consultar produtividade por usuário
```

Líderes podem realizar as mesmas operações e também:

```text
cadastrar usuário
editar usuário
inativar usuário
cadastrar placa
editar placa
inativar placa
editar evento
consultar auditoria
```

As operações administrativas são protegidas pelo mecanismo de validação de líder e PIN.

---

## 7. Regra de acesso administrativo

O PIN serve para liberar o acesso administrativo.

O fluxo esperado é:

```text
acessar área administrativa
        ↓
solicitar PIN
        ↓
validar PIN
        ↓
verificar usuário com lider = true
        ↓
liberar operações administrativas
```

O PIN não deve ser solicitado novamente para cada alteração enquanto a sessão administrativa permanecer válida.

O objetivo é permitir que um líder realize várias operações administrativas após uma única autenticação.

Não armazenar o PIN permanentemente no navegador.

---

## 8. Placas

Coleção:

```text
placas
```

Campos utilizados:

```text
placa
ativo
```

A placa é obrigatória no registro de conferência.

Quando não existir uma placa real para o recebimento direto, pode ser utilizada:

```text
CWB001
```

Não transformar `CWB001` em uma regra especial de código.

Ela é apenas uma placa cadastrada utilizada como identificador operacional quando necessário.

Placas inativas não devem aparecer nos seletores operacionais.

A exclusão administrativa de uma placa é realizada por inativação:

```text
ativo: false
```

Não realizar exclusão física sem solicitação explícita.

---

## 9. Cliente

O cliente é um campo opcional.

Não tornar o cliente obrigatório.

Isso permite que o fluxo continue funcionando quando a identificação do cliente não for necessária para determinada conferência.

---

## 10. Eventos

Coleção:

```text
eventos
```

O evento representa uma conferência realizada.

Campos:

```text
placa
usuario
cliente
status
dataHora
```

Exemplo conceitual:

```text
placa: "ALO1236"
usuario: "Rodrygo"
cliente: "Cliente Teste"
status: "conferido"
dataHora: timestamp
```

Não criar novos campos sem necessidade funcional e sem solicitação explícita.

---

## 11. Ausência de registro

A ausência de evento para uma placa é uma informação operacional válida.

Quando não existir registro:

```text
não há conferência registrada
```

Não criar automaticamente um novo status para representar essa situação.

A ausência de registro pode significar que a carga ainda não foi conferida ou que o processo ainda não foi registrado.

---

## 12. Consulta

A extensão permite consultar informações relacionadas às conferências.

A consulta por placa utiliza as placas disponíveis no cadastro.

Placas inativas não devem ser apresentadas no fluxo operacional normal.

A consulta deve permanecer simples e rápida.

---

## 13. Extrato

A extensão possui relatório de extrato por período/data.

O extrato permite visualizar os eventos registrados e organizá-los de acordo com as informações disponíveis no modelo de dados.

Não transformar o extrato em um módulo de gestão logística.

---

## 14. Produtividade

A extensão possui um relatório de produtividade baseado na quantidade de eventos registrados por usuário.

A métrica representa:

```text
quantidade de conferências registradas
```

Ela **não representa automaticamente desempenho individual**.

Uma conferência pode durar poucos minutos ou várias horas.

O funcionário também pode executar atividades que não são registradas pela extensão.

Portanto, não utilizar o relatório para afirmar automaticamente que um funcionário é mais ou menos produtivo.

Não criar novas métricas de desempenho sem solicitação explícita.

---

## 15. Auditoria

Coleção:

```text
auditoria
```

Alterações administrativas relevantes em eventos devem gerar registros de auditoria.

Campos:

```text
acao
dataHora
eventoId
usuario
campo
valorAnterior
valorNovo
```

Exemplo:

```text
acao: "alteracao"
eventoId: "teste-001"
usuario: "Rodrygo"
campo: "placa"
valorAnterior: "ALO1236"
valorNovo: "ALO1246"
```

O objetivo da auditoria é permitir identificar:

* quem realizou a alteração;
* quando realizou;
* qual evento foi alterado;
* qual campo foi modificado;
* qual era o valor anterior;
* qual passou a ser o novo valor.

---

## 16. Edição de eventos

A extensão possui edição administrativa de eventos.

A edição deve ocorrer somente através da área administrativa autorizada.

Alterações realizadas em eventos devem gerar registro correspondente na coleção:

```text
auditoria
```

Não remover o histórico da alteração.

---

## 17. Inativação

Usuários e placas não são excluídos fisicamente durante as operações administrativas normais.

O comportamento adotado é:

```text
ativo: true
```

ou:

```text
ativo: false
```

A inativação preserva os registros históricos e evita a remoção desnecessária de documentos.

Essa é uma decisão deliberada da versão congelada.

---

## 18. Firestore

A regra atual exige autenticação para acesso ao Firestore:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Não tornar o Firestore público sem solicitação explícita.

A regra atual representa a arquitetura da versão congelada.

Uma futura versão poderia adotar regras mais granulares diretamente no Firestore, caso isso se torne necessário.

Isso não constitui uma pendência da versão atual.

---

## 19. Processo operacional

Uma carga pode chegar através de:

```text
coleta / milk run
```

ou:

```text
recebimento direto
```

No processo de coleta, a placa funciona como principal identificador operacional.

No recebimento direto, quando não houver uma placa real adequada, pode ser utilizado:

```text
CWB001
```

O cliente pode ser informado quando necessário.

O objetivo é permitir que o funcionário identifique rapidamente onde está o registro da conferência sem depender da procura manual em cadernos, folhas ou bancadas.

---

## 20. Princípio de simplicidade

O sistema foi desenvolvido para resolver uma dor operacional específica.

O fato de uma funcionalidade ser tecnicamente possível não significa que ela deva ser adicionada.

Antes de propor uma alteração, considerar:

```text
Isso resolve um problema real?
```

```text
Isso reduz etapas do processo?
```

```text
Isso facilita a operação?
```

```text
Isso mantém o sistema simples?
```

Se a resposta for negativa, não adicionar a funcionalidade sem solicitação explícita.

---

# 21. Histórico das Sprints

## Sprint 1

Objetivos:

* correção do painel de consulta;
* correção do relatório de produtividade;
* alinhamento da documentação;
* criação da matriz de comparação entre documentação e implementação.

### Status

**Concluída.**

---

## Sprint 2

Objetivos:

* implementação da auditoria;
* implementação da edição de eventos;
* atualização da documentação.

### Status

**Concluída.**

Auditoria e edição de eventos foram implementadas e testadas.

---

## Sprint 3

Objetivo original:

* refinamento das regras de segurança;
* diferenciação granular entre conferente e líder diretamente nas regras do Firestore.

### Decisão

A Sprint 3 não foi executada neste ciclo.

A implementação atual foi mantida deliberadamente devido ao congelamento do projeto.

Uma política de autorização mais granular poderá ser considerada em uma futura evolução, caso exista necessidade real.

### Status

**Encerrada por decisão de escopo.**

Não constitui pendência da versão atual.

---

# 22. Estado atual do projeto

O projeto encontra-se funcionalmente concluído.

Funcionalidades implementadas e testadas:

```text
autenticação técnica
seleção de usuário
seleção de placa
registro de conferência
consulta por placa
extrato
produtividade por usuário
cadastro de usuários
edição de usuários
inativação de usuários
cadastro de placas
edição de placas
inativação de placas
área administrativa
proteção por PIN de líder
edição de eventos
auditoria
```

Também foram realizados testes envolvendo:

```text
cadastros
alterações
inativações
registro de eventos
consultas
extratos
produtividade
edição de eventos
auditoria
```

A versão atual foi validada e congelada.

---

# 23. Estado congelado

**PROJETO CONCLUÍDO E CONGELADO**

Não existem Sprints pendentes neste ciclo.

Não realizar alterações adicionais sem solicitação explícita.

Não criar novas funcionalidades por iniciativa própria.

Não modificar a arquitetura apenas por preferência técnica.

Não substituir decisões existentes por soluções mais complexas sem necessidade.

Qualquer nova alteração deve ser tratada como uma nova evolução do projeto.

---

# 24. Fonte de verdade

Os seguintes documentos devem ser considerados conjuntamente como referência do projeto:

```text
README.md
SPRINTER — Instruções para IA.md
ADR.md
Sprint Plan
Sprint Reports
implementation_documentation_matrix.md
Document Evolution Report
```

Quando houver divergência entre documentação antiga e o estado congelado descrito nos documentos mais recentes, deve prevalecer o estado final consolidado.

A implementação existente também deve ser considerada ao analisar qualquer alteração futura.

---

# 25. Regra final para a IA

Antes de modificar o projeto:

1. Verifique se a alteração foi solicitada explicitamente.
2. Preserve as coleções existentes.
3. Preserve os campos existentes.
4. Preserve o fluxo operacional.
5. Não criar autenticação individual para funcionários.
6. Não tornar placa opcional.
7. Não tornar cliente obrigatório.
8. Não criar métricas de desempenho sem solicitação.
9. Não criar funcionalidades financeiras.
10. Não transformar o projeto em WMS/TMS.
11. Não armazenar o PIN permanentemente no navegador.
12. Manter auditoria nas alterações administrativas.
13. Identificar o usuário responsável pelas alterações.
14. Preservar a inativação suave.
15. Priorizar rapidez e simplicidade operacional.
16. Não alterar o projeto congelado sem autorização explícita.

**O projeto está concluído. Qualquer trabalho posterior deve ser considerado uma nova versão.**
