local isUIOpen = false
local currentCallback = nil
local equation = nil
local solution = nil

-- Function to generate a random math equation
local function generateMathEquation()
    local num1 = math.random(1, 20)
    local num2 = math.random(1, 20)
    local operator = math.random(1, 4) -- 1: +, 2: -, 3: *, 4: /
    
    local equationString = ""
    local answer = 0
    
    if operator == 1 then
        equationString = num1 .. " + " .. num2
        answer = num1 + num2
    elseif operator == 2 then
        equationString = num1 .. " - " .. num2
        answer = num1 - num2
    elseif operator == 3 then
        equationString = num1 .. " × " .. num2
        answer = num1 * num2
    elseif operator == 4 then
        -- Ensure division results in whole numbers
        answer = num2
        num1 = num2 * math.random(1, 10)
        equationString = num1 .. " ÷ " .. num2
    end
    
    return equationString, answer
end

-- Function to close math puzzle lock UI
local function CloseMathPuzzleLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
    equation = nil
    solution = nil
end

-- Function to open math puzzle lock UI
function OpenMathPuzzleLock(callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    equation, solution = generateMathEquation()
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openMathPuzzleLock',
        equation = equation
    })
end

-- Register NUI Callback for getting math equation
RegisterNUICallback('getMathEquation', function(_, cb)
    local equationString, answer = generateMathEquation()
    equation = equationString
    solution = answer
    
    cb({ equation = equationString })
end)

-- Register NUI Callback for validating math answer
RegisterNUICallback('validateMathAnswer', function(data, cb)
    local userAnswer = tonumber(data.answer)
    local success = false
    
    if userAnswer and solution then
        success = math.abs(userAnswer - solution) < 0.001
    end
    
    if success then
        if currentCallback then
            currentCallback(true)
        end
        isUIOpen = false
        SetNuiFocus(false, false)
        currentCallback = nil
        equation = nil
        solution = nil
    else
        if currentCallback then
            currentCallback(false)
        end
    end
    
    SendNUIMessage({
        type = 'mathPuzzleResult',
        success = success
    })
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseMathPuzzleLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenMathPuzzleLock', OpenMathPuzzleLock)