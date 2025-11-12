# Mental Youth Wellness - Code Reference

This document contains reference information for the games and external modules integrated into the Mental Youth Wellness platform.

## Module 2: MindCheck 🧭
**URL:** https://mentalhealthquiz-eta.vercel.app/

A mental health assessment quiz with 20 questions to measure mood and mental clarity.

### Features:
- 20-question mental health assessment
- Multiple choice answers (Always, Often, Sometimes, Never)
- Progress tracking
- Clean, accessible UI with gradient background

---

## Module 4: BrainPlay 🎯
**Location:** `/brainplay` (Internal route)

Two interactive games designed to improve focus, memory, and mindfulness.

### Game 1: Memory Grid (Remember the Pattern)

**Goal:** Improve short-term memory & concentration

**Code Location:** `src/pages/BrainPlay.tsx`

**How it Works:**
1. Displays a grid (3x3 or 4x4)
2. Random squares light up briefly
3. Player must click the same squares from memory
4. Score increases with each correct pattern
5. Game ends on wrong click

**Key Functions:**
```typescript
// Generate random pattern
const startMemoryGame = () => {
  const patternLength = 3 + Math.floor(memoryScore / 3);
  const newPattern: number[] = [];
  while (newPattern.length < patternLength) {
    const cell = Math.floor(Math.random() * 16);
    if (!newPattern.includes(cell)) {
      newPattern.push(cell);
    }
  }
  // Shows pattern, then hides after 2 seconds
};

// Handle player clicks
const handleCellClick = (index: number) => {
  // Validates if clicked cell matches pattern
  // Increases score or ends game
};
```

**State Management:**
- `memoryPattern`: Array of cell indices to remember
- `showPattern`: Boolean to show/hide pattern
- `clickedCells`: Player's selected cells
- `memoryScore`: Current score
- `gameOver`: Game state

---

### Game 2: Breathing & Focus Trainer

**Goal:** Build attention & mindfulness through breathing exercises

**Code Location:** `src/pages/BrainPlay.tsx`

**How it Works:**
1. Displays an animated circle that expands and contracts
2. Shows "Breathe in" when expanding
3. Shows "Breathe out" when contracting
4. 4-second cycle (2s in, 2s out)

**Key Functions:**
```typescript
// Start breathing exercise
const startBreathing = () => {
  setBreathingActive(true);
  setBreathingPhase("in");
};

// Automatic phase cycling with useEffect
useEffect(() => {
  if (breathingActive) {
    const interval = setInterval(() => {
      setBreathingPhase(prev => prev === "in" ? "out" : "in");
    }, 4000);
    return () => clearInterval(interval);
  }
}, [breathingActive]);
```

**State Management:**
- `breathingActive`: Boolean for exercise state
- `breathingPhase`: "in" or "out" for animation

**Animations:**
- Circle scales from 1 to 1.5 and back
- Smooth transitions with CSS
- Auto-cycling with 4-second intervals

---

## Other Modules

### Module 1: MindMate 🤖
**URL:** https://youthmentalwellnessai.streamlit.app/
**Description:** AI-powered conversational support

### Module 3: Wellness Studio 🌿
**Location:** `/wellness` (Internal route)
**File:** `src/pages/WellnessExercises.tsx`
**Features:** Yoga, meditation, breathing exercises, and healing practices

---

## Authentication
**File:** `src/pages/Auth.tsx`
- Email/password authentication via Supabase
- Auto-redirect to dashboard on login
- Secure session management

## Design System
**Files:** 
- `src/index.css` - Color tokens and CSS variables
- `tailwind.config.ts` - Tailwind configuration
- Uses semantic color tokens (primary, secondary, accent, etc.)
- Gradient backgrounds and smooth animations
- Responsive design for all screen sizes

---

*Last Updated: 2025*
