const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { app, parkingRecords } = require("../app");

let server;
let base;

beforeEach(async () => {
  parkingRecords.length = 0;
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test("health route returns ok", async () => {
  const response = await fetch(`${base}/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  server.close();
});

test("parking form adds a vehicle", async () => {
  const response = await fetch(`${base}/park`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      vehicleNumber: "MH12AB1234",
      vehicleType: "Car",
      ownerName: "Test User",
      slot: "A-01"
    }),
    redirect: "manual"
  });

  assert.equal(response.status, 302);
  assert.equal(parkingRecords.length, 1);
  assert.equal(parkingRecords[0].slot, "A-01");
  server.close();
});

test("invalid parking data is rejected", async () => {
  const response = await fetch(`${base}/park`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      vehicleNumber: "",
      vehicleType: "Car",
      ownerName: "Test User",
      slot: "A-01"
    })
  });

  assert.equal(response.status, 400);
  server.close();
});

test("parking API returns JSON data", async () => {
  const response = await fetch(`${base}/api/parking`);

  assert.equal(response.status, 200);

  const body = await response.json();

  assert.ok(body);
  server.close();
});

test("release parked vehicle successfully", async () => {
  await fetch(`${base}/park`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      vehicleNumber: "MH12AB1234",
      vehicleType: "Car",
      ownerName: "Test User",
      slot: "A-01"
    })
  });

  const response = await fetch(`${base}/release`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      vehicleNumber: "MH12AB1234"
    })
  });

  assert.equal(response.status, 200);
  server.close();
});