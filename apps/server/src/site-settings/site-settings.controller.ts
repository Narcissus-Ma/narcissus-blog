import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';

import { UpdateSiteSettingDto } from './dto/update-site-setting.dto';
import { SiteSettingsService } from './site-settings.service';

@ApiTags('site-settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Public()
  @Get('public')
  async getPublicSetting() {
    return this.siteSettingsService.getCurrent();
  }

  @ApiBearerAuth()
  @Get()
  async getAdminSetting() {
    return this.siteSettingsService.getCurrent();
  }

  @ApiBearerAuth()
  @Put()
  async update(@Body() payload: UpdateSiteSettingDto) {
    return this.siteSettingsService.update(payload);
  }
}
