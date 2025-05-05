local isUIOpen = false
local currentPattern = nil
local currentCallback = nil

-- Function to check if patterns match
local function patternsMatch(pattern1, pattern2)
    if #pattern1 ~= #pattern2 then
        return false
    end
    
    for i = 1, #pattern1 do
        if pattern1[i] ~= pattern2[i] then
            return false
        end
    end
    
    return true
end

-- Function to close pattern lock UI
local function ClosePatternLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentPattern = nil
    currentCallback = nil
end

-- Function to open pattern lock UI
function OpenPatternLock(correctPattern, callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentPattern = correctPattern
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openPatternLock'
    })
end

-- Register NUI Callback for pattern completion
RegisterNUICallback('patternComplete', function(data, cb)
    local userPattern = data.pattern
    local success = patternsMatch(userPattern, currentPattern)
    
    if success then
        if currentCallback then
            currentCallback(true)
        end
        isUIOpen = false
        SetNuiFocus(false, false)
        currentPattern = nil
        currentCallback = nil
    else
        if currentCallback then
            currentCallback(false)
        end
    end
    
    SendNUIMessage({
        type = 'patternResult',
        success = success
    })
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        ClosePatternLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenPatternLock', OpenPatternLock)