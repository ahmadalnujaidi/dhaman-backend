import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { WarrantiesService } from './warranties.service';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

@Controller('warranties')
export class WarrantiesController {
  constructor(private readonly warrantiesService: WarrantiesService) {}

  // Create a new warranty
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'receipt', maxCount: 1 }, // Add this line - 'receipt' is the field name
    { name: 'item_image', maxCount: 1 } // Add this line - 'item_image' is the field name
  ]))
  async create(@Body() createWarrantyDto: CreateWarrantyDto,
  @Req() req: any,
  @UploadedFiles() files: { receipt?: Express.Multer.File[], item_image?: Express.Multer.File[] }) {
    // Add user_id from JWT token
    const warrantyData = {
      ...createWarrantyDto,
      user_id: req.user.id,
    };
  
    return this.warrantiesService.create(warrantyData, req.user.email, files);
  }

  // Get all warranties for the authenticated user
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.warrantiesService.findAll(req.user.id);
  }

  // Get a specific warranty by ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warrantiesService.findOne(+id);
  }
}
