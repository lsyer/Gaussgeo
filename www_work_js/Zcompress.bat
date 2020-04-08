call uglifyjs -m -r '$,m,c' main.js -o main.min.js
call uglifyjs -m -r '$,m,c' tools.js -o tools.min.js
ping -n 2 127.0.0.1 >nul
move /Y main.min.js ../www/js/
move /Y tools.min.js ../www/js/