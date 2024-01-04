export default function updateExplosions(explosions, explosionDuration) {
  explosions = explosions.filter((explosion) => {
    return Date.now() - explosion.startTime < explosionDuration ? true : false;
  });
}
