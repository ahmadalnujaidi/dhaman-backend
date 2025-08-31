import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Warranty } from './entities/warranty.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { s3Bucket, s3Config } from 'src/config/s3.config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class WarrantiesService {

  constructor(
    @InjectRepository(Warranty)
    private warrantiesRepository: Repository<Warranty>,
    private usersService: UsersService,
  ) {}

  // Add this method to generate presigned URLs
async generatePresignedUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
  const s3 = new S3Client(s3Config);
  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: s3Key,
  });
  
  return await getSignedUrl(s3, command, { expiresIn });
}

  async create(createWarrantyDto: CreateWarrantyDto,
    userEmail: string,
    files: { receipt?: Express.Multer.File[], item_image?: Express.Multer.File[] },
  ) {

    // Check if user is premium or has >= 1 items
    const user = await this.usersService.findByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.premium && user.item_count >= 1) {
      throw new ForbiddenException('Free users can only have up to 1 warranties. Upgrade to premium for unlimited warranties.');
    }
    
    
    // Handle receipt upload
    if (files.receipt && files.receipt[0]) {
      const receiptUrl = await this.uploadReceipt(files.receipt[0], userEmail);
      createWarrantyDto.receipt = receiptUrl;
    }
  
    // Handle item_image upload
    if (files.item_image && files.item_image[0]) {
      const itemImageUrl = await this.uploadImage(files.item_image[0], userEmail);
      createWarrantyDto.item_image = itemImageUrl;
    }
  
    const warranty = await this.warrantiesRepository.create(createWarrantyDto);

    // increment the item_count of the user
    await this.usersService.incrementItemCount(user.id);

    return await this.warrantiesRepository.save(warranty);
  }

  // get all warranties for a user
  async findAll(userId: string) {
    const warranties =  await this.warrantiesRepository.find({ where: { user_id: userId }, 
      relations: ['user'],
      select: {
        id: true,
        item_name: true,
        purchase_date: true,
        duration: true,
        notes: true,
        item_image: true,
        receipt: true,
        user_id: false,
        user: {
          email: true
        }
    } });
    // Generate presigned URLs for each warranty
  const warrantiesWithUrls = await Promise.all(
    warranties.map(async (warranty) => {
      const result = { ...warranty };
      
      if (warranty.receipt) {
        result.receipt = await this.generatePresignedUrl(warranty.receipt);
      }
      
      if (warranty.item_image) {
        result.item_image = await this.generatePresignedUrl(warranty.item_image);
      }
      
      return result;
    })
  );

  return warrantiesWithUrls;
  }

  // get a warranty by id
  async findOne(id: number) {
    return this.warrantiesRepository.findOne({ where: { id } });
  }



  // upload a receipt to s3
  async uploadReceipt(receipt: Express.Multer.File, userEmail: string) {
    if (!receipt) {
      throw new Error('No file provided');
    }
    // create user directory structure: email/receipts/filename
    const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9@.-]/g, '_'); // Sanitize email for S3
    const uniqueFilename = `${Date.now()}-${receipt.originalname}`;
    const s3Key = `${sanitizedEmail}/receipts/${uniqueFilename}`;
    

    const s3 = new S3Client(s3Config);
    const uploadResult = await s3.send(new PutObjectCommand({
    Bucket: s3Bucket,
    Key: s3Key, // Use the organized path
    Body: receipt.buffer,
    ContentType: receipt.mimetype,   // Add this line
    ContentDisposition: 'inline',    // Add this line
  }));
    // i want to return the url of the receipt
    return s3Key;
  }



  // upload a item_image to s3
  async uploadImage(itemImage: Express.Multer.File, userEmail: string) {
    if (!itemImage) {
      throw new Error('No file provided');
    }
    // create user directory structure: email/itemImages/filename
    const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9@.-]/g, '_'); // Sanitize email for S3
    const uniqueFilename = `${Date.now()}-${itemImage.originalname}`;
    const s3Key = `${sanitizedEmail}/itemImages/${uniqueFilename}`;
    

    const s3 = new S3Client(s3Config);
    const uploadResult = await s3.send(new PutObjectCommand({
    Bucket: s3Bucket,
    Key: s3Key, // Use the organized path
    Body: itemImage.buffer,
    ContentType: itemImage.mimetype, // Add this line
    ContentDisposition: 'inline',    // Add this line to display instead of download
  }));
    // i want to return the url of the itemImage
    return s3Key;
  }
}
