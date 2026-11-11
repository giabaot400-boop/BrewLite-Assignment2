import "reflect-metadata";

import test from "node:test";
import assert from "node:assert/strict";

import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ProductsPrismaService } from "./products-prisma.service.js";
import type { PrismaService } from "../database/prisma.service.js";

type Calls = { findMany: unknown[]; findUnique: unknown[] };

// Prisma giả: không cần PostgreSQL. `failWith` mô phỏng lỗi kết nối/truy vấn.
function setup(options: { products?: unknown[]; product?: unknown; failWith?: Error } = {}) {
  const calls: Calls = { findMany: [], findUnique: [] };
  const prisma = {
    product: {
      findMany: async (args: unknown) => {
        calls.findMany.push(args);
        if (options.failWith) throw options.failWith;
        return options.products ?? [];
      },
      findUnique: async (args: unknown) => {
        calls.findUnique.push(args);
        if (options.failWith) throw options.failWith;
        return options.product ?? null;
      },
    },
  } as unknown as PrismaService;
  return { service: new ProductsPrismaService(prisma), calls };
}

async function withDemoMode<T>(value: string | undefined, run: () => Promise<T>): Promise<T> {
  const saved = process.env.DEMO_MODE;
  if (value === undefined) delete process.env.DEMO_MODE;
  else process.env.DEMO_MODE = value;
  try {
    return await run();
  } finally {
    if (saved === undefined) delete process.env.DEMO_MODE;
    else process.env.DEMO_MODE = saved;
  }
}

test("danh sách: chỉ chọn id/name/price/imageUrl và sắp xếp theo id", () =>
  withDemoMode(undefined, async () => {
    const rows = [{ id: "americano", name: "Americano", price: 40000, imageUrl: "/images/americano.svg" }];
    const { service, calls } = setup({ products: rows });
    assert.deepEqual(await service.getProducts(), rows);
    assert.deepEqual(calls.findMany, [{
      select: { id: true, name: true, price: true, imageUrl: true },
      orderBy: { id: "asc" },
    }]);
  }));

test("danh sách: lỗi database thành 500 với thông báo chung, không lộ chi tiết lỗi", () =>
  withDemoMode(undefined, async () => {
    const { service } = setup({ failWith: new Error("password authentication failed for user brewlite") });
    await assert.rejects(service.getProducts(), error => {
      assert.ok(error instanceof InternalServerErrorException);
      assert.doesNotMatch(String((error as Error).message), /password|brewlite/);
      return true;
    });
  }));

test("chi tiết: ánh xạ ba size cố định và topping qua bảng nối", () =>
  withDemoMode(undefined, async () => {
    const { service, calls } = setup({
      product: {
        id: "coffee-milk", name: "Cà phê sữa", description: "d", price: 35000, imageUrl: "/images/coffee-milk.svg",
        toppings: [
          { topping: { id: "cream", name: "Kem", price: 7000, extra: "bị bỏ" } },
          { topping: { id: "pearl", name: "Trân châu", price: 5000 } },
        ],
      },
    });
    const detail = await service.getProductById("coffee-milk");
    assert.deepEqual(detail.sizes.map(size => [size.code, size.extraPrice]), [["S", 0], ["M", 5000], ["L", 10000]]);
    assert.deepEqual(detail.toppings, [
      { id: "cream", name: "Kem", price: 7000 },
      { id: "pearl", name: "Trân châu", price: 5000 },
    ]);
    assert.equal(calls.findUnique.length, 1);
  }));

test("chi tiết: id không tồn tại là 404, không bị đổi thành 500", () =>
  withDemoMode(undefined, async () => {
    const { service } = setup({ product: null });
    await assert.rejects(service.getProductById("khong-co"), NotFoundException);
  }));

test("chi tiết: lỗi database là 500", () =>
  withDemoMode(undefined, async () => {
    const { service } = setup({ failWith: new Error("connection refused") });
    await assert.rejects(service.getProductById("coffee-milk"), InternalServerErrorException);
  }));

test("DEMO_MODE=true: dùng dữ liệu mẫu bốn món và không chạm database", () =>
  withDemoMode("true", async () => {
    const { service, calls } = setup({ failWith: new Error("không được gọi") });
    const products = await service.getProducts();
    assert.equal(products.length, 4);
    assert.deepEqual(products.map((product: { id: string }) => product.id).sort(), ["americano", "cappuccino", "coffee-milk", "peach-tea"]);
    const detail = await service.getProductById("coffee-milk");
    assert.equal(detail.sizes.length, 3);
    await assert.rejects(service.getProductById("khong-co"), NotFoundException);
    assert.deepEqual([calls.findMany.length, calls.findUnique.length], [0, 0]);
  }));
