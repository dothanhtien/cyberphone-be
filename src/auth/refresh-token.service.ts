import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor() {}
}
