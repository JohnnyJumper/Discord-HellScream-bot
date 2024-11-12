import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'modules/prisma/prisma.service';
import { SteamAPIService } from './steamapi.service';

const httpService = new HttpService();
const prismaService = new PrismaService();
const service = new SteamAPIService(httpService, prismaService);

service.fetchUniqueTrending();
