FROM node:20

WORKDIR /usr/src/app

COPY . .

RUN corepack enable
RUN corepack prepare pnpm@8.15.6 --activate

RUN pnpm install

RUN pnpm prisma:migrate
RUN pnpm build

EXPOSE 6357

CMD [ "pnpm", "start:prod" ]