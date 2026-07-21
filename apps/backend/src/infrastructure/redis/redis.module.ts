import { Global, Module } from '@nestjs/common'
import { RedisConfig, redisConfig } from '../../config/redis.config'
import { REDIS_CONFIG, RedisService } from './redis.service'

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: REDIS_CONFIG,
      useFactory: (): RedisConfig => redisConfig()
    }
  ],
  exports: [RedisService]
})
export class RedisModule {}
