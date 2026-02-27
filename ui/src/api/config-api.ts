import { ConfigClient } from "config-client";
import type { Config, CreateConfigDto, UpdateConfigDto } from "config-client";

const client = new ConfigClient({ baseUrl: "" });

export type { Config, CreateConfigDto, UpdateConfigDto };

export function getAllConfigs(): Promise<Config[]> {
  return client.getAll();
}

export function getConfig(key: string): Promise<Config> {
  return client.get(key);
}

export function createConfig(body: CreateConfigDto): Promise<Config> {
  return client.create(body);
}

export function updateConfig(key: string, body: UpdateConfigDto): Promise<Config> {
  return client.update(key, body);
}

export function deleteConfig(key: string): Promise<void> {
  return client.delete(key);
}
