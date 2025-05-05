local isUIOpen = false
local currentCallback = nil
local currentPassword = nil

-- Function to close image lock UI
local function CloseImageLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
    currentPassword = nil
end

-- Function to open image lock UI
function OpenImage(imageUrl, callback, password)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    currentPassword = password
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openImageLock',
        imageUrl = imageUrl,
        hasPassword = password ~= nil
    })
end

-- Register NUI Callback for image completion
RegisterNUICallback('imageComplete', function(data, cb)
    local success = false

    if currentPassword then
        success = data.password == currentPassword
    else
        success = true
    end

    SendNUIMessage({
        type = 'imageResult',
        success = success
    })

    if currentCallback then
        currentCallback(success)
    end

    -- Respond with a proper JSON object
    cb({ success = success })
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseImageLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenImage', OpenImage)
