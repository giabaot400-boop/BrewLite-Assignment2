import test from "node:test";
import assert from "node:assert/strict";
import { formatPrice } from "./format-price.ts";

const plain = value => formatPrice(value).replace(/\s/g, " ");

test("giá VND hiển thị theo vi-VN, không phần thập phân", () => {
  assert.match(plain(36000), /^35\.000 ₫$/);
  assert.match(plain(0), /^0 ₫$/);
  assert.match(plain(1250000), /^1\.250\.000 ₫$/);
});
