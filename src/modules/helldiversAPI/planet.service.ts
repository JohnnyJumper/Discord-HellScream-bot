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
      this.http.get<PlanetType[]>(url.href).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error);
          throw new Error('Failed to fetch planet information');
        }),
      ),
    );

    return data;
  }
}
