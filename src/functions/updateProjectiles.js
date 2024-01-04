export default function updateProjectiles(projectiles, speed) {
  projectiles.forEach((projectile) => {
    projectile.top -= speed;
  });
  projectiles = projectiles.filter((projectile) => projectile.top > 0);
}
