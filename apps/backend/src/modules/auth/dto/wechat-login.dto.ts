import { IsOptional, IsString, MaxLength } from 'class-validator'

export class WechatLoginDto {
  @IsString()
  @MaxLength(128)
  code!: string

  @IsOptional()
  @IsString()
  @MaxLength(128)
  deviceId?: string
}
