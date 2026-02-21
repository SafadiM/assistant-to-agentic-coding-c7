import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { Config } from "../entities/Config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: env.NODE_ENV === "development",
  entities: [Config],
  migrations: [__dirname + "/../migrations/*.{ts,js}"],
});
