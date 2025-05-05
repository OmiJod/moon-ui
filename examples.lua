-- Pattern Lock
RegisterCommand('testpattern', function()
    local correctPattern = {1,4,7,8,9} -- Diagonal pattern from top-left to bottom-right
    exports['moon-ui']:OpenPatternLock(correctPattern, function(success)
        if success then
            print('Pattern correct! Access granted.')
            -- Add your logic here for successful pattern entry
        else
            print('Pattern incorrect! Access denied.')
            -- Add your logic here for failed pattern entry
        end
    end)
end)

-- PIN Lock
RegisterCommand('testpin', function()
    local correctPin = "123456" -- 6-digit PIN code
    exports['moon-ui']:OpenPinLock(correctPin, function(success)
        if success then
            print('PIN correct! Access granted.')
            -- Add your logic here for successful PIN entry
        else
            print('PIN incorrect! Access denied.')
            -- Add your logic here for failed PIN entry
        end
    end)
end)

-- Keypad Lock
RegisterCommand('testkeypad', function()
    local correctCode = "A1B2C3" -- Alphanumeric code
    exports['moon-ui']:OpenKeypadLock(correctCode, function(success)
        if success then
            print('Code correct! Access granted.')
            -- Add your logic here for successful code entry
        else
            print('Code incorrect! Access denied.')
            -- Add your logic here for failed code entry
        end
    end)
end)

-- Color Sequence Lock
RegisterCommand('testcolor', function()
    local correctSequence = {"red", "blue", "green", "yellow"} -- Color sequence
    exports['moon-ui']:OpenColorSequenceLock(correctSequence, function(success)
        if success then
            print('Color sequence correct! Access granted.')
            -- Add your logic here for successful sequence entry
        else
            print('Color sequence incorrect! Access denied.')
            -- Add your logic here for failed sequence entry
        end
    end)
end)

-- Gesture Lock
RegisterCommand('testgesture', function()
    local correctGesture = {
        { x = 100, y = 100 },
        { x = 200, y = 200 },
        { x = 300, y = 100 }
    } -- "V" shaped gesture
    exports['moon-ui']:OpenGestureLock(correctGesture, function(success)
        if success then
            print('Gesture correct! Access granted.')
            -- Add your logic here for successful gesture entry
        else
            print('Gesture incorrect! Access denied.')
            -- Add your logic here for failed gesture entry
        end
    end)
end)

-- Swipe Lock
RegisterCommand('testswipe', function()
    exports['moon-ui']:OpenSwipeLock(function(success)
        if success then
            print('Swipe successful! Access granted.')
            -- Add your logic here for successful swipe
        else
            print('Swipe cancelled.')
            -- Add your logic here for cancelled swipe
        end
    end)
end)

-- Key Card Swipe Lock
RegisterCommand('testkeycard', function()
    exports['moon-ui']:OpenKeycardLock('id_card', function(success) -- Suports Ox_inv qb_inv and Qs_inv
        if success then
            print('Keycard found and swipe accepted!')
            -- Add your logic here for successful swipe
        else
            print('No keycard found or swipe denied!')
            -- Add your logic here for failed swipe
        end
    end)    
end)

-- Math Puzzle Lock
RegisterCommand('testmath', function()
    exports['moon-ui']:OpenMathPuzzleLock(function(success)
        if success then
            print('Math puzzle solved! Access granted.')
            -- Add your logic here for successful puzzle completion
        else
            print('Math puzzle failed! Access denied.')
            -- Add your logic here for failed puzzle attempt
        end
    end)
end)

-- Anagram Lock
RegisterCommand('testanagram', function()
    -- Difficulty can be 'easy', 'medium', or 'hard'
    exports['moon-ui']:OpenAnagramLock('medium', function(success)
        if success then
            print('Anagram solved! Access granted.')
        else
            print('Anagram incorrect! Access denied.')
        end
    end)
end)

-- Maze Navigation Lock
RegisterCommand('testmaze', function()
    exports['moon-ui']:OpenMazeNavigationLock(function(success)
        if success then
            print('Maze completed! Access granted.')
        else
            print('Maze failed! Access denied.')
        end
    end)
end)

