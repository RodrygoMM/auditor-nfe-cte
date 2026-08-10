# README — Auditor NF-e x CT-e

## 1. Visão geral

**Auditor NF-e x CT-e** é uma extensão Chrome para registrar, consultar e administrar conferências de cargas de forma digital.

A extensão substitui o controle físico por um registro simples e pesquisável no Firebase.

A proposta central é manter a solução enxuta, com foco no processo de conferência e em recursos administrativos relacionados, sem transformar a extensão em um sistema de gestão logística.

---

## 2. Funcionalidades principais

* Autenticação técnica via Firebase Authentication.
* Seleção de usuário operacional a partir da coleção `usuarios`.
* Seleção de placa a partir da coleção `placas`.
* Registro de conferências na coleção `eventos`.
* Consulta de eventos por placa.
* Consulta de eventos por usuário.
* Extrato diário de eventos.
* Relatório de produtividade por usuário baseado na quantidade de eventos.
* Administração protegida por PIN de líder.
* Cadastro, edição e inativação de usuários.
* Cadastro, edição e inativação de placas.
* Edição de eventos existentes.
* Registro de alterações administrativas na coleção `auditoria`.
* Inativação lógica de usuários e placas por meio de `ativo: false`.
* Automação na criação das coleções e campos necessários no Firestore.

---

## 3. Usuários

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

Nome de identificação do usuário operacional.

### `ativo`

Define se o usuário está habilitado para utilização.

```text
true  = ativo
false = inativo
```

A inativação é realizada de forma lógica. O registro permanece armazenado no Firestore.

### `lider`

Define se o usuário possui privilégios administrativos.

```text
true  = líder
false = conferente
```

### `password`

Representa o PIN operacional utilizado para validação de operações administrativas.

Não corresponde à senha do Firebase Authentication.

O valor é armazenado como string.

---

## 4. Firebase Authentication

A extensão utiliza uma única conta técnica no Firebase Authentication.

As credenciais dessa conta não fazem parte da documentação pública nem devem ser armazenadas no repositório.

Os usuários operacionais são gerenciados exclusivamente pela coleção `usuarios` e não precisam possuir contas individuais no Firebase Authentication.

A autenticação técnica estabelece uma sessão autorizada para acesso aos recursos do Firestore.

---

## 5. Firestore

As informações do projeto são armazenadas no Firebase Firestore.

Coleções utilizadas:

```text
usuarios
placas
eventos
auditoria
```

### `usuarios`

Armazena os usuários operacionais e seus respectivos níveis de acesso.

Campos:

```text
nome
ativo
lider
password
```

### `placas`

Armazena as placas disponíveis para utilização nas conferências.

Campos:

```text
placa
ativo
```

### `eventos`

Armazena os registros de conferência.

Campos:

```text
placa
usuario
cliente
status
dataHora
```

### `auditoria`

Armazena o histórico das alterações realizadas em eventos.

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

---

## 6. Permissões da extensão

### Conferente

Pode:

* registrar conferência;
* consultar eventos;
* consultar eventos por placa;
* consultar eventos por usuário;
* consultar extrato;
* consultar produtividade por usuário.

### Líder

Possui todas as permissões do conferente e também pode:

* cadastrar usuários;
* editar usuários;
* inativar usuários;
* cadastrar placas;
* editar placas;
* inativar placas;
* editar eventos existentes;
* consultar registros de auditoria.

Operações administrativas exigem validação por PIN de líder.

O PIN é utilizado para liberar o acesso à área administrativa, não para autenticar cada alteração individualmente.

---

## 7. Auditoria

Alterações administrativas relevantes em eventos devem gerar registros na coleção `auditoria`.

Cada registro permite identificar:

* ação realizada;
* data e hora;
* evento alterado;
* usuário responsável;
* campo modificado;
* valor anterior;
* valor novo.

A auditoria permite preservar o histórico das alterações realizadas nos registros existentes.

---

## 8. Regras de Firestore

As regras atuais permitem acesso somente quando existe uma sessão autenticada:

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

A autenticação técnica do Firebase é necessária para acesso ao Firestore.

O controle de permissões administrativas também é realizado pela aplicação por meio da identificação de líder e validação do PIN.

---

## 9. Segurança e credenciais

