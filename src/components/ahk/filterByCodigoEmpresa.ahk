array := [{codigos}]

for key, val in array {
    Sleep, 2000
    Click,  400 167 2    
    Sleep, 2000
    Send, % val
    Sleep, 2000
    Click, 400 167
    Sleep, 2000
    Click, 400 263
    Send, {Control down}
    Send, a
    Sleep, 1000
    Send, c
    Send, {Control up}
    Sleep, 120000
    Run, C:\Users\William\Desktop\automacaoContmatic\init.bat
    Sleep, 2000
    Send, {Control down}
    Send, v
    Send, {Control up}
    Sleep, 20000
    Send, {Alt down}
    Send, {TAB}
    Send, {Alt up}
}

Sleep, 2000
Send, {Alt down}
Send, {f4}
Send, {Alt up}
Sleep, 2000
Send,  {Enter}