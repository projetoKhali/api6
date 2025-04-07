#!/bin/sh
lua hydra_bootstrap.lua
exec tail -f /dev/null
