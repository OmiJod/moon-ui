local isUIOpen = false
local currentCallback = nil
local currentWord = nil
local currentDifficulty = nil

-- Word lists by difficulty
local words = {
    easy = {
        { scrambled = "ATCE", original = "CAFE" },
        { scrambled = "TRAC", original = "CART" },
        { scrambled = "TOPS", original = "SPOT" },
        { scrambled = "TEAS", original = "SEAT" },
        { scrambled = "LOOP", original = "POOL" }
    },
    medium = {
        { scrambled = "GRANEO", original = "ORANGE" },
        { scrambled = "RLISVE", original = "SILVER" },
        { scrambled = "DGAREN", original = "GARDEN" },
        { scrambled = "OEPNCI", original = "POLICE" },
        { scrambled = "RLPEPU", original = "PURPLE" }
    },
    hard = {
        { scrambled = "RLBPOEM", original = "PROBLEM" },
        { scrambled = "TCPIRUE", original = "PICTURE" },
        { scrambled = "RLBATET", original = "BATTLE" },
        { scrambled = "DGAONR", original = "DRAGON" },
        { scrambled = "YSMRTE", original = "MYSTERY" }
    }
}

-- Function to get a random word for the given difficulty
local function getRandomWord(difficulty)
    local wordList = words[difficulty]
    if not wordList then return nil end
    
    local index = math.random(1, #wordList)
    return wordList[index]
end

-- Function to close anagram lock UI
local function CloseAnagramLock()
    if not isUIOpen then return end
    
    isUIOpen = false
    SetNuiFocus(false, false)
    currentCallback = nil
    currentWord = nil
    currentDifficulty = nil
end

-- Function to open anagram lock UI
function OpenAnagramLock(difficulty, callback)
    if isUIOpen then return end
    
    currentWord = getRandomWord(difficulty or 'medium')
    if not currentWord then return end
    
    isUIOpen = true
    currentCallback = callback
    currentDifficulty = difficulty
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openAnagramLock',
        scrambledWord = currentWord.scrambled,
        difficulty = difficulty or 'medium'
    })
end

-- Register NUI Callback for anagram completion
RegisterNUICallback('anagramComplete', function(data, cb)
    local userAnswer = data.answer:upper()
    local success = userAnswer == currentWord.original
    
    SendNUIMessage({
        type = 'anagramResult',
        success = success
    })
    
    if success then
        if currentCallback then
            currentCallback(true)
        end
        isUIOpen = false
        SetNuiFocus(false, false)
        currentCallback = nil
        currentWord = nil
        currentDifficulty = nil
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
        CloseAnagramLock()
        if currentCallback then
            currentCallback(false)
        end
    end
    cb('ok')
end)

-- Export the function
exports('OpenAnagramLock', OpenAnagramLock)