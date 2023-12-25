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
          v-for="blueDiamond in blueDiamonds"
          :key="blueDiamond.id"
          class="blue-diamond"
          :style="{
            top: blueDiamond.top + 'px',
            left: blueDiamond.left + 'px',
          }"
        ></div>
      </div>
      <div class="flex items-center gap-4">
        <button class="border px-2 py-2" @click="startGame">Start</button>
        <button class="border px-2 py-2" @click="stopGame">Stop</button>
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
        }, 1500);
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

        this.blueDiamonds = this.blueDiamonds.filter(
          (warriors) => warriors.top < 398
        );

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
        // Проверка столкновения с синими алмазами
        const hitBlueDiamond = this.blueDiamonds.find((blueDiamond) => {
          return (
            projectile.left < blueDiamond.left + 30 &&
            projectile.left + 5 > blueDiamond.left &&
            projectile.top < blueDiamond.top + 30 &&
            projectile.top + 10 > blueDiamond.top
          );
        });

        if (hitBlueDiamond) {
          // Удаляем синий алмаз
          const index = this.blueDiamonds.indexOf(hitBlueDiamond);
          this.blueDiamonds.splice(index, 1);
          return false; // Удаляем пулю
        }

        return projectile.top > 0;
      });
    },
    updateGame() {
      this.updateProjectiles();
      this.handleCollisions();

      if (this.projectiles.length > 0 || this.blueDiamonds.length > 0) {
        requestAnimationFrame(() => this.updateGame());
      } else {
        this.isUpdatingProjectiles = false;
        this.isUpdatingWariors = false;
      }
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
</style>
