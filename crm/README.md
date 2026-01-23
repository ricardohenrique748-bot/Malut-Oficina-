# Malut CRM | Guia de Instalação e Uso

Este é um sistema de CRM premium estilo SaaS, desenvolvido com PHP 8, MySQL e Tailwind CSS, integrado à IA do Google Gemini.

## 🚀 Estrutura do Projeto
- `/index.php`: Quiz interativo estilo Typeform para captura de leads.
- `/api/new-lead.php`: Processamento de leads com qualificação via IA.
- `/admin/kanban.php`: Dashboard com quadro Kanban arrastável.
- `/admin/details.php`: Visualização detalhada de leads com insights da IA.

## 🛠️ Requisitos
- Servidor PHP (7.4 ou superior)
- MySQL
- Conexão com a Internet (para carregar Tailwind, Lucide e SortableJS)
- Chave de API do Google Gemini (opcional, mas recomendada)

## 📦 Instalação

### 1. Banco de Dados
- Importe o arquivo `database.sql` no seu console MySQL ou utilize um gerenciador como o phpMyAdmin.
- O script criará o banco `crm_db` e a tabela `leads`.

### 2. Configuração
- Abra o arquivo `config.php`.
- Ajuste os dados de conexão com o seu MySQL:
  ```php
  define('DB_HOST', 'localhost');
  define('DB_USER', 'seu_usuario');
  define('DB_PASS', 'sua_senha');
  define('DB_NAME', 'crm_db');
  ```
- Configure sua chave da API do Gemini para habilitar a qualificação automática:
  ```php
  define('GEMINI_API_KEY', 'SUA_CHAVE_AQUI');
  ```
- Defina o usuário e senha do administrador:
  ```php
  define('ADMIN_USER', 'admin');
  define('ADMIN_PASS', 'admin123');
  ```

## 🎯 Como Usar

1. **Captura de Leads**: Aponte o navegador para `http://localhost/crm/index.php`. O lead responderá às perguntas com animações suaves e progresso em tempo real.
2. **Qualificação IA**: Ao finalizar o quiz, os dados são enviados para a IA que categoriza o lead por faturamento, define um score de potencial (0-100) e gera "tags" de insights.
3. **Gerenciamento CRM**: Acesse `http://localhost/crm/admin/` para entrar no painel. Use o Kanban para organizar os leads arrastando os cards entre as colunas correspondentes ao faturamento.
4. **Detalhes**: Clique em "Detalhes" em qualquer card para ver todas as respostas do lead, o resumo gerado pela IA e realizar uma reanálise se necessário.

---
*Desenvolvido com foco em estética premium e alta conversão.*
