array := [{codigos}]

for key, val in array {
    Sleep, 4000
    Click,  400 167 2    
    Sleep, 4000
    Send, % val
    Sleep, 4000
    Click, 400 167
    Sleep, 4000
    Click, 400 263
    Send, {Control down}
    Send, a
    Sleep, 1000
    Send, c
    Send, {Control up}
    Sleep, 60000
    Send, {LWin down}
    Send, r
    Send, {LWin up}
    Sleep, 3000
    Send, cmd
    Send, {Enter}
    Sleep, 4000
    Send, cd {pathEntrada}
    Send, {Enter}
    Sleep, 2000
    Send, start .
    Send, {Enter}
    Sleep, 3000
    Send, {Control down}
    Send, v
    Sleep, 20000
    Send, {Control up}
    Send, {Alt down}
    Send, {f4}
    Send, {Alt up}
    Send, {Alt down}
    Send, {f4}
    Send, {Alt up}
}