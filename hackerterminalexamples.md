### 1. **Check if a number is positive, negative, or zero**

```lua
RegisterCommand('testposneg', function()
    local challenge = [[
    Write a function that checks whether a number is positive, negative, or zero.
    The function should:
    - Take a single number parameter
    - Return "positive", "negative", or "zero"

    Example:
    checkSign(5) should return "positive"
    checkSign(-3) should return "negative"
    checkSign(0) should return "zero"
    ]]

    local testCases = {
        { input = {5}, expected = "positive" },
        { input = {-3}, expected = "negative" },
        { input = {0}, expected = "zero" }
    }

    -- Expected:
    --[[
        return function(n)
            if n > 0 then
                return "positive"
            elseif n < 0 then
                return "negative"
            else
                return "zero"
            end
        end
    ]]

    exports['moon-ui']:OpenHackersTerminal('lua', challenge, 10, testCases, print, print)
end)
```

---

### 2. **Check if a number is divisible by 3**

```lua
RegisterCommand('testdiv3', function()
    local challenge = [[
    Write a function that checks whether a number is divisible by 3.
    The function should:
    - Take a single number parameter
    - Return true if divisible by 3, otherwise false

    Example:
    isDivisibleByThree(9) should return true
    isDivisibleByThree(10) should return false
    ]]

    local testCases = {
        { input = {9}, expected = true },
        { input = {10}, expected = false },
        { input = {0}, expected = true }
    }

    -- Expected:
    --[[
        return function(n)
            return n % 3 == 0
        end
    ]]

    exports['moon-ui']:OpenHackersTerminal('lua', challenge, 10, testCases, print, print)
end)
```

---

### 3. **Return the square of a number**

```lua
RegisterCommand('testsquare', function()
    local challenge = [[
    Write a function that returns the square of a number.
    The function should:
    - Take a single number parameter
    - Return the number multiplied by itself

    Example:
    square(4) should return 16
    square(-2) should return 4
    ]]

    local testCases = {
        { input = {4}, expected = 16 },
        { input = {-2}, expected = 4 },
        { input = {0}, expected = 0 }
    }

    -- Expected:
    --[[
        return function(n)
            return n * n
        end
    ]]

    exports['moon-ui']:OpenHackersTerminal('lua', challenge, 10, testCases, print, print)
end)
```

---

### 4. **Return the larger of two numbers**

```lua
RegisterCommand('testmax', function()
    local challenge = [[
    Write a function that returns the larger of two numbers.
    The function should:
    - Take two number parameters
    - Return the greater number

    Example:
    max(5, 10) should return 10
    max(8, 3) should return 8
    max(7, 7) should return 7
    ]]

    local testCases = {
        { input = {5, 10}, expected = 10 },
        { input = {8, 3}, expected = 8 },
        { input = {7, 7}, expected = 7 }
    }

    -- Expected:
    --[[
        return function(a, b)
            if a > b then return a else return b end
        end
    ]]

    exports['moon-ui']:OpenHackersTerminal('lua', challenge, 10, testCases, print, print)
end)
```

---

### 5. **Return the absolute value of a number**

```lua
RegisterCommand('testabs', function()
    local challenge = [[
    Write a function that returns the absolute value of a number.
    The function should:
    - Take a single number parameter
    - Return the number without its sign

    Example:
    absolute(-5) should return 5
    absolute(3) should return 3
    absolute(0) should return 0
    ]]

    local testCases = {
        { input = {-5}, expected = 5 },
        { input = {3}, expected = 3 },
        { input = {0}, expected = 0 }
    }

    -- Expected:
    --[[
        return function(n)
            if n < 0 then return -n else return n end
        end
    ]]

    exports['moon-ui']:OpenHackersTerminal('lua', challenge, 10, testCases, print, print)
end)
```