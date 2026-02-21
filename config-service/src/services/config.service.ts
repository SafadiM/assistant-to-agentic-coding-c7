import { Repository } from "typeorm";
import { Config } from "../entities/Config";
import { AppDataSource } from "../config/data-source";
import { AppError } from "../middleware/error-handler";
import { CreateConfigDto, UpdateConfigDto } from "../schemas/config.schema";

export class ConfigService {
  private repository: Repository<Config>;

  constructor(repository?: Repository<Config>) {
    this.repository = repository ?? AppDataSource.getRepository(Config);
  }

  async getAll(): Promise<Config[]> {
    return this.repository.find();
  }

  async getByKey(key: string): Promise<Config> {
    const config = await this.repository.findOneBy({ key });
    if (!config) {
      throw new AppError(404, `Config with key "${key}" not found`);
    }
    return config;
  }

  async create(dto: CreateConfigDto): Promise<Config> {
    const existing = await this.repository.findOneBy({ key: dto.key });
    if (existing) {
      throw new AppError(409, `Config with key "${dto.key}" already exists`);
    }

    const config = this.repository.create({
      key: dto.key,
      value: dto.value,
    });

    return this.repository.save(config);
  }

  async update(key: string, dto: UpdateConfigDto): Promise<Config> {
    const config = await this.repository.findOneBy({ key });
    if (!config) {
      throw new AppError(404, `Config with key "${key}" not found`);
    }

    config.value = dto.value;
    return this.repository.save(config);
  }

  async remove(key: string): Promise<void> {
    const config = await this.repository.findOneBy({ key });
    if (!config) {
      throw new AppError(404, `Config with key "${key}" not found`);
    }

    await this.repository.remove(config);
  }
}
