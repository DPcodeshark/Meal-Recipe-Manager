export const MEMBER_COLORS = {
  Erika: '#ec4899',
  Merrill: '#3b82f6',
  Cory: '#10b981',
  Avery: '#f59e0b',
  Radek: '#8b5cf6',
}

export const MEMBER_EMOJI = {
  Erika: '🌸',
  Merrill: '🐻',
  Cory: '🦊',
  Avery: '🦁',
  Radek: '🚀',
}

export const EMOJI_PALETTE = [
  '🌸', '🌻', '🌈', '⭐', '✨', '🌙',
  '🐻', '🦊', '🦁', '🐼', '🐨', '🐯',
  '🦄', '🐙', '🐝', '🦋', '🐢', '🐳',
  '🍕', '🌮', '🍔', '🍣', '🍰', '🥑',
  '🚀', '🎨', '🎸', '⚽', '🏆', '🎯',
  '👑', '🎩', '🤖', '🧙', '🦸', '🐉',
]

export const DEFAULT_TRUSTED_SITES = [
  'livelytable.com',
  'cafedelites.com',
  'dinneratthezoo.com',
  'recipetineats.com',
]

export const CUISINE_EMOJI = {
  American: '🍔',
  Italian: '🍝',
  Mexican: '🌮',
  Asian: '🥡',
  Indian: '🍛',
  Mediterranean: '🫒',
  'Comfort Food': '🍲',
  'BBQ/Grill': '🔥',
  'Soup/Stew': '🥣',
  Salad: '🥗',
  Pasta: '🍝',
  Seafood: '🐟',
}

export function getMemberEmoji(member) {
  if (!member) return '🍽️'
  if (member.emoji) return member.emoji
  return MEMBER_EMOJI[member.name] || member.name?.[0]?.toUpperCase() || '🍽️'
}

export const MEAL_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
]

export const CUISINE_TAGS = [
  'American',
  'Italian',
  'Mexican',
  'Asian',
  'Indian',
  'Mediterranean',
  'Comfort Food',
  'BBQ/Grill',
  'Soup/Stew',
  'Salad',
  'Pasta',
  'Seafood',
]

export const DIETARY_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Low-Carb',
  'Quick (<30 min)',
  'Meal Prep Friendly',
]

export const AISLE_ORDER = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Frozen',
  'Pantry / Dry Goods',
  'Canned Goods',
  'Condiments & Sauces',
  'Snacks',
  'Beverages',
  'Spices & Seasonings',
  'Other',
]

export const DEFAULT_AISLES = [
  'Produce',
  'Meat & Seafood',
  'Dairy',
  'Bakery & Bread',
  'Frozen',
  'Pasta & Grains',
  'Canned Goods',
  'Sauces & Condiments',
  'Spices',
  'Snacks',
  'Beverages',
  'Other',
]
