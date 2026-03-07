#!/bin/bash

# --- COLORS ---
RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
CYAN='\033[1;36m'
RESET='\033[0m'

# --- BANNER (Sabse Pehle Dikhega) ---
banner() {
    clear
    echo -e "${CYAN}"
    echo "███╗   ███╗ ██████╗ ██████╗  ██████╗██╗      ██████╗ ██╗   ██╗██████╗ "
    echo "████╗ ████║██╔═══██╗██╔══██╗██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗"
    echo "██╔████╔██║██║   ██║██████╔╝██║     ██║     ██║   ██║██║   ██║██║  ██║"
    echo "██║╚██╔╝██║██║   ██║██╔══██╗██║     ██║     ██║   ██║██║   ██║██║  ██║"
    echo "██║ ╚═╝ ██║╚██████╔╝██████╔╝╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝"
    echo "╚═╝     ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ "
    echo -e "${YELLOW}      .:. Ultimate Local AI Website Builder for Termux .:. ${RESET}"
    echo -e "${RED}      .:.       Created by @Koudik53       .:. ${RESET}"
    echo -e "${BLUE}==============================================================${RESET}"
    echo ""
}

# --- MENU FIRST (Ab ye pehle aayega) ---
banner
echo -e "${WHITE}[?] Select AI Model for MobCloud:${RESET}"
echo -e "${BLUE}--------------------------------------------------${RESET}"
echo -e "${GREEN}[01]${RESET} Qwen 2.5 (0.5B)    ${RED}[~390 MB]${RESET} ${YELLOW}(Fastest / Low Storage)${RESET}"
echo -e "${GREEN}[02]${RESET} Qwen 2.5 Coder     ${RED}[~1.0 GB]${RESET} ${YELLOW}(Best for Coding)${RESET}"
echo -e "${GREEN}[03]${RESET} DeepSeek Coder     ${RED}[~800 MB]${RESET} ${YELLOW}(Good Logic)${RESET}"
echo -e "${BLUE}--------------------------------------------------${RESET}"
echo -n -e "${CYAN}Select Option (1-3): ${RESET}"
read choice

case $choice in
    1) MODEL_NAME="qwen2.5:0.5b" ;;
    2) MODEL_NAME="qwen2.5-coder:1.5b" ;;
    3) MODEL_NAME="deepseek-coder:1.3b" ;;
    *) MODEL_NAME="qwen2.5:0.5b" ;;
esac

# Save Config
echo "{ \"model\": \"$MODEL_NAME\" }" > config.json

# --- INSTALLATION (Ab Shuru Hoga) ---
echo ""
echo -e "${YELLOW}[!] Setup Starting... Please wait.${RESET}"
echo -e "${YELLOW}[!] (Don't panic if text scrolls, it is updating Termux)${RESET}"
sleep 2

# 1. Update Termux
echo -e "${BLUE}[*] Updating System Packages...${RESET}"
pkg update -y > /dev/null 2>&1
pkg upgrade -y -o Dpkg::Options::="--force-confnew" > /dev/null 2>&1
echo -e "${GREEN}[✔] System Updated.${RESET}"

# 2. Install Dependencies
echo -e "${BLUE}[*] Installing Node.js & Git...${RESET}"
pkg install nodejs git python -y > /dev/null 2>&1
echo -e "${GREEN}[✔] Node.js Installed.${RESET}"

# 3. Install Ollama
echo -e "${BLUE}[*] Checking Ollama AI...${RESET}"
if ! command -v ollama &> /dev/null; then
    echo -e "${RED}[!] Installing Ollama (This takes time)...${RESET}"
    pkg install ollama -y > /dev/null 2>&1
fi
echo -e "${GREEN}[✔] Ollama Ready.${RESET}"

# 4. Start Server & Pull Model
echo -e "${BLUE}[*] Starting AI Engine...${RESET}"
if ! pgrep -x "ollama" > /dev/null; then
    ollama serve > /dev/null 2>&1 &
    sleep 5
fi

echo -e "${CYAN}[*] Downloading AI Model: $MODEL_NAME${RESET}"
echo -e "${CYAN}    (Please keep screen on, downloading ~400MB-1GB)${RESET}"
ollama pull $MODEL_NAME

# 5. NPM Install
if [ -f "package.json" ]; then
    echo -e "${BLUE}[*] Setting up Backend...${RESET}"
    npm install --silent
fi

# --- FINAL LAUNCH ---
banner
echo -e "${GREEN}==============================================${RESET}"
echo -e "${GREEN}   ✔ SETUP COMPLETE! ${RESET}"
echo -e "${GREEN}==============================================${RESET}"
echo -e "${YELLOW}   Starting Server...${RESET}"
echo -e "${CYAN}   >> Open: http://localhost:3000${RESET}"
echo ""

npm start
