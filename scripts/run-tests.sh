#!/bin/bash

# Check if xvfb-run is available
if command -v xvfb-run &> /dev/null; then
    echo "Running tests with xvfb-run..."
    xvfb-run -a node ./out/test/runTest.js
else
    echo "xvfb-run not found, running tests directly..."
    node ./out/test/runTest.js
fi