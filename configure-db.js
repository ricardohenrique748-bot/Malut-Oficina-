/**
 * Script auxiliar para configurar DATABASE_URL
 * 
 * Este script vai te ajudar a configurar a conexão com o banco de dados.
 * 
 * INSTRUÇÕES:
 * 1. Acesse: https://supabase.com/dashboard/project/tywicebsjpmncwyoqmie/settings/database
 * 2. Encontre a seção "Connection String"
 * 3. Clique na aba "URI"
 * 4. Copie a string de conexão (ela se parece com: postgresql://postgres.[ref]:[senha]@...)
 * 5. Execute este script com sua string de conexão:
 *    node configure-db.js "sua-string-de-conexao-aqui"
 */

const fs = require('fs');
const path = require('path');

const connectionString = process.argv[2];

if (!connectionString) {
  console.error('\n❌ Erro: Nenhuma string de conexão fornecida\n');
  console.log('Uso: node configure-db.js "postgresql://postgres:senha@db.tywicebsjpmncwyoqmie.supabase.co:5432/postgres"\n');
  console.log('📋 Passos para obter sua string de conexão:');
  console.log('1. Acesse: https://supabase.com/dashboard/project/tywicebsjpmncwyoqmie/settings/database');
  console.log('2. Encontre a seção "Connection String"');
  console.log('3. Clique na aba "URI"');
  console.log('4. Copie a string de conexão completa');
  console.log('5. Execute: node configure-db.js "cole-a-string-de-conexao-aqui"\n');
  process.exit(1);
}

// Validar formato da string de conexão
if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
  console.error('\n❌ Erro: Formato de string de conexão inválido');
  console.error('Formato esperado: postgresql://postgres:senha@db.tywicebsjpmncwyoqmie.supabase.co:5432/postgres\n');
  process.exit(1);
}

// Verificar se é para o projeto correto
if (!connectionString.includes('tywicebsjpmncwyoqmie')) {
  console.warn('\n⚠️  Aviso: A string de conexão não corresponde ao ID do projeto esperado (tywicebsjpmncwyoqmie)');
  console.warn('Tem certeza que esta é a string de conexão correta?\n');
}

// Criar ou atualizar arquivo .env.local (Next.js prioriza este sobre .env)
const envLocalPath = path.join(__dirname, '.env.local');
const envContent = `# Conexão com Banco de Dados
# Gerado em ${new Date().toISOString()}
DATABASE_URL="${connectionString}"
`;

try {
  // Verificar se .env.local existe
  let existingContent = '';
  if (fs.existsSync(envLocalPath)) {
    existingContent = fs.readFileSync(envLocalPath, 'utf8');

    // Verificar se DATABASE_URL já existe
    if (existingContent.includes('DATABASE_URL=')) {
      console.log('\n📝 Atualizando DATABASE_URL existente em .env.local...');
      // Substituir DATABASE_URL existente
      existingContent = existingContent.replace(
        /DATABASE_URL=.*/g,
        `DATABASE_URL="${connectionString}"`
      );
      fs.writeFileSync(envLocalPath, existingContent, 'utf8');
    } else {
      console.log('\n📝 Adicionando DATABASE_URL ao .env.local existente...');
      // Adicionar ao arquivo existente
      fs.appendFileSync(envLocalPath, '\n' + envContent, 'utf8');
    }
  } else {
    console.log('\n📝 Criando novo arquivo .env.local...');
    fs.writeFileSync(envLocalPath, envContent, 'utf8');
  }

  console.log('✅ DATABASE_URL configurado com sucesso!\n');
  console.log('📍 Localização: .env.local');
  console.log('🔒 String de conexão: ' + connectionString.substring(0, 50) + '...\n');
  console.log('Próximos passos:');
  console.log('1. Reinicie seu servidor de desenvolvimento (Ctrl+C e depois npm run dev)');
  console.log('2. A aplicação agora deve conectar ao banco de dados\n');

} catch (error) {
  console.error('\n❌ Erro ao escrever em .env.local:', error.message);
  console.error('\nConfiguração manual:');
  console.error('Crie um arquivo chamado .env.local na raiz do projeto com:');
  console.error(`DATABASE_URL="${connectionString}"\n`);
  process.exit(1);
}
