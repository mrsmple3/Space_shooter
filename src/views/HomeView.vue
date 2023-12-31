<template>
  <div class="home">
    <div id="app" class="flex flex-col items-center">
      <div
        @mousemove="moveDiamond"
        @click="bang"
        class="game-container w-full mb-6"
      >
        <div class="diamond" :style="{ left: diamond.left + 'px' }"></div>
        <div
          v-for="projectile in projectiles"
          :key="projectile.id"
          class="projectile"
          :style="{ top: projectile.top + 'px', left: projectile.left + 'px' }"
        ></div>
        <div
          v-for="explosion in explosions"
          :key="explosion.id"
          class="explosion"
          :style="{ top: explosion.top + 'px', left: explosion.left + 'px' }"
        ></div>
        <div
          v-for="blueDiamond in blueDiamonds"
          :key="blueDiamond.id"
          class="blue-diamond"
          :style="{
            top: blueDiamond.top + 'px',
            left: blueDiamond.left + 'px',
          }"
        ></div>
      </div>
      <div class="flex items-center gap-4 mb-5">
        <button class="border px-2 py-2" @click="startGame">Start</button>
        <button class="border px-2 py-2" @click="stopGame">Stop</button>
      </div>
      <div class="flex items-center gap-5">
        <span>Destroyed: {{ this.counterOfBang }}</span>
        <span>Misses: {{ this.counterOfMiss }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  data() {
    return {
      diamond: {
        left: 0,
      },
      projectiles: [],
      isUpdatingProjectiles: false,
      isUpdatingWariors: false,
      blueDiamonds: [],
      blueDiamondIntervalId: null,
      counterOfBang: 0,
      counterOfMiss: 0,
      explosions: [],
      explosionDuration: 520,
    };
  },
  methods: {
    moveDiamond(event) {
      this.diamond.left = event.clientX - 15;
    },
    bang() {
      const newProjectile = {
        id: Date.now(),
        top: 380,
        left: this.diamond.left + 13,
      };
      this.projectiles.push(newProjectile);
      // Start updating projectiles if not already updating
      if (!this.isUpdatingProjectiles) {
        this.isUpdatingProjectiles = true;
        this.updateGame();
      }
    },
    updateProjectiles() {
      this.projectiles.forEach((projectile) => {
        projectile.top -= 5; // Adjust the speed as needed
      });

      this.projectiles = this.projectiles.filter(
        (projectile) => projectile.top > 0
      );
    },
    startGame() {
      if (this.blueDiamonds.length === 0) {
        this.blueDiamondIntervalId = setInterval(() => {
          const newBlueDiamond = {
            id: Date.now(),
            top: 0,
            left: Math.floor(Math.random() * (window.innerWidth - 30)),
          };
          this.blueDiamonds.push(newBlueDiamond);
          if (!this.isUpdatingWariors) {
            this.isUpdatingWariors = true;
            this.updateWariors();
          }
        }, Math.floor(Math.random() * (1500 - 700 + 1)) + 700);
      }
    },
    stopGame() {
      clearInterval(this.blueDiamondIntervalId);
      this.blueDiamonds = [];
    },
    updateWariors() {
      const update = () => {
        this.blueDiamonds.forEach((blueDiamond) => {
          blueDiamond.top += 2;
        });

        this.blueDiamonds = this.blueDiamonds.filter((warrior) => {
          const shouldKeep = warrior.top < 398;

          if (!shouldKeep) {
            // Increment counterOfMiss if a blue diamond disappears
            this.counterOfMiss++;
          }

          return shouldKeep;
        });

        if (this.blueDiamonds.length > 0) {
          requestAnimationFrame(update);
        } else {
          this.isUpdatingWariors = false;
        }
      };
      requestAnimationFrame(update);
    },
    handleCollisions() {
      this.projectiles = this.projectiles.filter((projectile) => {
        // Check for collisions with blue diamonds
        const hitBlueDiamond = this.blueDiamonds.find((blueDiamond) => {
          return (
            projectile.left < blueDiamond.left + 30 &&
            projectile.left + 5 > blueDiamond.left &&
            projectile.top < blueDiamond.top + 30 &&
            projectile.top + 10 > blueDiamond.top
          );
        });

        if (hitBlueDiamond) {
          const explosion = {
            id: Date.now(),
            top: hitBlueDiamond.top - 15,
            left: hitBlueDiamond.left - 15,
            startTime: Date.now(), // Set the start time
          };
          this.explosions.push(explosion);

          // Remove the blue diamond
          const index = this.blueDiamonds.indexOf(hitBlueDiamond);
          this.blueDiamonds.splice(index, 1);

          this.counterOfBang++;
          return false; // Remove the projectile
        }

        return projectile.top > 0;
      });
    },
    updateGame() {
      this.updateProjectiles();
      this.handleCollisions();

      if (
        this.projectiles.length > 0 ||
        this.blueDiamonds.length > 0 ||
        this.explosions.length > 0
      ) {
        requestAnimationFrame(() => this.updateGame());
      } else {
        this.isUpdatingProjectiles = false;
        this.isUpdatingWariors = false;
      }
    },
    updateExplosions() {
      // Remove expired explosions
      this.explosions = this.explosions.filter((explosion) => {
        // Check if the explosion is still within the specified duration
        if (Date.now() - explosion.startTime < this.explosionDuration) {
          return true; // Keep the explosion
        }

        // If the duration has passed, remove the explosion
        return false;
      });
    },
  },
};
</script>

<style lang="scss">
.game-container {
  position: relative;
  width: 400px;
  height: 400px;
  border: 1px solid #ccc;
}

.diamond {
  position: absolute;
  bottom: 0;
  width: 30px;
  height: 30px;
  background-color: #f00;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
.projectile {
  position: absolute;
  width: 5px;
  height: 10px;
  background-color: #00f;
}
.blue-diamond {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: #00f;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  z-index: 1;
}
.explosion {
  position: absolute;
  width: 30px;
  height: 30px;
  background: url("https://www.onlygfx.com/wp-content/uploads/2018/02/starburst-explosion-2-1.png"); /* Use an explosion image */
  background-size: cover;
  animation: explode 0.5s forwards;
  z-index: 2; /* Ensure the explosion appears above other elements */
}

@keyframes explode {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
