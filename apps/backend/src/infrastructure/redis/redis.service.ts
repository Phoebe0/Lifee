import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import Redis from 'ioredis'
import { RedisConfig } from '../../config/redis.config'

export const REDIS_CONFIG = Symbol('REDIS_CONFIG')

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client?: Redis

  constructor(@Inject(REDIS_CONFIG) private readonly config: RedisConfig) {}

  async onModuleInit() {
    if (!this.config.url) {
      return
    }

    this.client = new Redis(this.config.url)
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit()
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis client is not initialized')
    }

    return this.client
  }
}
