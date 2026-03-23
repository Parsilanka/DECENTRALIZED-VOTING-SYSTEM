import json
import os
from solcx import compile_standard, install_solc

def compile_contract():
    print("Installing solc...")
    install_solc("0.8.20")
    
    with open("./contracts/Voting.sol", "r") as file:
        voting_file = file.read()

    print("Compiling contract...")
    
    # We use remappings to map OpenZeppelin imports to our node_modules
    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {"Voting.sol": {"content": voting_file}},
            "settings": {
                "outputSelection": {
                    "*": {"*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]}
                },
                "remappings": [
                    "@openzeppelin/contracts/=./node_modules/@openzeppelin/contracts/"
                ]
            },
        },
        solc_version="0.8.20",
        allow_paths="."
    )

    os.makedirs("build", exist_ok=True)
    with open("build/compiled_code.json", "w") as file:
        json.dump(compiled_sol, file)

    # extract bytecode and abi
    bytecode = compiled_sol["contracts"]["Voting.sol"]["Voting"]["evm"]["bytecode"]["object"]
    abi = compiled_sol["contracts"]["Voting.sol"]["Voting"]["abi"]

    with open("build/Voting_abi.json", "w") as file:
        json.dump(abi, file)

    with open("build/Voting_bytecode.txt", "w") as file:
        file.write(bytecode)

    print("Contract compiled successfully. Output saved to build/")
    return abi, bytecode

if __name__ == "__main__":
    compile_contract()
