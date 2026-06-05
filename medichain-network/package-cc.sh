#!/bin/sh
export PATH=/usr/local/go/bin:/root/hyperledger-fabric/bin:/usr/local/bin:/usr/bin:/bin
export GOPATH=/root/go
export FABRIC_CFG_PATH=/root/hyperledger-fabric/config

BASE="/mnt/c/Users/dejen/OneDrive/Documents/Medichain App"
NET="$BASE/medichain-network"

for CC in patient doctor audit consent; do
  echo "--- Packaging medichain-$CC ---"
  peer lifecycle chaincode package "$NET/medichain-$CC.tar.gz" \
    --path "$BASE/backend/chaincode/$CC" \
    --lang golang \
    --label "medichain-${CC}_1.0" 2>&1
  if [ $? -eq 0 ]; then
    echo "OK: $CC packaged"
  else
    echo "FAIL: $CC"
  fi
done

echo "=== Done packaging ==="
ls -lh "$NET"/*.tar.gz 2>/dev/null
