# Configuração do Firebase e Firestore

O sistema ganhou uma nova funcionalidade que permite criar automaticamente as coleções e os campos necessários no Firestore, caso eles ainda não existam. Para utilizar essa funcionalidade, é necessário configurar corretamente o Firebase, o Firestore e a autenticação.

1. Crie uma conta no Gmail.

2. Crie um projeto no Firebase: [Documentação do Firestore](https://firebase.google.com/docs/firestore?hl=pt-br%2F&utm_source=chatgpt.com)

3. Clique em **“Ir para o console”**.

4. Clique em **“Criar um novo projeto Firestore”**.

5. Insira um novo nome, por exemplo, **“qualquer_nome”**, e clique em **“Continuar”**.

6. Desmarque a opção **“Ativar o Google Analytics para este projeto”** e clique em **“Criar projeto”**.

7. Aguarde a criação do projeto.

8. Clique em **“Continuar”** e depois em **“Concluir”**.

9. Clique em **“+ Adicionar app”** e selecione **“Web”**.

10. Insira um apelido para o app, por exemplo, **“qualquer_nome”**, desmarque a opção **“Configurar Firebase Hosting para este app”** e clique em **“Registrar app”**.

11. Clique em **“Continuar para o console”**, sem alterar nada.

12. No menu lateral esquerdo, clique em **“Segurança”** e depois em **“Autenticação”**.

13. Clique em **“Vamos começar”**.

14. Selecione **“E-mail/senha”** e clique em **“Ativar”**.

15. A opção **“Link de e-mail (login sem senha)”** deve permanecer desativada. Depois, clique em **“Salvar”**.

16. Abaixo de **“Authentication”**, clique em **“Usuários”**.

17. Cadastre seu e-mail e sua senha.

> Este e-mail e esta senha serão solicitados pela extensão para acessar o Firestore. As credenciais não ficam gravadas no navegador como senha de acesso ao sistema.

18. No menu lateral esquerdo, clique em **“Banco de dados” → “Firestore”** e depois clique em **“Criar banco de dados”**.

19. Selecione **“Edição Standard”** e clique em **“Avançar”**.

20. Selecione o local **“southamerica-east1 (São Paulo)”**.

21. Na próxima tela, selecione **“Modo de produção”** e clique em **“Habilitar”**.

22. Clique em **“Criar”** e aguarde alguns segundos.

23. O Firebase redirecionará você para o banco de dados.

24. Clique na aba **“Regras”**.

25. Substitua:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

por:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /usuarios/{document} {
      allow read, create, update: if request.auth != null;
      allow delete: if false;
    }

    match /placas/{document} {
      allow read, create, update: if request.auth != null;
      allow delete: if false;
    }

    match /eventos/{document} {
      allow read, create, update: if request.auth != null;
      allow delete: if false;
    }

    match /auditoria/{document} {
      allow read, create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

26. Clique em **“Publicar”** e aguarde alguns segundos.

## Configuração do aplicativo

27. Agora, clique no logo do Firebase no canto superior esquerdo.

28. Na página seguinte, serão exibidos os seus projetos. Clique no projeto que você acabou de criar.

29. Na terceira linha da página, haverá um botão com o nome **“1 app”**.

30. Clique em **“1 app”** e depois clique em **“Configurações do projeto”** (ícone de engrenagem).

31. Role a página até encontrar **“Configuração do SDK”**.

32. Será exibido um trecho de configuração contendo informações do aplicativo.

33. Localize os valores:

```text
apiKey: "SUA_API_KEY"
projectId: "SEU_PROJECT_ID"
```

34. Copie os valores de **`apiKey`** e **`projectId`**.

35. Abra o arquivo **`firebaseConfig.js`** e substitua os valores de **`FIREBASE_API_KEY`** e **`PROJECT_ID`** pelos valores copiados.

36. Pronto. Agora você pode instalar a extensão no navegador e utilizar o e-mail e a senha cadastrados anteriormente para acessar o Firestore.
