local isUIOpen = false
local currentCallback = nil
local currentHandleFailure = nil

-- Function to close hackers terminal UI
local function CloseHackersTerminal()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
end

-- Function to open hackers terminal UI
function OpenHackersTerminal(language, challenge, timeLimit, testCases, callback, handleFailure)
    if isUIOpen then return end
    
    isUIOpen = true
    currentCallback = callback
    currentHandleFailure = handleFailure
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openHackersTerminal',
        language = language,
        challenge = challenge,
        timeLimit = timeLimit,
        testCases = testCases
    })
end

-- Register NUI Callback for code validation
RegisterNUICallback('validateCode', function(data, cb)
    local success = false
    local error = nil

    if data.code then
        if data.language == 'lua' then
            success, error = ExecuteLuaCode(data.code, data.testCases)
        end
    else
        error = data.reason or "Unknown error"
    end

    if success then
        if currentCallback then currentCallback(true) end
        isUIOpen = false
        SetNuiFocus(false, false)
        currentCallback = nil
        currentHandleFailure = nil
    else
        if currentCallback then currentCallback(false) end
        if currentHandleFailure and data.reason then
            currentHandleFailure(error)
            -- Don't close UI; failure from handleFailure will do that
        end
    end

    cb({ success = success, error = error })
end)


-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseHackersTerminal()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenHackersTerminal', OpenHackersTerminal)

function ExecuteLuaCode(code, testCases)
    local fn, err = load(code)
    if not fn then
        return false, "Syntax error: " .. err
    end

    -- Execute the loaded chunk to get the user function
    local ok, userFunction = pcall(fn)
    if not ok then
        return false, "Runtime error while evaluating code: " .. tostring(userFunction)
    end

    if type(userFunction) ~= "function" then
        return false, "Your code must return a function"
    end

    -- Run each test case against the user function
    for _, test in ipairs(testCases) do
        local status, result = pcall(userFunction, table.unpack(test.input))
        if not status then
            return false, "Error during test execution: " .. tostring(result)
        end

        if result ~= test.expected then
            return false, string.format("Test failed: Expected %s, got %s", tostring(test.expected), tostring(result))
        end
    end

    return true, nil
end