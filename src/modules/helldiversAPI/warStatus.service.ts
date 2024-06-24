import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import type { AxiosError } from "axios";
import { catchError, firstValueFrom } from "rxjs";
import type { WarStatusType } from "./types";

@Injectable()
export class WarStatusAPIService {
	private readonly logger: Logger;

	private readonly baseurl = "https://api.helldivers2.dev/api/v1";

	constructor(private readonly http: HttpService) {
		this.logger = new Logger(WarStatusAPIService.name);
	}

	async fetchWarStatus() {
		const url = new URL(`${this.baseurl}/war`);
		const { data } = await firstValueFrom(
			this.http.get<WarStatusType>(url.href).pipe(
				catchError((error: AxiosError) => {
					this.logger.error(error);
					throw new Error("Failed to fetch planet information");
				}),
			),
		);

		return data;
	}
}
