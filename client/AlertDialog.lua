local isUIOpen = false
local currentCallback = nil

-- Function to close alert dialog UI
local function CloseAlertDialog()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
end

-- Function to open alert dialog UI
function OpenAlertDialog(title, description, cancelText, submitText, callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openAlertDialog',
        title = title,
        description = description,
        cancelText = cancelText,
        submitText = submitText
    })

    -- Wait for response
    while isUIOpen do
        Wait(0)
    end

    return currentCallback
end

-- Register NUI Callback for dialog submission
RegisterNUICallback('dialogSubmit', function(data, cb)
    if currentCallback then
        currentCallback(true)
    end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    
    cb('ok')
end)

-- Register NUI Callback for dialog cancellation
RegisterNUICallback('dialogCancel', function(_, cb)
    if currentCallback then
        currentCallback(false)
    end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseAlertDialog()
       if currentCallback then
           currentCallback(false)
       end
    end
    cb('ok')
end)

-- Export the function
exports('OpenAlertDialog', OpenAlertDialog)
