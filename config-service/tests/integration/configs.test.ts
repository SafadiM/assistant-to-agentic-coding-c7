import "reflect-metadata";
import request from "supertest";
import { DataSource } from "typeorm";
import { Config } from "../../src/entities/Config";
import app from "../../src/app";

let testDataSource: DataSource;

beforeAll(async () => {
  testDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "config_api_test",
    synchronize: true,
    dropSchema: true,
    entities: [Config],
  });

  await testDataSource.initialize();
});

afterAll(async () => {
  await testDataSource.destroy();
});

beforeEach(async () => {
  await testDataSource.getRepository(Config).clear();
});

describe("GET /health", () => {
  it("should return status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /configs", () => {
  it("should create a new config entry", async () => {
    const res = await request(app)
      .post("/configs")
      .send({ key: "app.name", value: "TestApp" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ key: "app.name", value: "TestApp" });
    expect(res.body.id).toBeDefined();
  });

  it("should return 400 for invalid body", async () => {
    const res = await request(app)
      .post("/configs")
      .send({ key: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should return 409 on duplicate key", async () => {
    await request(app)
      .post("/configs")
      .send({ key: "dup.key", value: "first" });

    const res = await request(app)
      .post("/configs")
      .send({ key: "dup.key", value: "second" });

    expect(res.status).toBe(409);
  });
});

describe("GET /configs", () => {
  it("should return all configs", async () => {
    await request(app).post("/configs").send({ key: "a", value: "1" });
    await request(app).post("/configs").send({ key: "b", value: "2" });

    const res = await request(app).get("/configs");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /configs/:key", () => {
  it("should return a config by key", async () => {
    await request(app).post("/configs").send({ key: "my.key", value: "hello" });

    const res = await request(app).get("/configs/my.key");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ key: "my.key", value: "hello" });
  });

  it("should return 404 when key not found", async () => {
    const res = await request(app).get("/configs/nonexistent");

    expect(res.status).toBe(404);
  });
});

describe("PUT /configs/:key", () => {
  it("should update an existing config", async () => {
    await request(app).post("/configs").send({ key: "upd.key", value: "old" });

    const res = await request(app)
      .put("/configs/upd.key")
      .send({ value: "new" });

    expect(res.status).toBe(200);
    expect(res.body.value).toBe("new");
  });

  it("should return 404 when key not found", async () => {
    const res = await request(app)
      .put("/configs/missing")
      .send({ value: "val" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /configs/:key", () => {
  it("should delete a config", async () => {
    await request(app).post("/configs").send({ key: "del.key", value: "bye" });

    const res = await request(app).delete("/configs/del.key");

    expect(res.status).toBe(204);
  });

  it("should return 404 when key not found", async () => {
    const res = await request(app).delete("/configs/missing");

    expect(res.status).toBe(404);
  });
});