Credenciais do Firebase Authentication, chaves privadas, tokens, arquivos de conta de serviço e outros segredos não devem ser armazenados neste README ou versionados no repositório.

Configurações públicas necessárias para o funcionamento do Firebase Web podem permanecer no código conforme o modelo de autenticação utilizado.

A configuração pública do Firebase Web não deve ser considerada, isoladamente, um segredo. A proteção dos dados depende principalmente das regras de segurança do Firebase e do controle de autenticação e autorização.

---

## 10. Escopo

A extensão é focada em registro, consulta e administração de conferências.

### Inclui

* registro de conferência;
* consulta de eventos;
* consulta por placa;
* consulta por usuário;
* extrato diário;
* produtividade por usuário;
* cadastro de usuários;
* edição e inativação de usuários;
* cadastro de placas;
* edição e inativação de placas;
* edição administrativa de eventos;
* auditoria de alterações;
* automação na criação das coleções e campos necessários no Firestore.

### Não inclui

* gestão financeira;
* emissão de documentos fiscais;
* cálculo de frete;
* gerenciamento de transporte;
* gestão avançada de estoque;
* funções de WMS/TMS;
* avaliação automática de desempenho;
* gestão logística ampla.

---

## 11. Estado do projeto

O projeto encontra-se concluído e congelado na versão atual.

A versão atual foi validada por meio de testes envolvendo:

* autenticação;
* cadastro de usuários;
* edição de usuários;
* inativação de usuários;
* cadastro de placas;
* edição de placas;
* inativação de placas;
* registro de eventos;
* consulta de eventos;
* extrato;
* produtividade;
* administração;
* edição de eventos;
* auditoria de alterações.

Este documento representa a referência funcional e técnica da versão congelada do projeto.

---

## 12. Projeto pessoal e portfólio

Este projeto foi desenvolvido como projeto pessoal, de aprendizado e portfólio profissional.

A publicação do código tem como objetivo demonstrar conhecimentos práticos de:

* desenvolvimento de extensões Chrome;
* JavaScript;
* integração com Firebase;
* Firebase Authentication;
* Firestore;
* persistência de dados;
* autenticação;
* autorização;
* auditoria;
* desenvolvimento de interfaces;
* testes;
* documentação;
* organização de software.

O projeto não representa uma solução oficialmente vinculada a qualquer empresa, organização ou operação específica.

Dados utilizados durante o desenvolvimento e testes não fazem parte do código-fonte público.

---

## 13. Direitos autorais e termos de uso

© 2026 Rodrygo Moura Mujol. Todos os direitos reservados.

Este projeto foi desenvolvido como projeto pessoal e portfólio profissional.

O código-fonte é disponibilizado publicamente para fins de estudo, aprendizado, avaliação técnica e uso pessoal.

### Permitido

É permitido:

* visualizar o código-fonte;
* estudar a implementação;
* utilizar o projeto para fins pessoais e educacionais;
* executar o projeto localmente;
* modificar o código para uso pessoal;
* utilizar trechos do código para fins de aprendizado.

### Não permitido

Sem autorização expressa do autor, não é permitido:

* utilizar o projeto ou partes dele para fins comerciais;
* vender, sublicenciar ou revender o projeto;
* oferecer o projeto como serviço pago;
* incorporar o projeto em produto comercial;
* distribuir versões modificadas com finalidade comercial;
* remover ou alterar os avisos de direitos autorais;
* apresentar o projeto ou partes substanciais dele como criação própria.

A publicação do código-fonte neste repositório não constitui transferência de propriedade intelectual ou concessão de direitos comerciais.

Para utilização comercial, distribuição comercial ou licenciamento do projeto, é necessária autorização prévia e expressa do autor.

---

## 14. Observação sobre utilização

O projeto é disponibilizado publicamente como referência de desenvolvimento e aprendizado.

Qualquer pessoa pode estudar o código e utilizar o projeto dentro dos limites estabelecidos nestes termos de uso.

A utilização em ambiente real é de responsabilidade do usuário, incluindo configuração do Firebase, regras de segurança, gerenciamento de credenciais, manutenção e adequação às necessidades específicas do ambiente.

---

## 15. Autor

**Rodrygo Moura Mujol**

Projeto desenvolvido como parte do portfólio pessoal e como experiência prática de desenvolvimento de software.
