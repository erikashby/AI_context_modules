import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
// TODO: Import JWT guard when implemented
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @UseGuards(JwtAuthGuard) // TODO: Uncomment when JWT guard is implemented
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard) // TODO: Uncomment when JWT guard is implemented
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}