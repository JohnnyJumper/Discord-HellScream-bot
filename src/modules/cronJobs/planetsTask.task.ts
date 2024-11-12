import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BotService } from 'modules/bot/bot.service';
import { PlanetsAPIService } from 'modules/helldiversAPI/planet.service';
import { PromptComposer } from 'modules/openai/promptComposer.service';
import { PrismaService } from 'modules/prisma/prisma.service';

@Injectable()
export class PlanetsTask {
  private logger: Logger;

  constructor(
    private readonly prisma: PrismaService,
    private readonly planetService: PlanetsAPIService,
    private readonly botService: BotService,
    private readonly promptComposer: PromptComposer,
  ) {
    this.logger = new Logger(`CronJob: ${PlanetsTask.name}`);
  }

  @Cron(CronExpression.EVERY_10_SECONDS, {
    disabled: process.env.NODE_ENV === 'development',
  })
  async fetchPlanets() {
    const planetsData = await this.planetService.fetchPlanetsData();
    this.logger.log(`Fetched ${planetsData.length} planets`);

    const statusChangedPlanets = [];
    let createdOrUpdated = 0;
    for (const planetData of planetsData) {
      const [isChanged, ownershipChangeEvent] =
        await this.prisma.didPlanetStatusChanged(planetData);
      if (isChanged) {
        const [from, to] = ownershipChangeEvent;
        statusChangedPlanets.push({
          index: planetData.index,
          name: planetData.name,
          from: from ?? '',
          to: to ?? '',
        });
      }
      await this.prisma.updateOrCreatePlanet(planetData);
      createdOrUpdated += 1;
    }
    this.logger.log(`Updated ${createdOrUpdated} planets`);
    // make a prompt call botservice to notify
    const planetStatusChangedPrompt =
      this.promptComposer.buildPlanetStatusChangePrompt(statusChangedPlanets);

    if (planetStatusChangedPrompt) {
      await this.botService.sendMessageBasedOnHint(planetStatusChangedPrompt);
    }
  }
}
