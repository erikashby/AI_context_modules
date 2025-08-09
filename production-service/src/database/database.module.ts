import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbConfig = {
          type: 'postgres' as const,
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          autoLoadEntities: true,
          synchronize: configService.get('nodeEnv') === 'development',
          logging: configService.get('nodeEnv') === 'development',
          migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
          migrationsRun: false, // Don't auto-run migrations in production
        };

        // For deployment testing without real database
        if (configService.get('database.username') === 'placeholder') {
          console.log(
            '🔶 Database configured with placeholder values - connections will fail gracefully',
          );
        }

        return dbConfig;
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
