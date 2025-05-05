## 1. Triangle Gesture
```lua
{
    { x = 150, y = 50 },   -- Top point
    { x = 50, y = 250 },   -- Bottom left
    { x = 250, y = 250 },  -- Bottom right
    { x = 150, y = 50 }    -- Back to top
}
```

## 2. Square Gesture
```lua
{
    { x = 50, y = 50 },    -- Top left
    { x = 250, y = 50 },   -- Top right
    { x = 250, y = 250 },  -- Bottom right
    { x = 50, y = 250 },   -- Bottom left
    { x = 50, y = 50 }     -- Back to start
}
```

## 3. Z Pattern Gesture
```lua
{
    { x = 50, y = 50 },    -- Top left
    { x = 250, y = 50 },   -- Top right
    { x = 50, y = 250 },   -- Bottom left
    { x = 250, y = 250 }   -- Bottom right
}
```

## 4. Infinity Symbol Gesture
```lua
{
    { x = 150, y = 150 },  -- Center
    { x = 75, y = 100 },   -- Left top curve
    { x = 75, y = 200 },   -- Left bottom curve
    { x = 150, y = 150 },  -- Center again
    { x = 225, y = 100 },  -- Right top curve
    { x = 225, y = 200 },  -- Right bottom curve
    { x = 150, y = 150 }   -- Back to center
}
```

## 5. Star Gesture
```lua
{
    { x = 150, y = 50 },   -- Top point
    { x = 250, y = 250 },  -- Bottom right
    { x = 50, y = 150 },   -- Middle left
    { x = 250, y = 150 },  -- Middle right
    { x = 50, y = 250 },   -- Bottom left
    { x = 150, y = 50 }    -- Back to top
}
```

## 6. Spiral Gesture
```lua
{
    { x = 150, y = 150 },  -- Center
    { x = 200, y = 150 },  -- Right
    { x = 200, y = 200 },  -- Bottom right
    { x = 100, y = 200 },  -- Bottom left
    { x = 100, y = 100 },  -- Top left
    { x = 175, y = 100 },  -- Top
    { x = 175, y = 175 },  -- Inner center
    { x = 125, y = 175 },  -- Inner left
    { x = 150, y = 150 }   -- Back to center
}
```

## 7. Lightning Bolt Gesture
```lua
{
    { x = 150, y = 50 },   -- Top
    { x = 100, y = 150 },  -- Middle left
    { x = 150, y = 150 },  -- Middle
    { x = 100, y = 250 }   -- Bottom
}
```

## 8. Heart Gesture
```lua
{
    { x = 150, y = 250 },  -- Bottom point
    { x = 50, y = 150 },   -- Left curve
    { x = 150, y = 50 },   -- Top center
    { x = 250, y = 150 },  -- Right curve
    { x = 150, y = 250 }   -- Back to bottom
}
```

## 9. Arrow Gesture
```lua
{
    { x = 150, y = 50 },   -- Arrow tip
    { x = 50, y = 150 },   -- Left wing
    { x = 150, y = 50 },   -- Back to tip
    { x = 250, y = 150 },  -- Right wing
    { x = 150, y = 50 },   -- Back to tip
    { x = 150, y = 250 }   -- Arrow shaft
}
```

## 10. Wave Gesture
```lua
{
    { x = 50, y = 150 },   -- Start
    { x = 100, y = 100 },  -- First peak
    { x = 150, y = 200 },  -- First valley
    { x = 200, y = 100 },  -- Second peak
    { x = 250, y = 200 }   -- Second valley
}
