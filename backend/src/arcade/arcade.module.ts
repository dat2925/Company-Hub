import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ArcadeController } from './arcade.controller';
import { ArcadeService } from './arcade.service';

@Module({
  imports: [PrismaModule],
  controllers: [ArcadeController],
  providers: [ArcadeService],
})
export class ArcadeModule {}
