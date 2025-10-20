import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  private getCacheKey(userId: number, tags?: string[]) {
    if (!tags || tags.length === 0) return `notes:${userId}:all`;
    return `notes:${userId}:tags:${tags.sort().join(',')}`;
  }

  async create(userId: number, data: CreateNoteDto): Promise<Note> {
    const note = this.prisma.note.create({
      data: { ...data, userId },
    });

    // Invalidate cached lists for this user
    await this.redis.del(`notes:${userId}:all`);
    return note;
  }

  async findAll(userId: number, tags?: string[]): Promise<Note[]> {
    const cacheKey = this.getCacheKey(userId, tags);
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const where = tags && tags.length > 0 ? { userId, tags: { hasSome: tags } } : { userId }

    const notes = await this.prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    await this.redis.set(cacheKey, notes, 120); // cache for 2 minutes
    return notes;
  }

  async findOne(userId: number, id: number): Promise<Note> {
    const note = await this.prisma.note.findFirst({ where: { id, userId } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async update(userId: number, id: number, data: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(userId, id);
    await this.redis.del(`notes:${userId}:all`);
    return this.prisma.note.update({
      where: { id: note.id },
      data,
    });
  }

  async remove(userId: number, id: number): Promise<Note> {
    const note = await this.findOne(userId, id);
    await this.redis.del(`notes:${userId}:all`);
    return this.prisma.note.delete({ where: { id: note.id } });
  }
}
