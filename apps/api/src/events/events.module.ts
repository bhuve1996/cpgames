import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { CommunitiesModule } from '../communities/communities.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [CommunitiesModule, EmailModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
