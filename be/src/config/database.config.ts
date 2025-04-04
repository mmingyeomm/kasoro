import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'kasoro-database.c4pgceuiumy5.us-east-1.rds.amazonaws.com',
  port: 3306,
  username: 'admin',
  password: 'rootroot',
  database: 'kasoro',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Set to false in production
}; 