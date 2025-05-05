local isUIOpen = false
local currentCallback = nil

-- Function to close swipe lock UI
local function CloseSwipeLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
end

-- Function to open swipe lock UI
function OpenSwipeLock(callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openSwipeLock'
    })
end

-- Register NUI Callback for swipe completion
RegisterNUICallback('swipeComplete', function(_, cb)
    if currentCallback then
        currentCallback(true)
    end
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseSwipeLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenSwipeLock', OpenSwipeLock)