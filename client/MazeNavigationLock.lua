local isUIOpen = false
local currentCallback = nil

-- Function to close maze navigation lock UI
local function CloseMazeNavigationLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
end

-- Function to open maze navigation lock UI
function OpenMazeNavigationLock(callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openMazeNavigationLock'
    })
end

-- Register NUI Callback for maze completion
RegisterNUICallback('mazeComplete', function(data, cb)
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
        CloseMazeNavigationLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenMazeNavigationLock', OpenMazeNavigationLock)