-- Wire Cutting Lock
RegisterCommand('testwire', function()
    exports['moon-ui']:OpenWireCuttingLock(function(success)
        if success then
            print('Correct wire cut! Access granted.')
        else
            print('Wrong wire cut! Access denied.')
        end
    end)
end)

-- Safe Cracking Lock
RegisterCommand('testsafe', function()
    local correctCombination = {25, 50, 75} -- Three-number combination
    exports['moon-ui']:OpenSafeCrackingLock(correctCombination, function(success)
        if success then
            print('Safe cracked! Access granted.')
        else
            print('Wrong combination! Access denied.')
        end
    end)
end)

-- Precision Ring Lock
RegisterCommand('testprecision', function()
    exports['moon-ui']:OpenPrecisionRingLock(function(success)
        if success then
            print('Precision lock completed! Access granted.')
        else
            print('Precision lock failed! Access denied.')
        end
    end, 2, 20, 2) -- speed, targetSize, requiredHits
end)

-- Display Image
RegisterCommand('testimage', function()
    local imageUrl = "https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg" -- Example Pexels image
    exports['moon-ui']:OpenImage(imageUrl, function(success)
        if success then
            
            print('Image opened successfully.')
        else
            print('Failed to open image.')
        end
    end, "1234") -- Pass nil instead of "1234" for no password protection
end)

RegisterCommand('testinput', function()
    local fields = {
        {
            id = 'name',
            label = 'Full Name',
            type = 'text',
            icon = 'user',
            placeholder = 'Enter your full name',
            required = true
        },
        {
            id = 'email',
            label = 'Email Address',
            type = 'email',
            icon = 'mail',
            placeholder = 'your@email.com',
            required = true,
            pattern = '[a-z0-9._%-]@[a-z0-9.-]\\.[a-z]{2,}$'
        },
        {
            id = 'password',
            label = 'Password',
            type = 'password',
            icon = 'lock',
            placeholder = 'Enter your password',
            required = true
        },
        {
            id = 'phone',
            label = 'Phone Number',
            type = 'tel',
            icon = 'phone',
            placeholder = '(123) 456-7890',
            pattern = '\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}'
        },
        {
            id = 'birthdate',
            label = 'Date of Birth',
            type = 'date',
            icon = 'calendar'
        },
        {
            id = 'time',
            label = 'Preferred Time',
            type = 'time',
            icon = 'clock'
        },
        {
            id = 'website',
            label = 'Website',
            type = 'url',
            icon = 'globe',
            placeholder = 'https://example.com'
        },
        {
            id = 'age',
            label = 'Age',
            type = 'number',
            icon = 'hash',
            min = 18,
            max = 100
        },
        {
            id = 'price',
            label = 'Price',
            type = 'number',
            icon = 'dollar-sign',
            step = 0.01,
            min = 0
        },
        {
            id = 'bio',
            label = 'Biography',
            type = 'textarea',
            icon = 'file-text',
            placeholder = 'Tell us about yourself'
        }
    }

    local input = exports['moon-ui']:Input(fields, "Registration Form") -- title parameter
    
    if input then
        for k, v in pairs(input) do
            print(k, v)
        end
    else
        print('Input Form Cancelled')
    end
end)

-- Alert Dialog
RegisterCommand('testalert', function()
    exports['moon-ui']:OpenAlertDialog(
        "Confirmation", -- Title
        "Are you sure you want to proceed?", -- Description
        "Cancel", -- Cancel Text
        "Confirm", -- Confirm Button Text
        function(success)
            if success then
                print('Dialog confirmed!')
            else
                print('Dialog cancelled!')
            end
        end
    )
end)

