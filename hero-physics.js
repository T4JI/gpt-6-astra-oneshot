(function attachAstraParticlePhysics(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.AstraParticlePhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";

  const TAU = Math.PI * 2;
  const INTRO_TIMES = [0, 0.22, 0.56, 1.22, 1.62, 2.22, 2.5, 2.72];
  const INTRO_BOKEH = [32, 30, 24, 6.7, 2.66, 1.8, 1.56, 1.5];
  const INTRO_FOV = [43.2, 42.8, 42, 39.4, 38.32, 39.08, 38.98, 39];
  const INTRO_FOCUS_DISTANCE = [1.55, 1.62, 2.58, 12.51, 14.34, 13.86, 13.985, 13.96];
  const INTRO_FOCUS_RANGE = [0.05, 0.052, 0.07, 0.16, 0.28, 0.5, 0.55, 0.58];
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const smoothstep = (value) => {
    const progress = clamp(value, 0, 1);
    return progress * progress * (3 - 2 * progress);
  };

  function wrapUnit(value) {
    return ((value % 1) + 1) % 1;
  }

  function stepActiveClock(clock, now, paused, maximumDelta = 250) {
    if (paused) {
      clock.lastActiveTime = null;
      return 0;
    }
    if (clock.lastActiveTime === null) {
      clock.lastActiveTime = now;
      return 0;
    }

    const elapsedDelta = Math.max(0, now - clock.lastActiveTime);
    clock.lastActiveTime = now;
    clock.elapsedMs += elapsedDelta;
    return Math.min(elapsedDelta, maximumDelta);
  }

  function pauseActiveClock(clock) {
    clock.lastActiveTime = null;
  }

  function stepRenderGate(gate, delta, minimumInterval = 16) {
    gate.elapsedMs += Math.max(0, delta);
    if (gate.elapsedMs < minimumInterval) return 0;
    const renderDelta = gate.elapsedMs;
    gate.elapsedMs = renderDelta < minimumInterval * 2 ? renderDelta - minimumInterval : 0;
    return renderDelta;
  }

  function sampleHermite(values, segment, progress) {
    const p0 = values[Math.max(0, segment - 1)];
    const p1 = values[segment];
    const p2 = values[Math.min(values.length - 1, segment + 1)];
    const p3 = values[Math.min(values.length - 1, segment + 2)];
    const m1 = 0.19 * (p2 - p0);
    const m2 = 0.19 * (p3 - p1);
    const progress2 = progress * progress;
    const progress3 = progress2 * progress;
    return (
      (2 * progress3 - 3 * progress2 + 1) * p1 +
      (progress3 - 2 * progress2 + progress) * m1 +
      (-2 * progress3 + 3 * progress2) * p2 +
      (progress3 - progress2) * m2
    );
  }

  function sampleIntroTimeline(seconds, output = {}) {
    const time = clamp(seconds, INTRO_TIMES[0], INTRO_TIMES[INTRO_TIMES.length - 1]);
    let segment = INTRO_TIMES.length - 2;
    for (let index = 0; index < INTRO_TIMES.length - 1; index += 1) {
      if (time <= INTRO_TIMES[index + 1]) {
        segment = index;
        break;
      }
    }
    const segmentDuration = INTRO_TIMES[segment + 1] - INTRO_TIMES[segment];
    const progress = segmentDuration > 0 ? (time - INTRO_TIMES[segment]) / segmentDuration : 1;
    output.bokehScale = sampleHermite(INTRO_BOKEH, segment, progress);
    output.fov = sampleHermite(INTRO_FOV, segment, progress);
    output.focusDistance = sampleHermite(INTRO_FOCUS_DISTANCE, segment, progress);
    output.focusRange = sampleHermite(INTRO_FOCUS_RANGE, segment, progress);
    output.fovScale = Math.tan((39 * Math.PI) / 360) / Math.tan((output.fov * Math.PI) / 360);
    output.opacity = smoothstep(time / 0.8);
    output.progress = time / INTRO_TIMES[INTRO_TIMES.length - 1];
    return output;
  }

  function sampleFocusState(z, intro, minimumDimension, output = {}) {
    const planeZ = 10 - intro.focusDistance;
    const distance = Math.abs(z - planeZ);
    const focusBlur = smoothstep((distance - 0.72) / (7.2 - 0.72));
    const particleBokeh = clamp(Math.pow(focusBlur, 1.34) * 2.41, 0, 1);
    const postThreshold = 0.72 + 5.5 * intro.focusRange;
    const postDefocus = smoothstep((distance - postThreshold) / Math.max(0.001, 7.2 - postThreshold));
    output.clarity = 1 - focusBlur;
    output.pointScale = 1 + 3.2 * particleBokeh;
    output.haloAlpha = (1 - 0.52 * focusBlur) * (1 - 0.507 * particleBokeh);
    output.coreAlpha = 1 - 0.598 * particleBokeh;
    output.blurRadius = 0.55 * intro.bokehScale * postDefocus * (minimumDimension / 800);
    return output;
  }

  function axialPhase(basePhase, activeSeconds, wobblePhase = 0, wobbleAmplitude = 0.045) {
    return basePhase + activeSeconds * 0.2288 + Math.sin(activeSeconds * 0.1 + wobblePhase) * wobbleAmplitude;
  }

  function sampleGalaxyPath(structure, phase, laneA = 0, laneB = 0, scale = 1, output = {}) {
    const pathScale = Math.max(0, scale);
    const closedPhase = wrapUnit(phase);
    let x = 0;
    let y = 68;

    if (structure === "outer") {
      const angle = closedPhase * TAU;
      const thickness = laneA * 46;
      x = Math.cos(angle) * (183 + thickness);
      y = 68 + Math.sin(angle) * (150 + thickness * 0.46);
    } else if (structure === "spiral") {
      const progress = clamp(phase, 0, 1);
      const angle = -0.35 + progress * Math.PI * 2.85;
      const thickness = laneA * (25 - progress * 10);
      const radius = 171 * Math.pow(1 - progress, 0.82) + 12 + thickness;
      x = Math.cos(angle) * radius;
      y = 68 + Math.sin(angle) * radius * 0.84;
    } else if (structure === "tail") {
      const progress = 1 - clamp(phase, 0, 1);
      const one = 1 - progress;
      x =
        one * one * one * -172 +
        3 * one * one * progress * -117 +
        3 * one * progress * progress * -112 +
        progress * progress * progress * 160 +
        laneA * 24;
      y =
        one * one * one * 15 +
        3 * one * one * progress * -104 +
        3 * one * progress * progress * -286 +
        progress * progress * progress * -242 +
        laneB * 20;
    } else if (structure === "core") {
      const angle = closedPhase * TAU;
      const radius = Math.sqrt(clamp(laneA + 0.5, 0, 1)) * 27;
      x = Math.cos(angle) * radius;
      y = 68 + Math.sin(angle) * radius * 0.8;
    }

    output.x = x * pathScale;
    output.y = y * pathScale;
    return output;
  }

  function distanceToSegment(x, y, startX, startY, endX, endY) {
    const segmentX = endX - startX;
    const segmentY = endY - startY;
    const lengthSquared = segmentX * segmentX + segmentY * segmentY;
    if (lengthSquared === 0) return Math.hypot(x - endX, y - endY);
    const progress = clamp(((x - startX) * segmentX + (y - startY) * segmentY) / lengthSquared, 0, 1);
    return Math.hypot(x - (startX + segmentX * progress), y - (startY + segmentY * progress));
  }

  function setProjectionTransform(rotationX, rotationY, output = {}) {
    output.cosX = Math.cos(rotationX);
    output.sinX = Math.sin(rotationX);
    output.cosY = Math.cos(rotationY);
    output.sinY = Math.sin(rotationY);
    return output;
  }

  function projectLayerPoint(star, rotationX, rotationY, width, height, output = {}, transform = null) {
    if (star.layer === "ambient") {
      output.screenX = star.x;
      output.screenY = star.y;
      output.depth = 1;
      return output;
    }

    const cosX = transform ? transform.cosX : Math.cos(rotationX);
    const sinX = transform ? transform.sinX : Math.sin(rotationX);
    const cosY = transform ? transform.cosY : Math.cos(rotationY);
    const sinY = transform ? transform.sinY : Math.sin(rotationY);
    const rotatedX = star.x * cosY - star.z * sinY;
    const rotatedZ = star.x * sinY + star.z * cosY;
    const rotatedY = star.y * cosX - rotatedZ * sinX;
    const z = star.y * sinX + rotatedZ * cosX;
    const depth = Math.max(0.54, 1 + z / 900);

    output.screenX = width / 2 + rotatedX * depth;
    output.screenY = height / 2 + rotatedY * depth;
    output.depth = depth;
    return output;
  }

  function stepDisturbance(particle, pointer, frameScale = 1) {
    if (
      !pointer.active &&
      particle.offsetX === 0 &&
      particle.offsetY === 0 &&
      particle.velocityX === 0 &&
      particle.velocityY === 0
    ) {
      return particle;
    }

    const totalScale = clamp(frameScale, 0.25, 15);

    if (pointer.active && !pointer.pressed) {
      const distance = distanceToSegment(
        particle.screenX + particle.offsetX,
        particle.screenY + particle.offsetY,
        pointer.previousX,
        pointer.previousY,
        pointer.x,
        pointer.y,
      );
      if (distance < pointer.radius) {
        const normalized = distance / pointer.radius;
        const smooth = normalized * normalized * (3 - 2 * normalized);
        const weight = Math.pow(1 - smooth, 2);
        const mass = particle.mass || 1;
        const interactionStrength = particle.interactionStrength ?? 1;
        particle.velocityX += (pointer.velocityX * weight * 0.32 * interactionStrength) / mass;
        particle.velocityY += (pointer.velocityY * weight * 0.32 * interactionStrength) / mass;
      }
    }

    const speed = Math.hypot(particle.velocityX, particle.velocityY);
    const maximumSpeed = pointer.maximumSpeed || 34;
    if (speed > maximumSpeed) {
      particle.velocityX = (particle.velocityX / speed) * maximumSpeed;
      particle.velocityY = (particle.velocityY / speed) * maximumSpeed;
    }

    let remainingScale = totalScale;
    while (remainingScale > 0) {
      const scale = Math.min(1, remainingScale);
      const seconds = scale / 60;
      particle.offsetX += particle.velocityX * scale;
      particle.offsetY += particle.velocityY * scale;
      const velocityDecay = Math.exp((-2.3 * seconds) / Math.sqrt(particle.mass || 1));
      const positionDecay = Math.exp(-seconds);
      particle.velocityX *= velocityDecay;
      particle.velocityY *= velocityDecay;
      particle.offsetX *= positionDecay;
      particle.offsetY *= positionDecay;
      remainingScale -= scale;
    }

    if (!pointer.active && Math.hypot(particle.offsetX, particle.offsetY) < 0.02 && Math.hypot(particle.velocityX, particle.velocityY) < 0.02) {
      particle.offsetX = 0;
      particle.offsetY = 0;
      particle.velocityX = 0;
      particle.velocityY = 0;
    }

    return particle;
  }

  return {
    distanceToSegment,
    axialPhase,
    projectLayerPoint,
    pauseActiveClock,
    sampleGalaxyPath,
    sampleFocusState,
    sampleIntroTimeline,
    setProjectionTransform,
    stepActiveClock,
    stepDisturbance,
    stepRenderGate,
    wrapUnit,
  };
});
