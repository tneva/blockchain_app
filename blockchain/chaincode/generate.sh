#!/bin/bash

set -x

# Install new chaincode to the peer through the fabric CLI
install() 
{
    go build -o chaincode
    docker exec cli peer chaincode install -p github.com/mychaincode -n mycc -v $VERSION
}

# Instantiate new chaincode to the peer through the fabric CLI
instantiate() 
{
    docker exec cli peer chaincode instantiate -n mycc -v $VERSION -c '{"Args":[""]}' -C mychannel
}

# Upgrade a new version chaincode to the peer through the fabric CLI
upgrade() 
{
    docker exec cli peer chaincode upgrade -n mycc -v $VERSION -c '{"Args":[""]}' -C mychannel
}

cd src

export GOPATH=$GOPATH:$(PWD)/src

if test $# -eq 0;
then
  echo "Arguments must be passed"
  exit
fi

while test $# -gt 0; do
    case "$1" in 
        -c) shift 
            export COMMAND=$1 
            ;;
        -v) shift 
            export VERSION=$1 
            ;;
        *)  echo "-c or -v must be passed"
            exit 
    esac
    shift
done

if [ -n "$COMMAND" ];
then
  if [ "$COMMAND" == "install" ];
  then
      install
  elif [ "$COMMAND" == "instantiate" ];
  then
      instantiate
  elif [ "$COMMAND" == "upgrade" ];
  then
      upgrade
  else
      echo "Command not found"
  fi
fi