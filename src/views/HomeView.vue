<template>
  <div class="home">
    <div
      class="absolute text-white top-1/3 left-1/2 right-1/2 text-nowrap z-50 flex flex-col items-center gap-5"
      v-if="gameOverVisible"
    >
      <h3 class="font-bold text-9xl">Game Over</h3>
      <span class="font-medium text-2xl">Accuracy: {{ this.accuracy }}</span>
    </div>

    <div id="app" class="flex flex-col items-center">
      <div
        @mousemove="moveDiamond"
        @click="bang"
        @mousedown="pulimotDown"
        @mouseup="pulimotUp"
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
          :class="{ stone: blueDiamond.isStone }"
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
      <span class="mb-4"
        >Health❤️: {{ this.health - this.counterOf.miss }}</span
      >
      <div class="flex items-center gap-5 mb-4">
        <span>Destroyed: {{ this.counterOf.bang }}</span>
        <span>Misses: {{ this.counterOf.miss }}</span>
        <span>Projectlies: {{ this.counterOf.projectiles }}</span>
      </div>
      <span class="" v-if="!isStarted"
        ><strong>Accuracy:</strong> {{ this.accuracy }}</span
      >
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
      gameZone: window.innerHeight * 0.8 - 20,
      speedRange: 0,
      countOfSpeed: 10,
      health: 10,
      bangInterval: null,
      stoneIntervalId: null,
      stoneCount: 0,
      isMousePressed: false,
      gameOverVisible: false,
    };
  },
  mounted() {
    document.addEventListener("contextmenu", this.disableContextMenu);
  },
  beforeUnmount() {
    document.removeEventListener("contextmenu", this.disableContextMenu);
  },
  methods: {
    disableContextMenu(event) {
      event.preventDefault();
    },
    moveDiamond(event) {
      this.diamond.left = event.clientX - 15;
    },
    pulimotDown(event) {
      if (event.button === 2) {
        event.preventDefault();
        this.isMousePressed = true;
        return;
      }

      if (!this.isMousePressed) {
        this.bangInterval = setInterval(() => {
          this.bang();
        }, 200 - this.speedRange);
      }
    },

    pulimotUp(event) {
      if (event.button === 2) {
        event.preventDefault();
        this.isMousePressed = false;
        return;
      }

      clearInterval(this.bangInterval);
    },
    bang() {
      const newProjectile = {
        id: Date.now(),
        top: this.gameZone,
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
      this.isStarted = true;
      this.gameOverVisible = false;
      this.counterOf.bang = 0;
      this.counterOf.miss = 0;
      this.counterOf.projectiles = 0;
      this.blueDiamondIntervalId = setInterval(() => {
        const newBlueDiamond = {
          id: Date.now(),
          top: 0,
          left: Math.floor(Math.random() * (window.innerWidth - 30)),
          isStone: false,
        };
        this.blueDiamonds.push(newBlueDiamond);
        if (!this.isUpdatingWariors) {
          this.isUpdatingWariors = true;
          this.updateWariors();
        }
        this.stoneCount++;
        if (this.stoneCount === 5) {
          this.stoneCount = 0;
          const newStone = {
            id: Date.now(),
            top: 0,
            left: Math.floor(Math.random() * (window.innerWidth - 30)),
            isStone: true,
          };
          this.blueDiamonds.push(newStone);
        }
      }, Math.floor(Math.random() * (1500 - 600 + 1)) + 600);
    },
    stopGame() {
      this.isStarted = false;
      const projectiles = this.counterOf.projectiles || 1;
      this.accuracy =
        ((projectiles / this.counterOf.bang) * 100 - this.counterOf.miss) | 0;
      clearInterval(this.blueDiamondIntervalId);
      this.blueDiamonds = [];
      this.projectiles = [];
      this.gameOverVisible = true; // Показываем блок "Game Over"
      setTimeout(() => {
        this.gameOverVisible = false; // Скрываем блок "Game Over" через некоторое время
      }, 3500); // Пример: скрыть через 2 секунды
    },
    updateGame() {
      updateProjectiles(this.projectiles, 5 + this.speedRange);
      this.handleCollisions();
      updateExplosions(this.explosions, this.explosionDuration);

      if (this.counterOf.bang > this.countOfSpeed) {
        this.speedRange += 0.002;
        this.countOfSpeed += 10;
      }
      if (this.counterOf.miss === 10) this.stopGame();
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
          this.gameZone < blueDiamond.top + 30 &&
          this.gameZone + 30 > blueDiamond.top
        );
      });

      if (hitRedDiamond) {
        this.stopGame();
        return false;
      }
    },
    updateWariors() {
      const update = () => {
        this.blueDiamonds.forEach((blueDiamond) => {
          blueDiamond.top += 2 + this.speedRange;
        });
        this.blueDiamonds = this.blueDiamonds.filter((warrior) => {
          const shouldKeep = warrior.top < this.gameZone;
          if (!shouldKeep) {
            if (!warrior.isStone) this.counterOf.miss++;
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
          // Игнорируем камни при проверке столкновения
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
          if (!this.blueDiamonds[index].isStone) {
            this.blueDiamonds.splice(index, 1);
            this.counterOf.bang++;
          }
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
  height: 80vh;
  border: 1px solid #ccc;
  box-sizing: border-box;
  background: black;
  box-shadow: 0 0 10px rgba(255, 0, 0, 5);
}

.diamond {
  position: absolute;
  bottom: 0;
  width: 30px;
  height: 30px;
  background: url(../assets/img/redfighter0005.png) center/cover;
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
  background: url("https://i.pinimg.com/originals/41/4b/f7/414bf78283804a8c9901da0e7b912a70.png")
    center/cover;
  transform: rotate(90deg);
  z-index: 1;
}
.stone {
  position: absolute;
  width: 30px;
  height: 30px;
  background: url("https://images.squarespace-cdn.com/content/v1/5b28fd4f85ede1db354cc1c6/1533510045865-LA86PVYAN990HPFP0CNN/Tcom_Rock_CliffMountain_thumb1.png")
    center/cover;
  transform: rotate(90deg);
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
