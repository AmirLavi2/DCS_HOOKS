net.log('Saved Games/DCS/Scripts/Hooks/udp.lua is running ...')

------------------------------------------------------------------------
-- UTILS
------------------------------------------------------------------------

function table.val_to_str(v)
    if "string" == type(v) then
        v = string.gsub(v, "\n", "\\n")
        if string.match(string.gsub(v, '[^\'"]', ""), '^"+$') then
        return "'" .. v .. "'"
        end
        return '"' .. string.gsub(v, '"', '\\"') .. '"'
    else
        return "table" == type(v) and table.tostring(v) or tostring(v)
    end
end
  
function table.key_to_str(k)
    if "string" == type(k) and string.match(k, "^[_%a][_%a%d]*$") then
        return k
    else
        return "[" .. table.val_to_str(k) .. "]"
    end
end

function table.tostring(tbl)
    local result, done = {}, {}
    for k, v in ipairs(tbl) do
        table.insert(result, table.val_to_str(v))
        done[k] = true
    end
    for k, v in pairs(tbl) do
        if not done[k] then
        table.insert(result, table.key_to_str(k) .. "=" .. table.val_to_str(v))
        end
    end
    return "{" .. table.concat(result, ",") .. "}"
end
------------------------------------------------------------------------
-- UTILS ENDOF
------------------------------------------------------------------------

package.path = package.path .. ";.\\LuaSocket\\?.lua" .. ";.\\Scripts\\?.lua"
package.cpath = package.cpath .. ";.\\LuaSocket\\?.dll"
local socket = require("socket")

local ip = "127.0.0.1"
local port = "12345"
local udp_connection
local udp_data = {} 
local udp_callbacks = {}

function udp_callbacks.onSimulationStart()
    udp_connection = socket.udp()
    udp_connection:settimeout(0)
    udp_connection:setpeername(ip, port)
end

local base = _G
local worldObjects

net.log('udp.lua -> base.Export:'..table.tostring(base.Export))
net.log('udp.lua -> DCS:'..table.tostring(DCS))

local lTime = DCS.getModelTime()

function udp_callbacks.onSimulationFrame()
    if lTime + 5 < DCS.getModelTime() then
        lTime = DCS.getModelTime()

        worldObjects = base.Export.LoGetWorldObjects() -- table of all mission objects

        if type(worldObjects) == 'table' then
            for k,v in pairs(worldObjects) do -- one object table
                if type(v) == 'table' then
                    udp_data = "{k" .. k .. " = "..table.tostring(v).."}" -- 
                    -- net.log('udp.lua -> udp_data:'..udp_data)
                    udp_connection:send(udp_data)
                end
            end
            udp_connection:send('objects_end')

        end
    end
end

-- DCS.setUserCallbacks(udp_callbacks)