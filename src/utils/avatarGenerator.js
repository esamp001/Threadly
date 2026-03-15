import { adventurer } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';

export const generateAvatar = (options, avatarSeed) => {
  // Helper function to pick random from array
  const getRandomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const avatar = createAvatar(adventurer, {
    seed: avatarSeed,
    size: 128,
    hair: options.gender === 'female'
      ? ['long01', 'long02', 'long03', 'long04', 'long05', 'long06']
      : ['short01', 'short02', 'short03'],
    hairColor: options.hairColor || ['0e0e0e', '3eac2c', '6a4e35', '85c2c6'],
    accessories: options.accessories || ['variant01', 'variant02'],
    facialHair: options.gender === 'male'
      ? ['variant01', 'variant02', 'none']
      : ['none'],
    clothing: options.clothing || ['variant01', 'variant02'],
    clothingColor: options.clothingColor || ['0e0e0e', '3eac2c', '6a4e35'],
    eyes: options.eyes || ['variant01', 'variant02', 'variant03'],
    mouth: options.mouth || ['variant01', 'variant02', 'variant03'],
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
  });

  // Build URL with randomized values matching the same logic
  const params = new URLSearchParams({
    seed: avatarSeed,
    size: '128',
    hair: options.gender === 'female'
      ? getRandomFromArray(['long01', 'long02', 'long03', 'long04', 'long05', 'long06'])
      : getRandomFromArray(['short01', 'short02', 'short03']),
    hairColor: getRandomFromArray(options.hairColor || ['0e0e0e', '3eac2c', '6a4e35', '85c2c6']),
    accessories: getRandomFromArray(options.accessories || ['variant01', 'variant02']),
    facialHair: options.gender === 'male'
      ? getRandomFromArray(['variant01', 'variant02', 'none'])
      : 'none',
    clothing: getRandomFromArray(options.clothing || ['variant01', 'variant02']),
    clothingColor: getRandomFromArray(options.clothingColor || ['0e0e0e', '3eac2c', '6a4e35']),
    eyes: getRandomFromArray(options.eyes || ['variant01', 'variant02', 'variant03']),
    mouth: getRandomFromArray(options.mouth || ['variant01', 'variant02', 'variant03']),
    backgroundColor: getRandomFromArray(['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'])
  });

  return `https://api.dicebear.com/7.x/adventurer/svg?${params.toString()}`;
}