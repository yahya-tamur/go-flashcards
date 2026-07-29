#!/bin/bash

if [[  $(basename "$0") != "bash" || $(basename "$PWD") != "go-flashcards" ]]; then
    echo ""
    echo "This script adds tab-autocomplete arguments to ./scripts/run.py ."
    echo "It needs to be sourced, not run, from the project root folder."
    echo "For example, by running the following command:"
    echo ""
    echo ". ./scripts/autocomplete_run_py.sh"
    echo ""
    
    if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
        return 0
    else
        exit 0
    fi
fi

_autocomplete_run_py() {
    local cur="${COMP_WORDS[COMP_CWORD]}"
    local args="$(sed -n 's/^commands =.*\[\([^]]*\)\].*/\1/p' ./scripts/run.py | sed 's/,/ /g' | sed 's/\"//g')"
    
    COMPREPLY=( $(compgen -W "${args}" -- "$cur") )
}

complete -F _autocomplete_run_py ./scripts/run.py
chmod +x ./scripts/run.py

echo "done!"