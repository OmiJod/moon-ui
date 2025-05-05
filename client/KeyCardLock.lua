local isUIOpen = false
local currentCallback = nil
local requiredItem = nil

-- Function to check if player has required item
local function hasRequiredItem()
    if not requiredItem then return false end

    local hasItem = false

    if GetResourceState('ox_inventory') == 'started' then
        hasItem = exports['ox_inventory']:GetItemCount(requiredItem) > 0
    elseif GetResourceState('qb-inventory') == 'started' then
        hasItem = exports['qb-inventory']:HasItem(requiredItem)
    elseif GetResourceState('qs-inventory') == 'started' then
        local item = exports['qs-inventory']:GetItemByName(requiredItem)
        hasItem = item and item.amount and item.amount > 0
    else
        print('No supported inventory system found.')
    end

    return hasItem
end

-- Function to close keycard lock UI
local function CloseKeycardLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
    requiredItem = nil
end

-- Function to open keycard lock UI
function OpenKeycardLock(item, callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    requiredItem = item
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openKeycardLock'
    })
end

-- Register NUI Callback for keycard completion
RegisterNUICallback('keycardComplete', function(_, cb)
    local hasItem = hasRequiredItem()
    
    SendNUIMessage({
        type = 'keycardResult',
        success = hasItem
    })
    
    if hasItem then
        if currentCallback then
            currentCallback(true)
        end
        isUIOpen = false
        SetNuiFocus(false, false)
        currentCallback = nil
        requiredItem = nil
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
        CloseKeycardLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenKeycardLock', OpenKeycardLock)