local isUIOpen = false
local currentCallback = nil

-- Function to close input form UI
local function CloseInputForm()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
end

-- Function to open input form UI
function Input(fields, title, callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    SetNuiFocus(true, true)

    SendNUIMessage({
        type = 'openInputForm',
        fields = fields,
        title = title or 'Input Form'
    })

    -- Wait for response
    while isUIOpen do
        Wait(0)
    end

    return currentCallback
end

-- Register NUI Callback for form submission
RegisterNUICallback('inputComplete', function(data, cb)
    if currentCallback then
        currentCallback = data.fields
    end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseInputForm()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('Input', Input)
