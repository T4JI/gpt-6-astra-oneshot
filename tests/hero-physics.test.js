"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { projectLayerPoint, stepDisturbance } = require("../hero-physics.js");

test("ambient stars stay fixed while galaxy stars rotate", () => {
  const ambient = { layer: "ambient", x: 120, y: 80, z: 300 };
  const galaxy = { layer: "galaxy", x: 120, y: 80, z: 300 };
  const restingAmbient = projectLayerPoint(ambient, 0, 0, 1000, 700);
  const rotatedAmbient = projectLayerPoint(ambient, 0.6, -0.8, 1000, 700);
  const restingGalaxy = projectLayerPoint(galaxy, 0, 0, 1000, 700);
  const rotatedGalaxy = projectLayerPoint(galaxy, 0.6, -0.8, 1000, 700);

  assert.deepEqual(rotatedAmbient, restingAmbient);
  assert.notDeepEqual(rotatedGalaxy, restingGalaxy);
});

test("the poster is removed only after the animated canvas is ready", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  const fallbackHero = styles.match(/\.hero\s*\{([^}]+)\}/)?.[1] || "";
  const animatedHero = styles.match(/\.hero\.canvas-ready\s*\{([^}]+)\}/)?.[1] || "";

  assert.match(fallbackHero, /Hero_16x9\.png/);
  assert.doesNotMatch(animatedHero, /url\(/);
});

test("nearby particles follow a pointer swipe, coast, and return without reversing", () => {
  const particle = {
    screenX: 520,
    screenY: 350,
    offsetX: 0,
    offsetY: 0,
    velocityX: 0,
    velocityY: 0,
    phase: 0,
  };
  const pointer = {
    active: true,
    pressed: false,
    previousX: 470,
    previousY: 350,
    x: 530,
    y: 350,
    radius: 88,
    velocityX: 60,
    velocityY: 0,
    maximumSpeed: 70,
  };

  stepDisturbance(particle, pointer, 1);
  assert.ok(particle.offsetX > 15, `expected visible directional motion, received ${particle.offsetX}`);
  assert.equal(particle.offsetY, 0);

  pointer.active = false;
  let peakOffset = particle.offsetX;
  for (let frame = 0; frame < 360; frame += 1) {
    stepDisturbance(particle, pointer, 1);
    assert.ok(particle.offsetX >= 0, "decay should not overshoot past home");
    peakOffset = Math.max(peakOffset, particle.offsetX);
  }

  assert.ok(peakOffset > 100, `expected the particle to coast after release, received ${peakOffset}`);
  assert.ok(particle.offsetX < 3, `expected the particle visually home after decay, received ${particle.offsetX}`);
});

test("particles outside the pointer radius remain at home", () => {
  const particle = {
    screenX: 800,
    screenY: 600,
    offsetX: 0,
    offsetY: 0,
    velocityX: 0,
    velocityY: 0,
    phase: 0,
  };
  const pointer = {
    active: true,
    pressed: false,
    previousX: 60,
    previousY: 80,
    x: 100,
    y: 100,
    radius: 120,
    velocityX: 40,
    velocityY: 20,
  };

  stepDisturbance(particle, pointer, 1);
  assert.equal(particle.offsetX, 0);
  assert.equal(particle.offsetY, 0);
});

test("pressed pointer motion does not disturb particles", () => {
  const particle = {
    screenX: 120,
    screenY: 100,
    offsetX: 0,
    offsetY: 0,
    velocityX: 0,
    velocityY: 0,
    mass: 1,
  };
  const pointer = {
    active: true,
    pressed: true,
    previousX: 80,
    previousY: 100,
    x: 150,
    y: 100,
    radius: 88,
    velocityX: 70,
    velocityY: 0,
  };

  stepDisturbance(particle, pointer, 1);
  assert.equal(particle.offsetX, 0);
  assert.equal(particle.offsetY, 0);
});

test("particle recovery is stable across frame rates", () => {
  const simulate = (framesPerSecond) => {
    const particle = {
      screenX: 120,
      screenY: 100,
      offsetX: 0,
      offsetY: 0,
      velocityX: 0,
      velocityY: 0,
      mass: 1,
    };
    const pointer = {
      active: true,
      pressed: false,
      previousX: 70,
      previousY: 100,
      x: 130,
      y: 100,
      radius: 88,
      velocityX: 60,
      velocityY: 0,
      maximumSpeed: 70,
    };
    const frameScale = 60 / framesPerSecond;

    for (let frame = 0; frame < framesPerSecond * 6; frame += 1) {
      stepDisturbance(particle, pointer, frameScale);
      pointer.active = false;
    }
    return particle.offsetX;
  };
  const offsets = [10, 20, 30, 60, 120].map(simulate);

  assert.ok(Math.max(...offsets) - Math.min(...offsets) < 0.25, `frame-rate drift: ${offsets.join(", ")}`);
});
