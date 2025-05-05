local isUIOpen = false
local currentCallback = nil

-- Function to close precision ring lock UI
local function ClosePrecisionRingLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
end

-- Function to open precision ring lock UI
function OpenPrecisionRingLock(callback, speed, targetSize, requiredHits)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openPrecisionRingLock',
        speed = speed,
        targetSize = targetSize,
        requiredHits = requiredHits
    })
end

-- Register NUI Callback for precision ring completion
RegisterNUICallback('precisionRingComplete', function(data, cb)
    if currentCallback then
        currentCallback(data.success)
    end
    
    cb('ok')
end)
-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        ClosePrecisionRingLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenPrecisionRingLock', OpenPrecisionRingLock)