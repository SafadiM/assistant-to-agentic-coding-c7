export interface Config {
  id: string;
  key: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConfigDto {
  key: string;
  value: unknown;
}

export interface UpdateConfigDto {
  value: unknown;
}
