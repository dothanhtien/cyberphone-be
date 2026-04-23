import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UsersService } from './users.service';
import { LoggedInUser } from '@/auth/decorators';
import { PaginationQueryDto } from '@/common/dto';
import { NonEmptyBodyPipe } from '@/common/pipes';

@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    createUserDto.createdBy = loggedInUserId;
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateUserDto: UpdateUserDto,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    updateUserDto.updatedBy = loggedInUserId;
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @LoggedInUser('id') loggedInUserId: string,
  ) {
    await this.usersService.update(id, {
      isActive: false,
      updatedBy: loggedInUserId,
    });
    return true;
  }
}
