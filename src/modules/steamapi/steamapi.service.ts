import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { PrismaService } from 'modules/prisma/prisma.service';
import { catchError, firstValueFrom } from 'rxjs';
import {
  SteamAppData,
  SteamAppDataResponse,
  SteamPopularResponse,
  UniqueTrendingGame,
} from './types';

@Injectable()
export class SteamAPIService {
  private readonly logger: Logger;
  private readonly steamUrlTrending;
  private readonly steamUrlAppData;

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {
    this.logger = new Logger(SteamAPIService.name);
    this.steamUrlTrending =
      'https://store.steampowered.com/search/results/?sort_by=Released_DESC&os=win&filter=popularnew&json=1';
    this.steamUrlAppData = 'https://store.steampowered.com/api/appdetails/';
  }

  async fetchUniqueTrending(): Promise<UniqueTrendingGame[]> {
    const url = new URL(this.steamUrlTrending);
    const { data } = await firstValueFrom(
      this.http.get<SteamPopularResponse>(url.href).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error);
          throw new Error('Failed to fetch trending games');
        }),
      ),
    );
    const uniqueGames: UniqueTrendingGame[] = [];
    for (const entry of data.items) {
      const appId = this.fetchAppId(entry.logo);
      if (!appId) {
        continue;
      }
      const isExistInDb = await this.checkIfExist(appId);
      if (isExistInDb) {
        this.logger.warn('game was already scanned skipping');
        continue;
      }

      const data = await this.fetchAppData(appId);
      if (!data) {
        this.logger.warn('game has not app data skipping');
        continue;
      }
      const added = await this.prisma.steamGames.create({
        data: {
          appId: appId,
          about_the_game: data.about_the_game,
          detailed_description: data.detailed_description,
          release_date: data.release_date.date,
          genres: data.genres.map((genre) => genre.description).join(','),
          categories: data.categories
            .map((category) => category.description)
            .join(','),
          name: data.name,
          authors: data.developers.join(','),
          header_image: data.header_image,
          screenshots: data.screenshots
            .slice(0, 4)
            .map((screenshot) => screenshot.path_thumbnail)
            .join(','),
          steam_link: `https://store.steampowered.com/app/${appId}/`,
          initial_formatted: data.price_overview?.initial_formatted,
          price_formatted: data.price_overview?.final_formatted,
          is_free: data.is_free,
        },
        select: {
          about_the_game: true,
          categories: true,
          genres: true,
          detailed_description: true,
          release_date: true,
          name: true,
          authors: true,
          header_image: true,
          initial_formatted: true,
          price_formatted: true,
          screenshots: true,
          steam_link: true,
          is_free: true,
        },
      });
      uniqueGames.push(added);
      if (uniqueGames.length > 4) {
        break;
      }
    }
    return uniqueGames;
  }

  async checkIfExist(appId: string): Promise<boolean> {
    const dbEntry = await this.prisma.steamGames.findFirst({
      where: {
        appId,
      },
    });
    return !!dbEntry;
  }

  async fetchAppData(appId: string): Promise<SteamAppData | null> {
    const urlParams = new URLSearchParams();
    urlParams.append('appids', appId);
    const url = new URL(`${this.steamUrlAppData}?${urlParams.toString()}`);

    const { data: response } = await firstValueFrom(
      this.http.get<SteamAppDataResponse>(url.href).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error);
          throw new Error(`Failed to fetch detail of app with id: ${appId}`);
        }),
      ),
    );
    if (response[appId].success) {
      return response[appId].data;
    }
    return null;
  }

  fetchAppId(logoUrl: string): string | null {
    const regex = new RegExp(/steam\/\w+\/(\d+)/m);
    const match = logoUrl.match(regex);
    if (!match) {
      return null;
    }
    return match[1];
  }
}
