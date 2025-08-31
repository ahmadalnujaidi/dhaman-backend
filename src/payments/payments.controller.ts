import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CreateChargeDto } from './dto/create-charge.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

const baseUrl = process.env.BASE_URL;

const secretKey = process.env.TAP_SECRET_KEY;
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
    constructor() {}

    // @UseGuards(JwtAuthGuard)
    @Post('create-charge')
    async createCharge(@Body() createChargeDto: CreateChargeDto, @Request() req) {
        const { 
            first_name, 
            email, 
            country_code, 
            phone_number, 
            amount = 29.99, 
            description = "Premium upgrade" 
        } = createChargeDto;

        const userId = req.user.id;
        // console.log("userId", userId);
        const charge = await fetch("https://api.tap.company/v2/charges", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${secretKey}`, // your test secret key
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
                amount,
                currency: "SAR",
                customer_initiated: true,
                threeDSecure: true,
                description,
                customer: {
                  first_name,
                  email,
                  phone: { 
                    country_code, 
                    number: phone_number 
                  }
                },
                source: { id: "src_all" },
                redirect: { url: "https://www.dhaman.app" },
                post: {url: `${baseUrl}/users/premium/${userId}`}
              })
          });

          const data = await charge.json();
          // console.log(data.transaction.url);
          return data.transaction.url;
    }
}
