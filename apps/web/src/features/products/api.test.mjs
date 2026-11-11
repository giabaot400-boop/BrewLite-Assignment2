import test from "node:test";
import assert from "node:assert/strict";
import { ProductApiError, getProduct, getProducts } from "./api.ts";

const SIZES = [
  { code: "S", extraPrice: 0 },
  { code: "M", extraPrice: 5000 },
  { code: "L", extraPrice: 10000 },
];
const summary = (id = "coffee-milk") => ({ id, name: "Cà phê sữa", price: 35000, imageUrl: "/images/coffee-milk.svg" });
const detail = (overrides = {}) => ({ ...summary(), description: "Cà phê đậm vị kết hợp sữa.", sizes: SIZES, toppings: [{ id: "cream", name: "Kem", price: 7000 }], ...overrides });

// Mỗi test tự đặt và khôi phục biến môi trường/fetch để không ảnh hưởng test khác.
async function withEnv(env, fetchImpl, run) {
  const saved = { source: process.env.NEXT_PUBLIC_PRODUCTS_SOURCE, url: process.env.NEXT_PUBLIC_API_URL, fetch: globalThis.fetch };
  const set = (key, value) => (value === undefined ? delete process.env[key] : (process.env[key] = value));
  set("NEXT_PUBLIC_PRODUCTS_SOURCE", env.source);
  set("NEXT_PUBLIC_API_URL", env.url);
  if (fetchImpl) globalThis.fetch = fetchImpl;
  try { return await run(); } finally {
    set("NEXT_PUBLIC_PRODUCTS_SOURCE", saved.source);
    set("NEXT_PUBLIC_API_URL", saved.url);
    globalThis.fetch = saved.fetch;
  }
}
const json = (body, status = 200) => async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const rejectsApi = (promise, status) => assert.rejects(promise, error => error instanceof ProductApiError && error.status === status);

test("fixture: danh sách có bốn món, chỉ gồm id/name/price/imageUrl", async () => {
  await withEnv({ source: "fixture" }, null, async () => {
    const products = await getProducts();
    assert.equal(products.length, 4);
    assert.deepEqual(products.map(p => p.id).sort(), ["americano", "cappuccino", "coffee-milk", "peach-tea"]);
    for (const product of products) assert.deepEqual(Object.keys(product).sort(), ["id", "imageUrl", "name", "price"]);
  });
});

test("fixture: chi tiết có ba size S/M/L; id lạ là 404; kết quả là bản sao", async () => {
  await withEnv({ source: "fixture" }, null, async () => {
    const product = await getProduct("coffee-milk");
    assert.deepEqual(product.sizes.map(s => s.code), ["S", "M", "L"]);
    assert.deepEqual(product.toppings.map(t => t.id), ["cream", "pearl"]);
    product.name = "đã bị sửa";
    assert.equal((await getProduct("coffee-milk")).name, "Cà phê sữa");
    await rejectsApi(getProduct("khong-ton-tai"), 404);
  });
});

test("api: gọi đúng URL, bỏ dấu / cuối, no-store, mã hóa id", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push([url, init.cache]); return new Response(JSON.stringify(url.endsWith("/products") ? [summary()] : detail()), { status: 200 }); };
  await withEnv({ source: "api", url: "http://localhost:3001//" }, fetchImpl, async () => {
    assert.equal((await getProducts()).length, 1);
    assert.equal((await getProduct("a b/c")).id, "coffee-milk");
  });
  assert.deepEqual(calls.map(c => c[0]), ["http://localhost:3001/products", "http://localhost:3001/products/a%20b%2Fc"]);
  assert.ok(calls.every(c => c[1] === "no-store"));
});

test("api: thiếu NEXT_PUBLIC_API_URL là lỗi rõ ràng, không gọi mạng", async () => {
  let called = 0;
  await withEnv({ source: "api" }, async () => { called++; return new Response("[]"); }, async () => {
    await assert.rejects(getProducts(), /NEXT_PUBLIC_API_URL/);
  });
  assert.equal(called, 0);
});

test("api: HTTP lỗi giữ nguyên status", async () => {
  await withEnv({ source: "api", url: "http://x" }, json({ message: "no" }, 404), async () => {
    await rejectsApi(getProduct("x"), 404);
  });
  await withEnv({ source: "api", url: "http://x" }, json({}, 500), async () => {
    await rejectsApi(getProducts(), 500);
  });
});

test("api: danh sách sai contract bị từ chối (không phải mảng, trùng id, giá âm/lẻ, thiếu trường)", async () => {
  const bad = [
    { not: "array" },
    [summary("a"), summary("a")],
    [{ ...summary(), price: -1 }],
    [{ ...summary(), price: 35000.5 }],
    [{ ...summary(), imageUrl: "" }],
    [{ id: "a", name: "A", price: 1 }],
  ];
  for (const body of bad) {
    await withEnv({ source: "api", url: "http://x" }, json(body), async () => {
      await assert.rejects(getProducts(), error => error instanceof ProductApiError && /API contract/.test(error.message), JSON.stringify(body));
    });
  }
});

test("api: chi tiết sai contract bị từ chối (size thiếu/trùng/lạ, topping trùng id, giá sai)", async () => {
  const bad = [
    detail({ sizes: SIZES.slice(0, 2) }),
    detail({ sizes: [SIZES[0], SIZES[0], SIZES[1]] }),
    detail({ sizes: [...SIZES.slice(0, 2), { code: "XL", extraPrice: 1 }] }),
    detail({ toppings: [{ id: "cream", name: "Kem", price: 7000 }, { id: "cream", name: "Kem 2", price: 1 }] }),
    detail({ toppings: [{ id: "cream", name: "Kem", price: -5 }] }),
    detail({ description: 5 }),
  ];
  for (const body of bad) {
    await withEnv({ source: "api", url: "http://x" }, json(body), async () => {
      await assert.rejects(getProduct("coffee-milk"), error => error instanceof ProductApiError && /API contract/.test(error.message));
    });
  }
});
