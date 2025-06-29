// apps/api/scripts/seed-database.js
const { DataSource } = require("typeorm");
const { Workshop } = require("../dist/src/workshops/entities/workshop.entity");
const {
  WorkshopMode,
} = require("../dist/src/workshops/entities/workshop.entity");

const dataSource = new DataSource({
  type: "postgres",
  url:
    process.env.DATABASE_URL ||
    "postgres://vancimj:1077@localhost:5432/skillshare_hub",
  entities: ["dist/src/**/*.entity.js"],
  synchronize: false,
});

const workshopsData = [
  {
    title: "Introdução ao React",
    description:
      "Aprenda os fundamentos do React para desenvolvimento web moderno. Cobriremos componentes, hooks, estado e props.",
    price: 89.9,
    startsAt: new Date("2025-07-15T14:00:00.000Z"),
    endsAt: new Date("2025-07-15T16:00:00.000Z"),
    maxParticipants: 25,
    mode: "ONLINE",
    location: "Zoom - Link será enviado por email",
    ownerId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    title: "Workshop de Node.js Avançado",
    description:
      "Aprofunde seus conhecimentos em Node.js com Express, APIs RESTful, middleware e boas práticas de desenvolvimento.",
    price: 149.9,
    date: new Date("2025-07-20T10:00:00.000Z"),
    duration: 180,
    maxParticipants: 20,
    mode: "PRESENTIAL",
    location: "Auditório Tech Hub - Rua das Tecnologias, 123",
    instructor: "Maria Santos",
  },
  {
    title: "Design System com Figma",
    description:
      "Crie design systems consistentes e escaláveis usando Figma. Aprenda componentes, tokens e documentação.",
    price: 79.9,
    date: new Date("2025-07-25T16:00:00.000Z"),
    duration: 150,
    maxParticipants: 30,
    mode: "ONLINE",
    location: "Google Meet - Acesso via plataforma",
    instructor: "Carlos Mendes",
  },
  {
    title: "Python para Data Science",
    description:
      "Introdução ao Python aplicado à ciência de dados. Pandas, NumPy, Matplotlib e análise exploratória de dados.",
    price: 199.9,
    date: new Date("2025-08-01T09:00:00.000Z"),
    duration: 240,
    maxParticipants: 15,
    mode: "PRESENTIAL",
    location: "Laboratório de Informática - Campus Universitário",
    instructor: "Ana Paula",
  },
  {
    title: "Git e GitHub para Iniciantes",
    description:
      "Domine o controle de versão com Git e colaboração no GitHub. Ideal para quem está começando na programação.",
    price: 49.9,
    date: new Date("2025-08-05T19:00:00.000Z"),
    duration: 90,
    maxParticipants: 40,
    mode: "ONLINE",
    location: "Microsoft Teams - Link no email de confirmação",
    instructor: "Pedro Oliveira",
  },
  {
    title: "UX/UI Design Thinking",
    description:
      "Metodologias de Design Thinking aplicadas ao UX/UI. Personas, jornadas do usuário e prototipagem.",
    price: 129.9,
    date: new Date("2025-08-10T14:30:00.000Z"),
    duration: 200,
    maxParticipants: 18,
    mode: "PRESENTIAL",
    location: "Centro de Design - Sala de Criatividade 201",
    instructor: "Luciana Costa",
  },
  {
    title: "Docker e DevOps Essencial",
    description:
      "Containerização com Docker, Docker Compose e introdução aos conceitos de DevOps e CI/CD.",
    price: 179.9,
    date: new Date("2025-08-15T11:00:00.000Z"),
    duration: 180,
    maxParticipants: 22,
    mode: "ONLINE",
    location: "Plataforma própria - Acesso será enviado",
    instructor: "Roberto Tech",
  },
  {
    title: "Marketing Digital para Desenvolvedores",
    description:
      "Como programadores podem aplicar marketing digital para promover seus projetos e carreira.",
    price: 69.9,
    date: new Date("2025-08-20T20:00:00.000Z"),
    duration: 100,
    maxParticipants: 35,
    mode: "ONLINE",
    location: "YouTube Live + Discord para interação",
    instructor: "Fernanda Marketing",
  },
  {
    title: "Banco de Dados PostgreSQL",
    description:
      "PostgreSQL do básico ao avançado. Modelagem, queries, índices, performance e boas práticas.",
    price: 249.9,
    date: new Date("2025-08-25T08:00:00.000Z"),
    duration: 300,
    maxParticipants: 12,
    mode: "PRESENTIAL",
    location: "Centro de Treinamento DB - Sala de Servidores",
    instructor: "Eduardo DBA",
  },
  {
    title: "React Native - Apps Mobile",
    description:
      "Desenvolvimento de aplicativos móveis multiplataforma com React Native. Do setup à publicação.",
    price: 189.9,
    date: new Date("2025-09-01T13:00:00.000Z"),
    duration: 240,
    maxParticipants: 20,
    mode: "ONLINE",
    location: "Webex + Laboratório virtual",
    instructor: "Mobile Dev Pro",
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    await dataSource.initialize();
    console.log("✅ Conexão com banco estabelecida");

    const workshopRepository = dataSource.getRepository(Workshop);

    // Limpar workshops existentes usando query bruta
    await dataSource.query("DELETE FROM workshops");
    console.log("🗑️  Workshops existentes removidos");

    // Inserir novos workshops
    for (const workshopData of workshopsData) {
      const workshop = workshopRepository.create(workshopData);
      await workshopRepository.save(workshop);
      console.log(`✅ Workshop criado: ${workshop.title}`);
    }

    console.log(
      `🎉 Seed concluído! ${workshopsData.length} workshops criados.`
    );
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
  } finally {
    await dataSource.destroy();
    console.log("🔌 Conexão com banco fechada");
  }
}

seedDatabase();
