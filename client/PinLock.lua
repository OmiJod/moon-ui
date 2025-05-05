local isUIOpen = false
local currentPin = nil
local currentCallback = nil

-- Function to check if PINs match
local function pinsMatch(pin1, pin2)
    return pin1 == pin2
end

-- Function to close pin lock UI
local function ClosePinLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentPin = nil
    currentCallback = nil
end

-- Function to open pin lock UI
function OpenPinLock(correctPin, callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentPin = correctPin
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openPinLock'
    })
end

-- Register NUI Callback for pin completion
RegisterNUICallback('pinComplete', function(data, cb)
    local userPin = data.pin
    local success = pinsMatch(userPin, currentPin)
    
    if success then
        if currentCallback then
            currentCallback(true)
        end
        isUIOpen = false
        SetNuiFocus(false, false)
        currentPin = nil
        currentCallback = nil
    else
        if currentCallback then
            currentCallback(false)
        end
    end
    
    SendNUIMessage({
        type = 'pinResult',
        success = success
    })
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        ClosePinLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenPinLock', OpenPinLock)