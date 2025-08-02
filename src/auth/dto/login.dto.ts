import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  // This DTO is used for user login
  
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  password: string;
}
