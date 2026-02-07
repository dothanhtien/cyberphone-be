import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '@/users/entities/responses/user-response.dto';

export class LoginResponseDto extends UserResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}
