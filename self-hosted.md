# Self-Hosted Version

## Open Ports

You need to open several ports:
  - `3000` - application port
  - `8080` - nginx port
  - `80` - supabase dashboard port
  - `5432` - postgres port
  - `54321` - need for application access to supabase
  - `54323` - here will be your local supabase GUI (*optional)

## Install Homebrew

[How to install Homebrew](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-homebrew-on-linux)

## Install Nodejs

[How to Install Node using NVM](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-3-installing-node-using-the-node-version-manager)

Then you need to install Node `v18.20.2` via NVM:

```bash
  nvm install 18.20.2
  nvm use 18.20.2
```

## Install Docker Engine

[How to install Docker Engine](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)

If you want to run docker as non-root user then you need to add it to the docker group.

```bash
  sudo groupadd docker
  sudo usermod -aG docker $USER
  newgrp docker
```

## Install Docker Compose

[How to install Docker Compose](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)


## Install NGINX

We need to run NGINX with HTML templates (used by supabase when send email) you can check README file from `supabase-nginx` repo how to change templates.

Repo - [supabase-nginx](https://github.com/shortyfactory/supabase-nginx)

```bash
  git clone https://github.com/shortyfactory/supabase-nginx

  cd supabase-nginx

  docker compose up -d
```

## Install Supabase CLI

```bash
  brew install supabase/tap/supabase
```

## Install Self-Hosted Supabase
  
Documentation - [Supabase Self-Hosting with Docker](https://supabase.com/docs/guides/self-hosting/docker)

Clone repository to the root folder

```bash
  git clone --depth 1 https://github.com/supabase/supabase
```
Now you need to add few ENV variable to use custom HTML templates

```bash
  cd supabase/docker
```

Now open file `docker-compose.yaml` and add those lines to the `auth` service in the `environment` section:

```bash
  GOTRUE_MAILER_TEMPLATES_MAGIC_LINK: ${MAILER_TEMPLATES_MAGIC_LINK}
  GOTRUE_MAILER_TEMPLATES_EMAIL_CHANGE: ${MAILER_TEMPLATES_EMAIL_CHANGE}
  GOTRUE_MAILER_TEMPLATES_RECOVERY: ${MAILER_TEMPLATES_RECOVERY}
  GOTRUE_MAILER_TEMPLATES_CONFIRMATION: ${MAILER_TEMPLATES_CONFIRMATION}
  GOTRUE_MAILER_TEMPLATES_INVITE: ${MAILER_TEMPLATES_INVITE}
  GOTRUE_SUBJECTS_MAGIC_LINK: ${MAILER_SUBJECTS_MAGIC_LINK}
  GOTRUE_SUBJECTS_EMAIL_CHANGE: ${MAILER_SUBJECTS_EMAIL_CHANGE}
  GOTRUE_SUBJECTS_RECOVERY: ${MAILER_SUBJECTS_RECOVERY}
  GOTRUE_SUBJECTS_CONFIRMATION: ${MAILER_SUBJECTS_CONFIRMATION}
  GOTRUE_SUBJECTS_INVITE: ${MAILER_SUBJECTS_INVITE}
```

Then create `.env` file from example file and fill with your data:

```bash
  # Copy the example env vars
  cp .env.example .env
```

You nee to change those environment variables:
To generate `ANON_KEY` and `SERVICE_ROLE_KEY` keys you need to use your `JWT_SECRET` and this service - [generate-api-keys](https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys)

Note: set `KONG_HTTP_PORT` to `80` for correct emails redirection

Note: Replace `127.0.0.1` value in all the variable to your `Server IP Address`

```bash
# Replace with your creds 
  POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
  JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
  ANON_KEY=
  SERVICE_ROLE_KEY=
  DASHBOARD_USERNAME=user-for-supabase-dashboard
  DASHBOARD_PASSWORD=password-for-supabase-dashboard

# Replace to this values
  KONG_HTTP_PORT=80
  SITE_URL="http://127.0.0.1:3000"
  ADDITIONAL_REDIRECT_URLS="http://127.0.0.1:3000"
  API_EXTERNAL_URL="http://127.0.0.1:80"
  SUPABASE_PUBLIC_URL=http://127.0.0.1:80

# Add new variables for custom email templates and replace `127.0.0.1` to your server_IP
  MAILER_TEMPLATES_MAGIC_LINK=http://127.0.0.1:8080/html/magic-link
  MAILER_TEMPLATES_EMAIL_CHANGE=http://127.0.0.1:8080/html/email-change
  MAILER_TEMPLATES_RECOVERY=http://127.0.0.1:8080/html/password-reset
  MAILER_TEMPLATES_CONFIRMATION=http://127.0.0.1:8080/html/confirmation
  MAILER_TEMPLATES_INVITE=http://127.0.0.1:8080/html/invite
  MAILER_SUBJECTS_MAGIC_LINK=You access Link to Group AI Chatbot
  MAILER_SUBJECTS_EMAIL_CHANGE=Confirm Email Change
  MAILER_SUBJECTS_RECOVERY=Reset Your Password
  MAILER_SUBJECTS_CONFIRMATION=Confirm Your Signup
  MAILER_SUBJECTS_INVITE=You have been invited

# Change creds for SMTP
  SMTP_ADMIN_EMAIL=admin@example.com
  SMTP_HOST=supabase-mail
  SMTP_PORT=2500
  SMTP_USER=fake_mail_user
  SMTP_PASS=fake_mail_password
  SMTP_SENDER_NAME=fake_sender
```

After this start supabase with docker

```bash
# Pull the latest images
docker compose pull

# Start the services (in detached mode)
docker compose up -d
```

## Install ChatbotUI

Clone repository to the root folder

```bash
  git clone https://github.com/shortyfactory/chatbotui-v2.git
```

Then create `.env.local` file from example file and fill with your data:

```bash
  # Copy the example env vars
  cp .env.example .env.local
```

```bash
# Change `127.0.0.1` with your Server IP
  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:80 
# Your ANON_KEY from step when you run self-hosted supabase
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Your SERVICE_ROLE_KEY from step when you run self-hosted supabase
  SUPABASE_SERVICE_ROLE_KEY=

# OpenAI APi Key
  OPENAI_API_KEY=

# Azure OpenAI APi Key  
  AZURE_OPENAI_API_KEY=
# Azure OpenAI Endpoint  
  AZURE_OPENAI_ENDPOINT=
# Azure gpt-4-turbo model deployment name
  AZURE_GPT_45_TURBO_NAME=
# Azure gpt-4o model deployment name  
  AZURE_GPT_45_O_NAME=
```

Now run DB Supabase migrations:

```bash
# Replace `<password></password>` with the password from the step when you setup Self-Hosted Supabase `POSTGRES_PASSWORD`
# Replace `<server_ip_address>` with your server IP address
  supabase db reset --db-url "postgres://postgres:<password>@<server_ip_address>:5432/postgres"
```

If you pulled new version then apply new migrations with command:

```bash
# Replace `<password></password>` with the password from the step when you setup Self-Hosted Supabase `POSTGRES_PASSWORD`
# Replace `<server_ip_address>` with your server IP address
  supabase db push --db-url "postgres://postgres:<password>@<server_ip_address>:5432/postgres"
```

Now start Application

```bash
  docker compose up -d
```

Application will be started on port `3000`

Supabase Dashboard will be started on port `80`
