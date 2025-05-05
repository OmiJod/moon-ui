local isUIOpen = false
local currentCallback = nil
local currentProgress = nil
local activeProps = {}

-- Function to close progress bar UI
local function CloseProgressBar()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
    currentProgress = nil
end

-- Function to stop animations and remove props
local function StopAnimationAndRemoveProps()
    local ped = PlayerPedId()

    -- Stop animation
    ClearPedTasks(ped)

    -- Delete all active props
    for _, prop in ipairs(activeProps) do
        if DoesEntityExist(prop) then
            DeleteEntity(prop)
        end
    end

    activeProps = {} -- Clear the table
end

-- Function to check if progress should be interrupted
local function shouldInterruptProgress(data)
    if not data.useWhileDead and IsEntityDead(PlayerPedId()) then return true end
    if not data.allowRagdoll and IsPedRagdoll(PlayerPedId()) then return true end
    if not data.allowCuffed and IsPedCuffed(PlayerPedId()) then return true end
    if not data.allowFalling and IsPedFalling(PlayerPedId()) then return true end
    if not data.allowSwimming and IsPedSwimming(PlayerPedId()) then return true end
    return false
end

-- Function to handle animations and props
local function handleAnimations(data)
    local ped = PlayerPedId()
    local anim = data.anim

    if anim then
        if anim.dict then
            RequestAnimDict(anim.dict)
            while not HasAnimDictLoaded(anim.dict) do Wait(0) end

            TaskPlayAnim(ped, anim.dict, anim.clip, 
                anim.blendIn or 3.0, 
                anim.blendOut or 1.0, 
                anim.duration or -1, 
                anim.flag or 49, 
                anim.playbackRate or 0,
                anim.lockX or false, 
                anim.lockY or false, 
                anim.lockZ or false
            )
            RemoveAnimDict(anim.dict)
        elseif data.scenario then
            TaskStartScenarioInPlace(ped, data.scenario, 0, data.playEnter == nil or data.playEnter)
        end
    end

    -- Handle props
    if data.prop then
        if type(data.prop) == 'table' and data.prop.model then
            -- Single prop
            CreateProp(ped, data.prop)
        elseif type(data.prop) == 'table' then
            -- Multiple props
            for _, propData in ipairs(data.prop) do
                CreateProp(ped, propData)
            end
        end
    end
end

-- Function to create and attach props
function CreateProp(ped, propData)
    local model = GetHashKey(propData.model)
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    local coords = GetEntityCoords(ped)
    local prop = CreateObject(model, coords.x, coords.y, coords.z, false, true, false)

    AttachEntityToEntity(prop, ped, 
        GetPedBoneIndex(ped, propData.bone or 60309),
        propData.pos.x, propData.pos.y, propData.pos.z,
        propData.rot.x, propData.rot.y, propData.rot.z,
        true, true, false, true, propData.rotOrder or 0, true
    )

    SetModelAsNoLongerNeeded(model)
    table.insert(activeProps, prop)
    return prop
end

-- Function to handle disabled controls
local function handleDisabledControls(disable)
    if not disable then return end

    if disable.mouse then
        DisableControlAction(0, 1, true) -- LookLeftRight
        DisableControlAction(0, 2, true) -- LookUpDown
        DisableControlAction(0, 106, true) -- VehicleMouseControlOverride
    end

    if disable.move then
        DisableControlAction(0, 30, true) -- MoveLeftRight
        DisableControlAction(0, 31, true) -- MoveUpDown
        DisableControlAction(0, 36, true) -- Duck
        DisableControlAction(0, 21, true) -- Sprint
    end

    if disable.car then
        DisableControlAction(0, 63, true) -- VehicleMoveLeftRight
        DisableControlAction(0, 64, true) -- VehicleMoveUpDown
        DisableControlAction(0, 71, true) -- VehicleAccelerate
        DisableControlAction(0, 72, true) -- VehicleBrake
        DisableControlAction(0, 75, true) -- VehicleExit
    end

    if disable.combat then
        DisableControlAction(0, 24, true) -- Attack
        DisableControlAction(0, 25, true) -- Aim
        DisablePlayerFiring(PlayerId(), true)
    end
end

-- Function to open progress bar UI
function OpenProgressBar(data, callback)
    if isUIOpen or shouldInterruptProgress(data) then return false end
    
    isUIOpen = true
    currentCallback = callback
    currentProgress = data

    -- Start animations and props
    handleAnimations(data)
    
    SendNUIMessage({
        type = 'openProgressBar',
        duration = data.duration,
        label = data.label,
        useWhileDead = data.useWhileDead,
        allowRagdoll = data.allowRagdoll,
        allowSwimming = data.allowSwimming,
        allowCuffed = data.allowCuffed,
        allowFalling = data.allowFalling,
        style = data.style,
        canCancel = data.canCancel,
        anim = data.anim,
        scenario = data.scenario,
        playEnter = data.playEnter,
        prop = data.prop,
        disable = data.disable
    })

    -- Main loop for handling disabled controls and interruptions
    CreateThread(function()
        while currentProgress do
            if shouldInterruptProgress(currentProgress) then
                StopAnimationAndRemoveProps()
                if currentCallback then
                    currentCallback(false)
                end
                CloseProgressBar()
                break
            end

            handleDisabledControls(currentProgress.disable)
            Wait(0)
        end
    end)

    return true
end

-- Register NUI Callback for progress completion
RegisterNUICallback('progressComplete', function(data, cb)
    if currentCallback then
        currentCallback(data.success)
    end

    StopAnimationAndRemoveProps()
    CloseProgressBar()
    cb('ok')
end)

-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        StopAnimationAndRemoveProps()
        CloseProgressBar()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Register command to cancel progress
RegisterCommand('cancelprogress', function()
    if currentProgress and currentProgress.canCancel then
        StopAnimationAndRemoveProps()
        CloseProgressBar()
        if currentCallback then
            currentCallback(false)
        end
    end
end)

-- Register key mapping for cancel
RegisterKeyMapping('cancelprogress', 'Cancel Progress', 'keyboard', 'x')

-- Export the function
exports('OpenProgressBar', OpenProgressBar)
