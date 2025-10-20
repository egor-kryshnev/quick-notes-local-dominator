import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Note } from '@prisma/client';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | undefined;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  onModuleDestroy() {
    this.client?.quit();
  }

  getClient() {
    return this.client;
  }

  async get(key: string) {
    const data = await this.client?.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: Note[], ttlSeconds = 60) {
    await this.client?.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string) {
    await this.client?.del(key);
  }
}
