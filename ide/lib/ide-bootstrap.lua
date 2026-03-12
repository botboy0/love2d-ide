-- ide-bootstrap.lua — Injected by the IDE to capture print() output.
-- Overrides print() to write to a log file that the IDE server tails.

local _IDE_LOG = os.getenv("IDE_LOG_PATH")
if not _IDE_LOG then return end

local _original_print = print
local _log_file = nil

local function _ide_open_log()
  if not _log_file then
    _log_file = io.open(_IDE_LOG, "a")
  end
  return _log_file
end

function print(...)
  local args = {...}
  local parts = {}
  for i = 1, select('#', ...) do
    parts[i] = tostring(args[i])
  end
  local line = table.concat(parts, "\t")

  local f = _ide_open_log()
  if f then
    f:write(line .. "\n")
    f:flush()
  end

  _original_print(...)
end

-- Also capture love.errorhandler output
local _original_error = error
function _ide_capture_error(msg)
  local f = _ide_open_log()
  if f then
    f:write("ERROR: " .. tostring(msg) .. "\n")
    f:flush()
  end
end

-- Hook into love.errorhandler if available
local _love_boot = love.boot
if _love_boot then
  -- Wrap after boot to catch runtime errors
  local ok, traceback_func = pcall(function() return debug.traceback end)
end
