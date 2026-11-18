#!/bin/bash
# ==============================================================================
# check_docker.sh - AttendEase Docker Container Health Monitor for Nagios Core
# ==============================================================================
if [ "$1" = "-c" ] || [ "$1" = "--container" ]; then
    CONTAINER_NAME="$2"
else
    CONTAINER_NAME="$1"
fi

if [ -z "$CONTAINER_NAME" ]; then
    echo "UNKNOWN - Missing container name argument"
    exit 3
fi

SOCKET="/var/run/docker.sock"

# 1. Primary check: Query Docker Engine API via unix socket if available
if [ -S "$SOCKET" ]; then
    RESPONSE=$(curl -s --max-time 3 --unix-socket "$SOCKET" "http://localhost/containers/${CONTAINER_NAME}/json" 2>/dev/null)
    
    if [ -n "$RESPONSE" ] && ! echo "$RESPONSE" | grep -q "No such container"; then
        STATUS=$(echo "$RESPONSE" | grep -o '"Status":"[^"]*"' | head -n 1 | cut -d'"' -f4)
        HEALTH=$(echo "$RESPONSE" | grep -o '"Health":{"Status":"[^"]*"' | head -n 1 | cut -d'"' -f6)
        
        if [ "$STATUS" = "running" ]; then
            if [ -n "$HEALTH" ]; then
                if [ "$HEALTH" = "healthy" ]; then
                    echo "OK - Container ${CONTAINER_NAME} is running (healthy) | status=1"
                    exit 0
                elif [ "$HEALTH" = "starting" ]; then
                    echo "WARNING - Container ${CONTAINER_NAME} healthcheck starting | status=1"
                    exit 1
                else
                    echo "CRITICAL - Container ${CONTAINER_NAME} healthcheck failed (health: ${HEALTH}) | status=0"
                    exit 2
                fi
            else
                echo "OK - Container ${CONTAINER_NAME} is running | status=1"
                exit 0
            fi
        elif [ "$STATUS" = "restarting" ] || [ "$STATUS" = "paused" ]; then
            echo "WARNING - Container ${CONTAINER_NAME} is in state: ${STATUS} | status=0"
            exit 1
        else
            echo "CRITICAL - Container ${CONTAINER_NAME} is stopped (state: ${STATUS}) | status=0"
            exit 2
        fi
    fi
fi

# 2. Secondary fallback: Network probe if socket is restricted on host OS
case "$CONTAINER_NAME" in
    *frontend*)
        if /opt/nagios/libexec/check_tcp -H frontend -p 80 -w 2 -c 5 >/dev/null 2>&1; then
            echo "OK - Container ${CONTAINER_NAME} reachable via network | status=1"
            exit 0
        else
            echo "CRITICAL - Container ${CONTAINER_NAME} unreachable on port 80 | status=0"
            exit 2
        fi
        ;;
    *backend*)
        if /opt/nagios/libexec/check_http -H backend -p 6000 -u /api/health -w 2 -c 5 >/dev/null 2>&1; then
            echo "OK - Container ${CONTAINER_NAME} reachable via network | status=1"
            exit 0
        else
            echo "CRITICAL - Container ${CONTAINER_NAME} unreachable on port 6000 | status=0"
            exit 2
        fi
        ;;
    *mongodb*)
        if /opt/nagios/libexec/check_tcp -H mongodb -p 27017 -w 2 -c 5 >/dev/null 2>&1; then
            echo "OK - Container ${CONTAINER_NAME} reachable via network | status=1"
            exit 0
        else
            echo "CRITICAL - Container ${CONTAINER_NAME} unreachable on port 27017 | status=0"
            exit 2
        fi
        ;;
    *)
        echo "UNKNOWN - Cannot determine status for container ${CONTAINER_NAME}"
        exit 3
        ;;
esac
