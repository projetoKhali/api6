# Funcionalidade de Envio de E-mail

Este módulo realiza o envio de e-mails para usuários filtrados a partir de um banco de dados, utilizando informações criptografadas e configuráveis via arquivo YAML.

## Como funciona

1. **Carregamento de Configuração**
    - O arquivo `apps/notif/config.yaml` é lido para obter as configurações de SMTP, e-mail e filtros de usuários.

2. **Consulta e Descriptografia de Usuários**
    - Os usuários são buscados no banco de dados PostgreSQL.
    - Os campos sensíveis (nome e e-mail) são descriptografados utilizando chaves individuais armazenadas em outra tabela.

3. **Filtragem**
    - Os usuários são filtrados conforme critérios definidos no arquivo de configuração, como:
      - Permissão
      - Status de desativação
      - Domínio do e-mail
      - ID do usuário
      - Substring no login ou nome

4. **Envio de E-mail**
    - Para cada usuário filtrado, um e-mail é enviado utilizando o servidor SMTP configurado.
    - O corpo do e-mail pode ser personalizado com variáveis (ex: nome do usuário) usando Jinja2.

5. **Tratamento de Erros**
    - Erros de descriptografia, consulta ou envio de e-mail são tratados e exibidos no console, sem interromper o processamento dos demais usuários.

## Fluxo Resumido

1. Carrega configurações do YAML.
2. Busca e descriptografa usuários do banco.
3. Aplica filtros definidos.
4. Envia e-mails personalizados para cada usuário filtrado.

## Principais Dependências

- `smtplib`, `email.mime`: Envio de e-mails.
- `cryptography.fernet`: Descriptografia dos dados dos usuários.
- `jinja2`: Template para personalização do corpo do e-mail.
- `PyYAML`: Leitura do arquivo de configuração.
- SQLAlchemy: Acesso ao banco de dados.

## Observações

- As credenciais SMTP e o corpo do e-mail são definidos no arquivo de configuração.
- O envio é feito de forma segura (TLS).
- O sistema é tolerante a falhas individuais de usuários.

## Testes

- Para testes é necessário um email (host) válido
- É necessário uma senha de app válida
> A senha pode ser obdita em [google suport](https://support.google.com/accounts/answer/185833?visit_id=638836992681681745-3093237853&p=InvalidSecondFactor&rd=1#:~:text=Crie%20e%20gerencie%20suas%20senhas%20de%20app)