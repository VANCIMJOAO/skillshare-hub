// apps/api/scripts/create-admin.js
const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');

const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://vancimj:1077@localhost:5432/skillshare_hub',
    entities: ['dist/**/*.entity.js'],
    synchronize: false,
});

async function createAdmin() {
    try {
        console.log('👤 Criando usuário admin...');

        await dataSource.initialize();
        console.log('✅ Conexão com banco estabelecida');

        // Importar a entidade User após inicializar o DataSource
        const { User } = require('../dist/users/entities/user.entity');
        const { UserRole } = require('../dist/users/entities/user.entity');

        const userRepository = dataSource.getRepository(User);

        // Verificar se já existe um admin
        const existingAdmin = await userRepository.findOne({
            where: { email: 'admin@skillsharehub.com' }
        });

        if (existingAdmin) {
            console.log('⚠️  Usuário admin já existe!');
            console.log('Email: admin@skillsharehub.com');
            console.log(`ID: ${existingAdmin.id}`);
            return;
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Criar usuário admin
        const adminUser = userRepository.create({
            name: 'Administrador',
            email: 'admin@skillsharehub.com',
            passwordHash: hashedPassword,
            role: UserRole.ADMIN,
            isEmailVerified: true,
        });

        const savedAdmin = await userRepository.save(adminUser);

        console.log('🎉 Usuário admin criado com sucesso!');
        console.log('='.repeat(40));
        console.log('📧 Email: admin@skillsharehub.com');
        console.log('🔒 Senha: admin123');
        console.log(`🆔 ID: ${savedAdmin.id}`);
        console.log('👑 Role: ADMIN');
        console.log('='.repeat(40));

    } catch (error) {
        console.error('❌ Erro ao criar admin:', error);
    } finally {
        await dataSource.destroy();
        console.log('🔌 Conexão com banco fechada');
    }
}

createAdmin();
