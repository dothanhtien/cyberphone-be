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
import { UsersService } from './users.service';
import { NonEmptyBodyPipe } from 'src/validation/non-empty-body.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body(new NonEmptyBodyPipe()) createUserDto: CreateUserDto,
    @CurrentUser() user: User,
  ) {
    createUserDto.createdBy = user.id;
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() query: GetUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new NonEmptyBodyPipe()) updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    updateUserDto.updatedBy = user.id;
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async deactiveUser(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    await this.usersService.update(id, { isActive: false, updatedBy: user.id });
    return true;
  }
}
