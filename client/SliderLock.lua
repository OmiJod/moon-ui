local isUIOpen = false
local currentCallback = nil

-- Function to close slider lock UI
local function CloseSliderLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
end

-- Function to open slider lock UI
function OpenSliderLock(sliders, timeLimit, callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openSliderLock',
        sliders = sliders,
        timeLimit = timeLimit
    })
end

-- Register NUI Callback for slider completion
RegisterNUICallback('sliderComplete', function(data, cb)
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
        CloseSliderLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenSliderLock', OpenSliderLock)