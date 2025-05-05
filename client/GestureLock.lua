local isUIOpen = false
local currentGesture = nil
local currentCallback = nil

-- Function to normalize gesture points to a 0-1 scale
local function normalizeGesture(gesture)
    local minX, maxX = math.huge, -math.huge
    local minY, maxY = math.huge, -math.huge
    
    -- Find bounds
    for _, point in ipairs(gesture) do
        minX = math.min(minX, point.x)
        maxX = math.max(maxX, point.x)
        minY = math.min(minY, point.y)
        maxY = math.max(maxY, point.y)
    end
    
    local width = maxX - minX
    local height = maxY - minY
    
    -- Normalize points
    local normalized = {}
    for _, point in ipairs(gesture) do
        table.insert(normalized, {
            x = (point.x - minX) / width,
            y = (point.y - minY) / height
        })
    end
    
    return normalized
end

-- Function to resample gesture to have consistent number of points
local function resampleGesture(gesture, numPoints)
    local resampled = {}
    local pathLength = 0
    local distances = {}
    
    -- Calculate total path length and segment distances
    for i = 2, #gesture do
        local dx = gesture[i].x - gesture[i-1].x
        local dy = gesture[i].y - gesture[i-1].y
        local distance = math.sqrt(dx * dx + dy * dy)
        pathLength = pathLength + distance
        table.insert(distances, distance)
    end
    
    local stepSize = pathLength / (numPoints - 1)
    table.insert(resampled, gesture[1])
    
    local currentDistance = 0
    local currentPoint = 1
    
    for i = 2, numPoints do
        local targetDistance = (i - 1) * stepSize
        
        while currentDistance + distances[currentPoint] < targetDistance and currentPoint < #distances do
            currentDistance = currentDistance + distances[currentPoint]
            currentPoint = currentPoint + 1
        end
        
        local segmentProgress = (targetDistance - currentDistance) / distances[currentPoint]
        local newPoint = {
            x = gesture[currentPoint].x + segmentProgress * (gesture[currentPoint + 1].x - gesture[currentPoint].x),
            y = gesture[currentPoint].y + segmentProgress * (gesture[currentPoint + 1].y - gesture[currentPoint].y)
        }
        table.insert(resampled, newPoint)
    end
    
    return resampled
end

-- Function to check if gestures match with improved comparison
local function gesturesMatch(gesture1, gesture2, tolerance)
    -- Normalize both gestures to same scale
    local normalized1 = normalizeGesture(gesture1)
    local normalized2 = normalizeGesture(gesture2)
    
    -- Resample both gestures to have 32 points
    local resampled1 = resampleGesture(normalized1, 32)
    local resampled2 = resampleGesture(normalized2, 32)
    
    -- Compare resampled points
    local totalError = 0
    for i = 1, #resampled1 do
        local dx = resampled1[i].x - resampled2[i].x
        local dy = resampled1[i].y - resampled2[i].y
        local pointError = math.sqrt(dx * dx + dy * dy)
        totalError = totalError + pointError
    end
    
    -- Calculate average error and compare to tolerance
    local averageError = totalError / #resampled1
    return averageError <= tolerance
end

-- Function to close gesture lock UI
local function CloseGestureLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentGesture = nil
    currentCallback = nil
end

-- Function to open gesture lock UI
function OpenGestureLock(correctGesture, callback)
    if isUIOpen then return end
    
    isUIOpen = true
    currentGesture = correctGesture
    currentCallback = callback
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openGestureLock'
    })
end

-- Register NUI Callback for gesture completion
RegisterNUICallback('gestureComplete', function(data, cb)
    local userGesture = data.gesture
    local success = gesturesMatch(userGesture, currentGesture, 0.25) -- 0.25 normalized tolerance
    
    if success then
        if currentCallback then
            currentCallback(true)
        end
        isUIOpen = false
        SetNuiFocus(false, false)
        currentGesture = nil
        currentCallback = nil
    else
        if currentCallback then
            currentCallback(false)
        end
    end
    
    SendNUIMessage({
        type = 'gestureResult',
        success = success
    })
    
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseGestureLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenGestureLock', OpenGestureLock)