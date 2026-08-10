# ADR — Conferencia NF

## ADR-001 — Arquitetura de autenticação e autorização

**Status:** Aceito

**Data:** 08/08/2026

### Contexto

A extensão Chrome será utilizada por diversos funcionários da expedição.

O processo anterior utilizava um caderno físico para registrar quem estava realizando a conferência de determinada placa.

Não é desejado exigir que cada funcionário possua:

* e-mail;
* senha de login;
* conta individual no Firebase Authentication.

O sistema precisa identificar operacionalmente o funcionário responsável pela conferência e proteger operações administrativas contra alterações indevidas.

### Decisão

Será utilizada uma única conta técnica no Firebase Authentication para estabelecer a sessão de acesso da aplicação.

As credenciais da conta técnica não fazem parte da documentação pública nem devem ser armazenadas no repositório.

Os funcionários serão cadastrados na coleção:

```text
usuarios
```

A autorização operacional será baseada no campo:

```text
lider
```

Valores:

```text
true  = líder
false = conferente
```

As operações administrativas serão protegidas por um PIN associado ao usuário líder, armazenado como string no campo:

```text
password
```

O PIN será solicitado para liberar o acesso à área administrativa. Após a validação, o líder poderá realizar múltiplas operações administrativas durante a sessão, sem necessidade de informar o PIN novamente a cada cadastro ou alteração.

### Justificativa

Essa arquitetura mantém o sistema simples e compatível com o processo físico que está sendo substituído.

Não há necessidade de criar contas individuais no Firebase Authentication para cada funcionário.

A conta técnica estabelece a sessão de acesso ao Firebase, enquanto a coleção `usuarios` representa a identidade operacional utilizada nos registros.

---

# ADR-002 — Placa obrigatória e cliente opcional

**Status:** Aceito

**Data:** 08/08/2026

### Contexto

As cargas podem chegar através de coletas/milk run ou diretamente por recebimento.

Em coletas, a placa identifica operacionalmente a carga.

Em recebimentos diretos, pode não existir uma placa real de coleta.

### Decisão

A placa será sempre obrigatória.

Quando não houver uma placa real, será utilizada uma placa fictícia previamente cadastrada.

Placa padrão:

```text
CWB001
```

O cliente/remetente será opcional.

### Justificativa

A placa é o principal identificador utilizado pela operação para localizar a carga.

Obrigar o preenchimento do cliente criaria uma exigência desnecessária em situações nas quais a informação não é necessária para a conferência.

A utilização de uma placa padrão permite manter o fluxo operacional uniforme.

---

# ADR-003 — Auditoria de alterações

**Status:** Aceito

**Data:** 08/08/2026

### Contexto

Eventos já registrados podem precisar de correção ou alteração administrativa.

Impedir qualquer alteração não é necessário para o objetivo da aplicação, porém alterações relevantes precisam ser rastreáveis.

### Decisão

Alterações relevantes serão registradas na coleção:

```text
auditoria
```

Cada alteração deverá registrar:

```text
acao
dataHora
eventoId
usuario
campo
valorAnterior
valorNovo
```

### Justificativa

O objetivo da auditoria é permitir identificar:

* quem realizou a alteração;
* quando ela ocorreu;
* qual evento foi alterado;
* qual campo foi modificado;
* qual era o valor anterior;
* qual passou a ser o novo valor.

A auditoria mantém a possibilidade de correção dos registros sem eliminar o histórico da alteração.

---

# ADR-004 — Separação entre autenticação técnica e identificação operacional

**Status:** Aceito

**Data:** 08/08/2026

### Decisão

O Firebase Authentication será utilizado para autenticação técnica da aplicação.

A identificação dos funcionários será realizada através da coleção `usuarios` no Firestore.

Portanto:

```text
Firebase Authentication
        ↓
Sessão técnica de acesso
        ↓
Firestore / usuarios
        ↓
Identidade operacional
```

O usuário autenticado tecnicamente não representa necessariamente o funcionário que está realizando a conferência.

O funcionário responsável é selecionado através do cadastro operacional de usuários.

### Justificativa

Os funcionários não precisam conhecer ou utilizar credenciais individuais do Firebase.

Isso mantém a operação próxima do modelo do caderno físico, no qual o conferente simplesmente é identificado no momento do registro.

---

# ADR-005 — Escopo reduzido

**Status:** Aceito

**Data:** 08/08/2026

### Decisão

O projeto não será transformado em um WMS/TMS ou sistema completo de gestão logística.

A extensão deve permanecer focada em:

> registrar e consultar quem realizou a conferência de determinada placa, mantendo o histórico dos eventos e disponibilizando recursos administrativos necessários ao processo.

Funcionalidades que não estejam diretamente relacionadas ao objetivo da extensão não devem ser adicionadas sem necessidade operacional identificada.

### Justificativa

O objetivo do projeto é substituir um processo físico simples por uma solução digital igualmente simples.

A expansão desnecessária do escopo aumentaria a complexidade, a manutenção e os custos sem necessariamente melhorar o processo principal.

---

# ADR-006 — Projeto pessoal e publicação como portfólio

**Status:** Aceito

**Data:** 08/08/2026

### Contexto

O projeto foi desenvolvido como iniciativa pessoal, utilizando ambiente e recursos próprios, com objetivo de aprendizado, portfólio e demonstração prática de desenvolvimento de software.

O projeto será disponibilizado publicamente no GitHub.

### Decisão

O código-fonte será disponibilizado publicamente para fins de estudo, aprendizado, avaliação técnica e uso pessoal, conforme os termos definidos na licença do projeto.

O projeto não será monetizado neste momento.

A publicação pública tem como objetivos:

* demonstrar experiência prática;
* apresentar arquitetura e decisões técnicas;
* demonstrar integração com Firebase;
* demonstrar autenticação e autorização;
* demonstrar persistência de dados;
* demonstrar auditoria;
* demonstrar testes e documentação;
* compor o portfólio profissional do autor.

### Justificativa

A publicação do projeto permite transformar uma solução desenvolvida para um problema operacional em um caso prático de Engenharia de Software.

A abertura do código neste momento prioriza aprendizado, portfólio e evolução profissional, mantendo as restrições de uso comercial estabelecidas na licença.

---

# ADR-007 — Projeto congelado após validação

**Status:** Aceito

**Data:** 08/08/2026

### Contexto

A versão atual foi submetida a testes funcionais envolvendo cadastro, edição, inativação, registro de eventos, consultas, relatórios, administração e auditoria.

### Decisão

A versão atual será considerada uma versão congelada do projeto.

Novas funcionalidades somente deverão ser adicionadas caso exista uma necessidade claramente identificada ou caso o projeto seja retomado para uma nova versão.

### Justificativa

O congelamento permite preservar uma versão funcional e documentada do projeto, evitando alterações desnecessárias após a conclusão dos objetivos definidos.

O projeto passa a servir simultaneamente como:

* produto funcional;
* experiência prática;
* material de estudo;
* portfólio profissional;
* base para futuras evoluções, caso necessário.
