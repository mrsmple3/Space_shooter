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
          :style="{
            width: projectileSize.width + 'px',
            height: projectileSize.height + 'px',
            top: projectile.top + 'px',
            left: projectile.left + 'px',
          }"
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
      <div class="flex items-center gap-4 mb-5 text-white">
        <button
          class="px-6 py-2 bg-green-500"
          @click="startGame"
          v-if="!isStarted"
        >
          Start
        </button>
        <button class="px-6 py-2 bg-red-500" @click="stopGame" v-else>
          Stop
        </button>
      </div>
      <div class="flex items-center gap-5 mb-4">
        <span>Destroyed: {{ this.counterOf.bang }}</span>
        <span>Misses: {{ this.counterOf.miss }}</span>
        <span>Projectlies: {{ this.counterOf.projectiles }}</span>
      </div>
      <span class="" v-if="!isStarted">Accuracy: {{ this.accuracy }}</span>
    </div>
  </div>
</template>

<script>
import updateProjectiles from "@/functions/updateProjectiles";
import updateExplosions from "@/functions/updateExplosions";

export default {
  name: "HomeView",
  data() {
    return {
      isStarted: false,
      diamond: {
        left: 0,
      },
      projectiles: [],
      projectileSize: {
        width: 50,
        height: 25,
      },
      isUpdatingProjectiles: false,
      isUpdatingWariors: false,
      blueDiamonds: [],
      blueDiamondIntervalId: null,
      counterOf: {
        bang: 0,
        miss: 0,
        projectiles: 0,
      },
      explosions: [],
      explosionDuration: 520,
      accuracy: 0,
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
        left: this.diamond.left - 12,
      };
      this.projectiles.push(newProjectile);
      if (this.isStarted) this.counterOf.projectiles++;
      if (!this.isUpdatingProjectiles) {
        this.isUpdatingProjectiles = true;
        this.updateGame();
      }
    },
    startGame() {
      if (this.blueDiamonds.length === 0) {
        this.isStarted = true;
        this.counterOf.bang = 0;
        this.counterOf.miss = 0;
        this.counterOf.projectiles = 0;
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
      this.isStarted = false;
      this.accuracy =
        Math.floor(
          (this.counterOf.bang /
            (this.counterOf.projectiles + this.counterOf.miss)) *
            10000
        ) | 0;
      clearInterval(this.blueDiamondIntervalId);
      this.blueDiamonds = [];
    },
    updateGame() {
      updateProjectiles(this.projectiles, 5);
      this.handleCollisions();
      updateExplosions(this.explosions, this.explosionDuration);
      // Check collision between red diamond and blue diamonds
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
    conflictRedBlueDiamond() {
      const hitRedDiamond = this.blueDiamonds.find((blueDiamond) => {
        return (
          this.diamond.left < blueDiamond.left + 30 &&
          this.diamond.left + 30 > blueDiamond.left &&
          390 < blueDiamond.top + 30 &&
          390 + 30 > blueDiamond.top
        );
      });

      if (hitRedDiamond) {
        // Game over when red diamond collides with blue diamonds
        this.stopGame();
        return false;
      }
    },
    updateWariors() {
      const update = () => {
        this.blueDiamonds.forEach((blueDiamond) => {
          blueDiamond.top += 2;
        });

        this.blueDiamonds = this.blueDiamonds.filter((warrior) => {
          const shouldKeep = warrior.top < 398;
          if (!shouldKeep) {
            this.counterOf.miss++;
          }
          return shouldKeep;
        });
        this.conflictRedBlueDiamond();
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
        // Check collision between projectiles and blue diamonds
        const hitBlueDiamond = this.blueDiamonds.find((blueDiamond) => {
          return (
            projectile.left < blueDiamond.left + 30 &&
            projectile.left + this.projectileSize.width > blueDiamond.left &&
            projectile.top < blueDiamond.top + 30 &&
            projectile.top + this.projectileSize.height > blueDiamond.top
          );
        });

        if (hitBlueDiamond) {
          const explosion = {
            id: Date.now(),
            top: hitBlueDiamond.top - 15,
            left: hitBlueDiamond.left - 15,
            startTime: Date.now(),
          };
          this.explosions.push(explosion);
          const index = this.blueDiamonds.indexOf(hitBlueDiamond);
          this.blueDiamonds.splice(index, 1);
          this.counterOf.bang++;
          return false;
        }

        return projectile.top > 0;
      });
    },
  },
};
</script>

<style lang="scss">
.game-container {
  position: relative;
  height: 400px;
  border: 1px solid #ccc;
  box-sizing: border-box;
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
  background: url("https://cdn.staticcrate.com/stock-hd/effects/footagecrate-looping-blaster-bolt-basic-prev-full.png");
  background-size: cover;
  z-index: 1;
  transform: rotate(-90deg);
  transform-origin: center center;
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
  background: url("https://www.onlygfx.com/wp-content/uploads/2018/02/starburst-explosion-2-1.png");
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
