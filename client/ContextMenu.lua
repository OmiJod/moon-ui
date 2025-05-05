local isUIOpen = false
local currentCallback = nil
local contextActions = {} -- map of id => action function


-- Function to close context menu UI
local function CloseContextMenu()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
end

-- Function to create and open context menu UI
function CreateMenu(items, title, description)
    if isUIOpen then return end

    -- Clear existing actions
    contextActions = {}

    -- Store local actions and clean up items for NUI
    local function sanitizeItems(items)
        local sanitized = {}
        for _, item in ipairs(items) do
            local id = item.id
            if item.action then
                contextActions[id] = item.action
                item.action = nil -- remove before sending to NUI
            end
            if item.subMenu then
                item.subMenu = sanitizeItems(item.subMenu)
            end
            table.insert(sanitized, item)
        end
        return sanitized
    end

    local cleanItems = sanitizeItems(items)

    isUIOpen = true
    SetNuiFocus(true, true)

    SendNUIMessage({
        type = 'openContextMenu',
        items = cleanItems,
        title = title or "Menu Options",
        description = description or "Select an option below"
    })
end


-- Register event handlers for menu items
RegisterNUICallback('menuEvent', function(data, cb)
    local id = data.id
  
    -- Execute local action if available
    if contextActions[id] then
      contextActions[id]()
    elseif data.event then
      if data.server then
        TriggerServerEvent(data.event, table.unpack(data.args or {}))
      else
        TriggerEvent(data.event, table.unpack(data.args or {}))
      end
    end
  
    isUIOpen = false
    SetNuiFocus(false, false)
    cb('ok')
end)  


-- Register NUI Callback for closing UI
RegisterNUICallback('closeUI', function(_, cb)
    if isUIOpen then
        CloseContextMenu()
    end
    cb('ok')
end)

-- Export the function
exports('CreateMenu', CreateMenu)