-- Context menu with submenu
RegisterCommand('vehiclemenu', function()
    exports['moon-ui']:CreateMenu({
        {
            id = "vehicle_menu",
            header = "Vehicle Controls",
            text = "Basic vehicle controls",
            icon = "fas fa-car",
            subMenu = {
                {
                    id = "engine_toggle",
                    header = "Toggle Engine",
                    icon = "fas fa-engine-warning",
                    action = function()
                        local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
                        local isOn = GetIsVehicleEngineRunning(vehicle)
                        SetVehicleEngineOn(vehicle, not isOn, false, true)
                    end
                },
                {
                    id = "vehicle_doors",
                    header = "Open Hood",
                    icon = "fas fa-car-burst",
                    action = function()
                        local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
                        SetVehicleDoorOpen(vehicle, 4, false, false)
                    end
                }
            }
        },
        {
            id = "vehicle_extras",
            header = "Print Something",
            text = "Just for testing",
            icon = "fas fa-terminal",
            color = "green",
            action = function()
                print("This is a custom Lua action!")
            end
        },
        {
            id = "vehicle_extras2",
            header = "Vehicle Extras",
            text = "Additional vehicle options",
            icon = "fas fa-plus",
            color = "green",
            event = "moon-ui:vehicleExtras",
            args = {"args1", "args2", "args3"} -- RegisterNetEvent("moon-ui:vehicleExtras", function(args1, args2, args3)
        }
    }, "Vehicle Management", "Control and customize your vehicle")
end)

-- Hackers Terminal Lock (check hackerterminalexamples.md for more)
RegisterCommand('testhacker', function()
    local challenge = [[
    Write a function that checks if a number is even or odd.
    The function should:
    - Take a single number parameter
    - Return "even" for even numbers
    - Return "odd" for odd numbers
    - Handle negative numbers as well

    Example:
    isEvenOrOdd(4) should return "even"
    isEvenOrOdd(3) should return "odd"
    isEvenOrOdd(-2) should return "even"
    isEvenOrOdd(-3) should return "odd"
    ]]

    local testCases = {
        { input = {4}, expected = "even" },
        { input = {3}, expected = "odd" },
        { input = {-2}, expected = "even" },
        { input = {-3}, expected = "odd" }
    }

    -- Expected Response
    --[[
        return function(n)
            if n % 2 == 0 then
                return "even"
            else
                return "odd"
            end
        end
    ]]

    exports['moon-ui']:OpenHackersTerminal(
        'lua', -- language
        challenge, -- challenge description
        10, -- time limit in seconds (5 minutes)
        testCases, -- test cases
        function(success)
            if success then
                -- Handle successful hack
                print('Hack successful!')
            end
        end,
        function(message)
            -- When time Is Up
            print('Time Is Up')
        end
    )
end)

-- ProgressBar
RegisterCommand('testlockpick', function()
    -- Progress bar with animation and prop
    exports['moon-ui']:OpenProgressBar({
        duration = 10000, -- 10 seconds
        label = 'Picking Lock',
        useWhileDead = false,
        allowRagdoll = false,
        style = 'minimal', -- radial / minimal / bar
        canCancel = false,
        disable = {
            move = false,
            car = true,
            combat = true
        },
        anim = {
            dict = 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
            clip = 'machinic_loop_mechandplayer'
        },
        prop = {
            model = 'prop_tool_screwdvr02',
            bone = 57005,
            pos = { x = 0.14, y = 0.0, z = -0.01 },
            rot = { x = 0.0, y = 90.0, z = 0.0 }
        }
    }, function(success)
        if success then
            print('Lock picked successfully!')
        else
            print('Lock picking failed!')
        end
    end)
end)

-- Slider Lock
RegisterCommand('testsliders', function()
    local sliders = {
        {
            id = "voltage",
            label = "Power Supply Voltage",
            target = 75,  -- Target value (75%)
            tolerance = 2 -- Must be within 2% of target
        },
        {
            id = "frequency",
            label = "Signal Frequency",
            target = 45,
            tolerance = 3
        },
        {
            id = "amplitude",
            label = "Wave Amplitude",
            target = 60,
            tolerance = 1
        }
    }

    exports['moon-ui']:OpenSliderLock(sliders, 20, function(success)
        if success then
            print('Calibration successful!')
        else
            print('Calibration failed!')
        end
    end)
end)
