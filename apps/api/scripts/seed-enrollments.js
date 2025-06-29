// apps/api/scripts/seed-enrollments.js
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0GMqoW7Rybav@ep-proud-hall-acmpqghe-pooler.sa-east-1.aws.neon.tech/skillshare_hub?sslmode=require',
    entities: ['dist/src/**/*.entity.js'],
    synchronize: false,
});

async function seedEnrollments() {
    try {
        console.log('🔗 Iniciando seed de enrollments...');
        await dataSource.initialize();
        console.log('✅ Conexão estabelecida');

        // Buscar primeiro workshop e primeiro usuário student
        const workshops = await dataSource.query('SELECT id FROM workshops LIMIT 3');
        const students = await dataSource.query("SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1");
        
        if (workshops.length === 0 || students.length === 0) {
            console.log('❌ Não há workshops ou estudantes disponíveis');
            return;
        }

        console.log(`📚 Encontrados ${workshops.length} workshops e ${students.length} estudantes`);

        // Criar enrollments de teste
        const enrollmentData = workshops.map(workshop => `
            (gen_random_uuid(), '${students[0].id}', '${workshop.id}', NOW())
        `).join(',');

        const enrollmentsSQL = `
            INSERT INTO enrollments (id, user_id, workshop_id, created_at)
            VALUES ${enrollmentData};
        `;

        await dataSource.query(enrollmentsSQL);
        console.log('✅ Enrollments criados com sucesso!');

        // Verificar quantos enrollments foram criados
        const count = await dataSource.query('SELECT COUNT(*) FROM enrollments');
        console.log(`📊 Total de enrollments no banco: ${count[0].count}`);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await dataSource.destroy();
        console.log('🔌 Conexão fechada');
    }
}

seedEnrollments();
