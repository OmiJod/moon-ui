local isUIOpen = false
local currentSequence = nil
local currentCallback = nil

-- Function to check if sequences match
local function sequencesMatch(seq1, seq2)
    if #seq1 ~= #seq2 then
        return false
    end
    
    for i = 1, #seq1 do
        if seq1[i] ~= seq2[i] then
            return false
        end
    end
    
    return true
end

-- Function to close color sequence lock UI
local function CloseColorSequenceLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentSequence = nil
    currentCallback = nil
end

-- Function to open color sequence lock UI
function OpenColorSequenceLock(correctSequence, callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentSequence = correctSequence
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openColorSequenceLock'
    })
end

-- Register NUI Callback for sequence completion
RegisterNUICallback('colorSequenceComplete', function(data, cb)
    local userSequence = data.sequence
    local success = sequencesMatch(userSequence, currentSequence)
    
    if success then
        if currentCallback then
            currentCallback(true)
        end
        isUIOpen = false
        SetNuiFocus(false, false)
        currentSequence = nil
        currentCallback = nil
    else
        if currentCallback then
            currentCallback(false)
        end
    end
    
    SendNUIMessage({
        type = 'colorSequenceResult',
        success = success
    })
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseColorSequenceLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenColorSequenceLock', OpenColorSequenceLock)