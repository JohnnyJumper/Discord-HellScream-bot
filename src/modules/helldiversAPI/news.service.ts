import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import type { AxiosError } from 'axios';
import { PrismaService } from 'modules/prisma/prisma.service';
import { catchError, firstValueFrom } from 'rxjs';
import type { NewsType } from './types';

@Injectable()
export class NewsAPIService {
  private readonly logger: Logger;

  private readonly baseurl = 'https://api.helldivers2.dev/raw/api';

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {
    this.logger = new Logger(NewsAPIService.name);
  }

  async fetchNews() {
    const url = new URL(`${this.baseurl}/NewsFeed/801`);
    const { data } = await firstValueFrom(
      this.http
        .get<NewsType[]>(url.href, {
          headers: {
            'X-Super-Client': 'discord server',
            'X-Super-Contact': 'jeyhunt@gmail.com',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error);
            throw new Error('Failed to fetch news');
          }),
        ),
    );

    return data.sort((a, b) => b.published - a.published);
  }

  async storeNewsIfNew(news: NewsType) {
    const isExisting = await this.prisma.news.findFirst({
      where: {
        message: news.message,
      },
    });
    if (isExisting) return null;

    return this.prisma.news.create({
      data: {
        message: news.message,
        published: new Date(news.published),
      },
    });
  }
}
