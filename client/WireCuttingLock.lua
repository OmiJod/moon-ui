local isUIOpen = false
local currentCallback = nil

-- Function to close wire cutting lock UI
local function CloseWireCuttingLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
end

-- Function to open wire cutting lock UI
function OpenWireCuttingLock(callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openWireCuttingLock'
    })
end

-- Register NUI Callback for wire cutting
RegisterNUICallback('wireCuttingComplete', function(data, cb)
    if currentCallback then
        currentCallback(data.success)
    end
    
    if data.success then
        isUIOpen = false
        SetNuiFocus(false, false)
        currentCallback = nil
    end
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseWireCuttingLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenWireCuttingLock', OpenWireCuttingLock)