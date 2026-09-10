"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const {
  axialPhase,
  pauseActiveClock,
  projectLayerPoint,
  sampleFocusState,
  sampleGalaxyPath,
  sampleIntroTimeline,
  setProjectionTransform,
  stepActiveClock,
  stepDisturbance,
  stepRenderGate,
} = require("../hero-physics.js");

test("ambient stars stay fixed while galaxy stars rotate", () => {
  const ambient = { layer: "ambient", x: 120, y: 80, z: 300 };
  const galaxy = { layer: "galaxy", x: 120, y: 80, z: 300 };
  const restingAmbient = projectLayerPoint(ambient, 0, 0, 1000, 700);
  const rotatedAmbient = projectLayerPoint(ambient, 0.6, -0.8, 1000, 700);
  const restingGalaxy = projectLayerPoint(galaxy, 0, 0, 1000, 700);
  const scratch = {};
  const transform = setProjectionTransform(0.6, -0.8);
  const rotatedGalaxy = projectLayerPoint(galaxy, 0.6, -0.8, 1000, 700, scratch, transform);

  assert.deepEqual(rotatedAmbient, restingAmbient);
  assert.notDeepEqual(rotatedGalaxy, restingGalaxy);
  assert.equal(rotatedGalaxy, scratch);
});

test("the poster is removed only after the animated canvas is ready", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  const fallbackHero = styles.match(/\.hero\s*\{([^}]+)\}/)?.[1] || "";
  const animatedHero = styles.match(/\.hero\.canvas-ready\s*\{([^}]+)\}/)?.[1] || "";

  assert.match(fallbackHero, /Hero_16x9\.png/);
  assert.doesNotMatch(animatedHero, /url\(/);
});

test("the settled galaxy keeps a fixed centerline while its axial phase rotates forever", () => {
  const home = sampleGalaxyPath("spiral", 0.43, 0, 0, 1);
  const laterHome = sampleGalaxyPath("spiral", 0.43, 0, 0, 1);
  const revolutionSeconds = (Math.PI * 2) / 0.2288;
  const quarterTurnSeconds = (Math.PI / 2) / 0.2288;
  const laneAtStart = axialPhase(0, 0, 0, 0);
  const laneAtQuarterTurn = axialPhase(0, quarterTurnSeconds, 0, 0);
  const tubePointAtStart = sampleGalaxyPath("spiral", 0.43, Math.cos(laneAtStart) * 0.24, 0, 1);
  const tubePointAtQuarterTurn = sampleGalaxyPath("spiral", 0.43, Math.cos(laneAtQuarterTurn) * 0.24, 0, 1);

  assert.deepEqual(laterHome, home);
  assert.notDeepEqual(tubePointAtQuarterTurn, tubePointAtStart);
  assert.ok(
    Math.abs((axialPhase(1.2, revolutionSeconds, 0, 0) - axialPhase(1.2, 0, 0, 0)) - Math.PI * 2) < 1e-9,
  );
});

test("the model geometry spirals inward and closes its visible joins", () => {
  const distances = [0.1, 0.5, 0.9].map((phase) => {
    const point = sampleGalaxyPath("spiral", phase, 0, 0, 1);
    return Math.hypot(point.x, point.y - 68);
  });
  const tailDistances = [0.1, 0.5, 0.9].map((phase) => {
    const point = sampleGalaxyPath("tail", phase, 0, 0, 1);
    return Math.hypot(point.x, point.y - 68);
  });

  assert.ok(distances[0] > distances[1] && distances[1] > distances[2]);
  assert.ok(tailDistances[0] > tailDistances[1] && tailDistances[1] > tailDistances[2]);
  assert.deepEqual(sampleGalaxyPath("outer", 0, 0.2, 0, 1), sampleGalaxyPath("outer", 1, 0.2, 0, 1));
  const spiralStart = sampleGalaxyPath("spiral", 0, 0, 0, 1);
  const matchingOuter = sampleGalaxyPath("outer", 1 - 0.35 / (Math.PI * 2), 0, 0, 1);
  const tailJoin = sampleGalaxyPath("tail", 1, 0, 0, 1);
  const matchingTailOuter = sampleGalaxyPath("outer", 3.5 / (Math.PI * 2), 0, 0, 1);
  assert.ok(Math.hypot(spiralStart.x - matchingOuter.x, spiralStart.y - matchingOuter.y) < 2);
  assert.ok(Math.hypot(tailJoin.x - matchingTailOuter.x, tailJoin.y - matchingTailOuter.y) < 2);
});

