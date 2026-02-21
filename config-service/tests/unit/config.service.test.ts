import { ConfigService } from "../../src/services/config.service";
import { Config } from "../../src/entities/Config";
import { AppError } from "../../src/middleware/error-handler";

const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe("ConfigService", () => {
  let service: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConfigService(mockRepository as any);
  });

  describe("getAll", () => {
    it("should return all configs", async () => {
      const configs = [
        { id: "1", key: "app.name", value: "MyApp", createdAt: new Date(), updatedAt: new Date() },
      ];
      mockRepository.find.mockResolvedValue(configs);

      const result = await service.getAll();

      expect(result).toEqual(configs);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("getByKey", () => {
    it("should return a config by key", async () => {
      const config = { id: "1", key: "app.name", value: "MyApp" };
      mockRepository.findOneBy.mockResolvedValue(config);

      const result = await service.getByKey("app.name");

      expect(result).toEqual(config);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ key: "app.name" });
    });

    it("should throw 404 when key not found", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getByKey("missing")).rejects.toThrow(AppError);
      await expect(service.getByKey("missing")).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("create", () => {
    it("should create a new config", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      const created = { id: "1", key: "app.name", value: "MyApp" };
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result = await service.create({ key: "app.name", value: "MyApp" });

      expect(result).toEqual(created);
      expect(mockRepository.create).toHaveBeenCalledWith({ key: "app.name", value: "MyApp" });
      expect(mockRepository.save).toHaveBeenCalledWith(created);
    });

    it("should throw 409 on duplicate key", async () => {
      mockRepository.findOneBy.mockResolvedValue({ id: "1", key: "app.name" });

      await expect(service.create({ key: "app.name", value: "MyApp" })).rejects.toThrow(AppError);
      await expect(service.create({ key: "app.name", value: "MyApp" })).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe("update", () => {
    it("should update an existing config", async () => {
      const existing = { id: "1", key: "app.name", value: "OldApp" } as Config;
      mockRepository.findOneBy.mockResolvedValue(existing);
      mockRepository.save.mockResolvedValue({ ...existing, value: "NewApp" });

      const result = await service.update("app.name", { value: "NewApp" });

      expect(result.value).toBe("NewApp");
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should throw 404 when key not found", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update("missing", { value: "val" })).rejects.toThrow(AppError);
      await expect(service.update("missing", { value: "val" })).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("remove", () => {
    it("should remove a config by key", async () => {
      const existing = { id: "1", key: "app.name", value: "MyApp" } as Config;
      mockRepository.findOneBy.mockResolvedValue(existing);
      mockRepository.remove.mockResolvedValue(existing);

      await service.remove("app.name");

      expect(mockRepository.remove).toHaveBeenCalledWith(existing);
    });

    it("should throw 404 when key not found", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove("missing")).rejects.toThrow(AppError);
      await expect(service.remove("missing")).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
