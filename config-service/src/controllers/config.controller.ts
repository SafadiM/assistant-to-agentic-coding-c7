import { Request, Response, NextFunction } from "express";
import { ConfigService } from "../services/config.service";

const configService = new ConfigService();

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const configs = await configService.getAll(q);
    res.json(configs);
  } catch (err) {
    next(err);
  }
}

export async function getByKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = await configService.getByKey(req.params.key);
    res.json(config);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = await configService.create(req.body);
    res.status(201).json(config);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = await configService.update(req.params.key, req.body);
    res.json(config);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await configService.remove(req.params.key);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
