// apps/api/scripts/simple-seed.js
const { DataSource } = require("typeorm");

const dataSource = new DataSource({
  type: "postgres",
  url:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_0GMqoW7Rybav@ep-proud-hall-acmpqghe-pooler.sa-east-1.aws.neon.tech/skillshare_hub?sslmode=require",
  entities: ["dist/src/**/*.entity.js"],
  synchronize: false,
});

async function seedSimple() {
  try {
    console.log("🌱 Iniciando seed simples...");
    await dataSource.initialize();
    console.log("✅ Conexão estabelecida");

    // Limpar dados existentes
    await dataSource.query("DELETE FROM workshops");
    await dataSource.query("DELETE FROM users");
    console.log("🗑️  Dados removidos");

    // Criar usuários instrutores
    const usersSQL = `
            INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
            VALUES 
            ('11111111-1111-1111-1111-111111111111', 'João Silva', 'joao@skillshare.com', '$2b$10$hash123456789', 'INSTRUCTOR', NOW(), NOW()),
            ('22222222-2222-2222-2222-222222222222', 'Maria Santos', 'maria@skillshare.com', '$2b$10$hash123456789', 'INSTRUCTOR', NOW(), NOW()),
            ('33333333-3333-3333-3333-333333333333', 'Pedro Costa', 'pedro@skillshare.com', '$2b$10$hash123456789', 'INSTRUCTOR', NOW(), NOW()),
            ('44444444-4444-4444-4444-444444444444', 'Ana Oliveira', 'ana@skillshare.com', '$2b$10$hash123456789', 'INSTRUCTOR', NOW(), NOW()),
            ('55555555-5555-5555-5555-555555555555', 'Carlos Ferreira', 'carlos@skillshare.com', '$2b$10$hash123456789', 'INSTRUCTOR', NOW(), NOW());
        `;

    await dataSource.query(usersSQL);
    console.log("✅ 5 usuários instrutores criados");

    // Inserir workshops com owner_id válido
    const workshopsSQL = `
            INSERT INTO workshops (id, title, description, price, mode, location, starts_at, ends_at, max_participants, owner_id, created_at, updated_at)
            VALUES 
            (gen_random_uuid(), 'Introdução ao React', 'Aprenda os fundamentos do React para desenvolvimento web moderno.', 89.90, 'ONLINE', 'Zoom', '2025-07-15 14:00:00', '2025-07-15 16:00:00', 25, '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
            (gen_random_uuid(), 'Node.js Avançado', 'Aprofunde seus conhecimentos em Node.js com Express e APIs RESTful.', 149.90, 'PRESENTIAL', 'Auditório Tech Hub', '2025-07-20 10:00:00', '2025-07-20 13:00:00', 20, '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
            (gen_random_uuid(), 'Design System com Figma', 'Crie design systems consistentes e escaláveis usando Figma.', 79.90, 'ONLINE', 'Google Meet', '2025-07-25 16:00:00', '2025-07-25 18:30:00', 30, '22222222-2222-2222-2222-222222222222', NOW(), NOW()),
            (gen_random_uuid(), 'Python para Data Science', 'Introdução ao Python aplicado à ciência de dados.', 199.90, 'PRESENTIAL', 'Laboratório de Informática', '2025-08-01 09:00:00', '2025-08-01 13:00:00', 15, '33333333-3333-3333-3333-333333333333', NOW(), NOW()),
            (gen_random_uuid(), 'Git e GitHub para Iniciantes', 'Domine o controle de versão com Git e colaboração no GitHub.', 49.90, 'ONLINE', 'Microsoft Teams', '2025-08-05 19:00:00', '2025-08-05 20:30:00', 40, '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
            (gen_random_uuid(), 'UX/UI Design Thinking', 'Metodologias de Design Thinking aplicadas ao UX/UI.', 129.90, 'PRESENTIAL', 'Centro de Design', '2025-08-10 14:30:00', '2025-08-10 17:50:00', 18, '22222222-2222-2222-2222-222222222222', NOW(), NOW()),
            (gen_random_uuid(), 'Docker e DevOps Essencial', 'Containerização com Docker e introdução aos conceitos de DevOps.', 179.90, 'ONLINE', 'Plataforma própria', '2025-08-15 11:00:00', '2025-08-15 14:00:00', 22, '44444444-4444-4444-4444-444444444444', NOW(), NOW()),
            (gen_random_uuid(), 'Marketing Digital para Devs', 'Como programadores podem aplicar marketing digital.', 69.90, 'ONLINE', 'YouTube Live', '2025-08-20 20:00:00', '2025-08-20 21:40:00', 35, '55555555-5555-5555-5555-555555555555', NOW(), NOW()),
            (gen_random_uuid(), 'PostgreSQL Avançado', 'PostgreSQL do básico ao avançado. Modelagem e performance.', 249.90, 'PRESENTIAL', 'Centro de Treinamento DB', '2025-08-25 08:00:00', '2025-08-25 13:00:00', 12, '33333333-3333-3333-3333-333333333333', NOW(), NOW()),
            (gen_random_uuid(), 'React Native - Apps Mobile', 'Desenvolvimento de aplicativos móveis multiplataforma.', 189.90, 'ONLINE', 'Discord + Screen Share', '2025-08-30 15:00:00', '2025-08-30 18:00:00', 16, '11111111-1111-1111-1111-111111111111', NOW(), NOW());
        `;

    await dataSource.query(workshopsSQL);
    console.log("✅ 10 workshops criados com sucesso!");

    // Verificar quantos usuários e workshops foram criados
    const userCount = await dataSource.query("SELECT COUNT(*) FROM users");
    const workshopCount = await dataSource.query(
      "SELECT COUNT(*) FROM workshops"
    );
    console.log(`📊 Total de usuários no banco: ${userCount[0].count}`);
    console.log(`📊 Total de workshops no banco: ${workshopCount[0].count}`);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    await dataSource.destroy();
    console.log("🔌 Conexão fechada");
  }
}

seedSimple();
