local isUIOpen = false
local currentCode = nil
local currentCallback = nil

-- Function to check if codes match
local function codesMatch(code1, code2)
    return code1 == code2
end

-- Function to close keypad lock UI
local function CloseKeypadLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCode = nil
    currentCallback = nil
end

-- Function to open keypad lock UI
function OpenKeypadLock(correctCode, callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCode = correctCode
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openKeypadLock'
    })
end

-- Register NUI Callback for keypad completion
RegisterNUICallback('keypadComplete', function(data, cb)
    local userCode = data.code
    local success = codesMatch(userCode, currentCode)
    
    if success then
        if currentCallback then
            currentCallback(true)
        end
        isUIOpen = false
        SetNuiFocus(false, false)
        currentCode = nil
        currentCallback = nil
    else
        if currentCallback then
            currentCallback(false)
        end
    end
    
    SendNUIMessage({
        type = 'keypadResult',
        success = success
    })
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseKeypadLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenKeypadLock', OpenKeypadLock)