export default function updateWar(blueDiamonds, gameZone, counterOf) {
  blueDiamonds.forEach((blueDiamond) => {
    blueDiamond.top += 2;
  });

  blueDiamonds = blueDiamonds.filter((warrior) => {
    const shouldKeep = warrior.top < gameZone;
    if (!shouldKeep) {
      counterOf.miss++;
    }
    return shouldKeep;
  });
}
