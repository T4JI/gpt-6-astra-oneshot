(function attachAstraParticlePhysics(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.AstraParticlePhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

  function distanceToSegment(x, y, startX, startY, endX, endY) {
    const segmentX = endX - startX;
    const segmentY = endY - startY;
    const lengthSquared = segmentX * segmentX + segmentY * segmentY;
    if (lengthSquared === 0) return Math.hypot(x - endX, y - endY);
    const progress = clamp(((x - startX) * segmentX + (y - startY) * segmentY) / lengthSquared, 0, 1);
    return Math.hypot(x - (startX + segmentX * progress), y - (startY + segmentY * progress));
  }

  function projectLayerPoint(star, rotationX, rotationY, width, height) {
    if (star.layer === "ambient") {
      return { screenX: star.x, screenY: star.y, depth: 1 };
    }

    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const rotatedX = star.x * cosY - star.z * sinY;
    const rotatedZ = star.x * sinY + star.z * cosY;
    const rotatedY = star.y * cosX - rotatedZ * sinX;
    const z = star.y * sinX + rotatedZ * cosX;
    const depth = Math.max(0.54, 1 + z / 900);

    return {
      screenX: width / 2 + rotatedX * depth,
      screenY: height / 2 + rotatedY * depth,
      depth,
    };
  }

  function stepDisturbance(particle, pointer, frameScale = 1) {
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
        particle.velocityX += (pointer.velocityX * weight * 0.32) / mass;
        particle.velocityY += (pointer.velocityY * weight * 0.32) / mass;
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

  return { distanceToSegment, projectLayerPoint, stepDisturbance };
});
