@echo off
echo Starting local test server...
start http://localhost:8000/responsive-test.html
python -m http.server 8000
