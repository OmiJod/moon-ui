local isUIOpen = false
local currentCallback = nil
local correctCombination = nil

-- Function to close safe cracking lock UI
local function CloseSafeCrackingLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
    correctCombination = nil
end

-- Function to open safe cracking lock UI
function OpenSafeCrackingLock(combination, callback)
    if isUIOpen or not combination then return end
    
    isUIOpen = true
    currentCallback = callback
    correctCombination = combination
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openSafeLock'
    })
end

-- Register NUI Callback for safe cracking completion
RegisterNUICallback('safeCrackingComplete', function(data, cb)
    if not correctCombination then
        if currentCallback then
            currentCallback(false)
        end
        cb('ok')
        return
    end

    local userCombination = data.combination
    local success = true
    
    -- Validate lengths match
    if #userCombination ~= #correctCombination then
        success = false
    else
        -- Compare each number with a small tolerance for floating point differences
        for i = 1, #correctCombination do
            if math.abs(userCombination[i] - correctCombination[i]) > 1 then
                success = false
                break
            end
        end
    end
    
    SendNUIMessage({
        type = 'safeResult',
        success = success
    })
    
    if success then
        if currentCallback then
            currentCallback(true)
        end
        isUIOpen = false
        SetNuiFocus(false, false)
        currentCallback = nil
        correctCombination = nil
    else
        if currentCallback then
            currentCallback(false)
        end
    end
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseSafeCrackingLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenSafeCrackingLock', OpenSafeCrackingLock)