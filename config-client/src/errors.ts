export class ConfigClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body?: string,
  ) {
    super(message);
    this.name = "ConfigClientError";
  }
}

export class ConfigNotFoundError extends ConfigClientError {
  constructor(key: string) {
    super(`Config with key "${key}" not found`, 404);
    this.name = "ConfigNotFoundError";
  }
}

export class ConfigConflictError extends ConfigClientError {
  constructor(key: string) {
    super(`Config with key "${key}" already exists`, 409);
    this.name = "ConfigConflictError";
  }
}

export class ConfigValidationError extends ConfigClientError {
  constructor(
    message: string,
    public readonly details: Array<{ path: string; message: string }>,
  ) {
    super(message, 400);
    this.name = "ConfigValidationError";
  }
}