test("the active clock excludes time spent offscreen", () => {
  const clock = { elapsedMs: 0, lastActiveTime: null };
  assert.equal(stepActiveClock(clock, 1000, false), 0);
  assert.equal(stepActiveClock(clock, 1016, false), 16);
  pauseActiveClock(clock);
  assert.equal(stepActiveClock(clock, 61016, false), 0);
  assert.equal(clock.elapsedMs, 16);
  assert.equal(stepActiveClock(clock, 61032, false), 16);
  assert.equal(clock.elapsedMs, 32);
});

test("the active clock remains wall-time stable across long visible frames", () => {
  const singleFrame = { elapsedMs: 0, lastActiveTime: null };
  const splitFrames = { elapsedMs: 0, lastActiveTime: null };
  stepActiveClock(singleFrame, 0, false);
  assert.equal(stepActiveClock(singleFrame, 1000, false), 250);
  stepActiveClock(splitFrames, 0, false);
  for (const time of [250, 500, 750, 1000]) stepActiveClock(splitFrames, time, false);
  assert.equal(singleFrame.elapsedMs, 1000);
  assert.equal(splitFrames.elapsedMs, 1000);
});

test("the render gate caps high-refresh displays near 60 frames per second", () => {
  for (const refreshRate of [90, 120, 144, 240]) {
    const gate = { elapsedMs: 0 };
    let renderedFrames = 0;
    for (let frame = 0; frame < refreshRate; frame += 1) {
      if (stepRenderGate(gate, 1000 / refreshRate) > 0) renderedFrames += 1;
    }
    assert.ok(renderedFrames >= 59 && renderedFrames <= 63, `${refreshRate} Hz rendered ${renderedFrames} frames`);
    assert.ok(renderedFrames < refreshRate);
  }
});

test("replay keeps home geometry and uses the measured focus timeline", () => {
  const home = { x: 790, y: 430 };
  const center = { x: 640, y: 360 };
  const first = sampleIntroTimeline(0);
  const middle = sampleIntroTimeline(1.22);
  const final = sampleIntroTimeline(2.72);
  const homeRadius = Math.hypot(home.x - center.x, home.y - center.y);
  const openingRadius = homeRadius * first.fovScale;
  const finalRadius = homeRadius * final.fovScale;

  assert.equal(first.opacity, 0);
  assert.equal(first.bokehScale, 32);
  assert.equal(middle.focusDistance, 12.51);
  assert.equal(final.bokehScale, 1.5);
  assert.equal(final.fov, 39);
  assert.equal(final.opacity, 1);
  assert.ok(openingRadius > homeRadius * 0.85 && openingRadius < homeRadius);
  assert.ok(Math.abs(finalRadius - homeRadius) < 1e-9);
});

test("the focus plane reveals the outer edge before the core", () => {
  const early = sampleIntroTimeline(0.56);
  const late = sampleIntroTimeline(2.22);
  const earlyTail = sampleFocusState(7.1, early, 800);
  const earlyCore = sampleFocusState(-5, early, 800);
  const lateTail = sampleFocusState(7.1, late, 800);
  const lateCore = sampleFocusState(-4, late, 800);

  assert.ok(earlyTail.coreAlpha > earlyCore.coreAlpha);
  assert.ok(earlyTail.blurRadius < earlyCore.blurRadius);
  assert.ok(lateCore.coreAlpha > lateTail.coreAlpha);
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

test("ambient motes retain a reduced pointer response", () => {
  const createParticle = (interactionStrength) => ({
    screenX: 120,
    screenY: 100,
    offsetX: 0,
    offsetY: 0,
    velocityX: 0,
    velocityY: 0,
    mass: 1,
    interactionStrength,
  });
  const pointer = {
    active: true,
    pressed: false,
    previousX: 80,
    previousY: 100,
    x: 130,
    y: 100,
    radius: 88,
    velocityX: 50,
    velocityY: 0,
    maximumSpeed: 70,
  };
  const galaxyParticle = createParticle(1);
  const ambientMote = createParticle(0.48);

  stepDisturbance(galaxyParticle, pointer, 1);
  stepDisturbance(ambientMote, pointer, 1);

  assert.ok(ambientMote.offsetX > 0);
  assert.ok(ambientMote.offsetX < galaxyParticle.offsetX);
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
