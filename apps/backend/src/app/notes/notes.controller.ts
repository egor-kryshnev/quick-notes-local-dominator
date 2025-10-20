import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { IUser } from '../auth/jwt.strategy';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Request() req: { user: IUser }, @Body() data: CreateNoteDto) {
    return this.notesService.create(req.user.userId, data);
  }

  @Get()
  findAll(@Request() req: { user: IUser }, @Query('tags') tags?: string) {
    const tagArray = tags ? tags.split(',') : undefined;
    return this.notesService.findAll(req.user.userId, tagArray);
  }

  @Get(':id')
  findOne(@Request() req: { user: IUser }, @Param('id') id: string) {
    return this.notesService.findOne(req.user.userId, +id);
  }

  @Patch(':id')
  update(@Request() req: { user: IUser }, @Param('id') id: string, @Body() data: UpdateNoteDto) {
    return this.notesService.update(req.user.userId, +id, data);
  }

  @Delete(':id')
  remove(@Request() req: { user: IUser }, @Param('id') id: string) {
    return this.notesService.remove(req.user.userId, +id);
  }
}
