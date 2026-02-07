# Configuração de E-mails no Supabase

## Configurações Necessárias no Dashboard do Supabase

Para habilitar o envio de e-mails de confirmação de conta, siga estas etapas:

### 1. Acesse o Dashboard do Supabase
- Vá para: https://supabase.com/dashboard/project/bgdvlhttyjeuprrfxgun
- Faça login com sua conta

### 2. Configure as Configurações de Autenticação
- No menu lateral, clique em "Authentication"
- Vá para a aba "Settings"
- Na seção "User Signups", configure:
  - ✅ **Enable email confirmations**: Ativado
  - ✅ **Enable email change confirmations**: Ativado
  - ✅ **Enable phone confirmations**: Ativado (se necessário)

### 3. Configure os Templates de E-mail
- Na aba "Email Templates", configure:

#### Template de Confirmação de E-mail:
```
Assunto: Confirme seu e-mail para o Meta Construtor

Conteúdo:
Olá {{ .Email }},

Bem-vindo ao Meta Construtor! 

Para ativar sua conta, clique no link abaixo:

{{ .ConfirmationURL }}

Se você não criou esta conta, pode ignorar este e-mail.

Atenciosamente,
Equipe Meta Construtor
```

#### Template de Recuperação de Senha:
```
Assunto: Redefinir sua senha - Meta Construtor

Conteúdo:
Olá {{ .Email }},

Você solicitou a redefinição de sua senha no Meta Construtor.

Clique no link abaixo para redefinir sua senha:

{{ .ConfirmationURL }}

Este link expira em 24 horas.

Se você não solicitou esta redefinição, ignore este e-mail.

Atenciosamente,
Equipe Meta Construtor
```

### 4. Configure o SMTP (Opcional - para e-mails personalizados)
- Na aba "Settings" > "SMTP Settings"
- Configure seu provedor de e-mail preferido:
  - SendGrid
  - Mailgun
  - Amazon SES
  - Ou use o SMTP padrão do Supabase

### 5. URLs de Redirecionamento
- Na seção "URL Configuration", configure:
  - **Site URL**: https://metaconstrutor-4mj3uriys-meta-construtors-projects.vercel.app
  - **Redirect URLs**: 
    - https://metaconstrutor-4mj3uriys-meta-construtors-projects.vercel.app/login
    - https://metaconstrutor-4mj3uriys-meta-construtors-projects.vercel.app/criar-conta

### 6. Configurações de Segurança
- Na seção "Security", configure:
  - **JWT expiry**: 3600 (1 hora)
  - **Refresh token expiry**: 2592000 (30 dias)
  - **Enable refresh token rotation**: Ativado

## Testando a Configuração

Após configurar, teste o fluxo:

1. Acesse a página de criar conta
2. Preencha o formulário com um e-mail válido
3. Verifique se recebe o e-mail de confirmação
4. Clique no link do e-mail para confirmar a conta
5. Tente fazer login com as credenciais

## Troubleshooting

### E-mails não estão sendo enviados:
- Verifique se as configurações de SMTP estão corretas
- Confirme se os templates de e-mail estão configurados
- Verifique a caixa de spam

### Link de confirmação não funciona:
- Verifique se as URLs de redirecionamento estão configuradas corretamente
- Confirme se o domínio está autorizado no Supabase

### Usuário não é criado:
- Verifique se "Enable email confirmations" está ativado
- Confirme se o usuário está aguardando confirmação por e-mail
