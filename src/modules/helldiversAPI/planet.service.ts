import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import type { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import type { PlanetType } from './types';

@Injectable()
export class PlanetsAPIService {
  private readonly logger: Logger;

  private readonly baseurl = 'https://api.helldivers2.dev/api/v1';

  constructor(private readonly http: HttpService) {
    this.logger = new Logger(PlanetsAPIService.name);
  }

  async fetchPlanetsData() {
    const url = new URL(`${this.baseurl}/planets`);
    const { data } = await firstValueFrom(
      this.http
        .get<PlanetType[]>(url.href, {
          headers: {
            'X-Super-Client': 'discord server',
            'X-Super-Contact': 'jeyhunt@gmail.com',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Request failed with status ${error.response?.status}`,
            );
            this.logger.error(
              `Response body: ${JSON.stringify(error.response?.data, null, 2)}`,
            );
            this.logger.error(error.message);
            throw new Error('Failed to fetch planet information');
          }),
        ),
    );

    return data;
  }
}
