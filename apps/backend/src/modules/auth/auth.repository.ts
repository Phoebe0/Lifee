import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByWechatOpenIdHash(openidHash: string, appid: string) {
    return this.prisma.wechatIdentity.findFirst({
      where: {
        openidHash,
        appid,
        deletedAt: null
      },
      include: {
        user: true
      }
    })
  }
}
