#!/usr/bin/env bash
# Prepare FlowQ on Ubuntu inside Oracle VM VirtualBox.
# Tested on Ubuntu 22.04 and 24.04.
#
# From the project root inside the guest:
#   chmod +x scripts/setup-ubuntu.sh
#   ./scripts/setup-ubuntu.sh
#
# Flags:
#   --no-start          Install and migrate, then exit
#   --install-service   Also install a systemd unit that starts FlowQ on boot

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

START_APP=1
INSTALL_SERVICE=0

for arg in "$@"; do
  case "$arg" in
    --no-start) START_APP=0 ;;
    --install-service) INSTALL_SERVICE=1 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

if [[ "${EUID}" -eq 0 ]]; then
  echo "Run this script as your Ubuntu user, not as root. It will ask for sudo when needed." >&2
  exit 1
fi

if [[ ! -f /etc/os-release ]] || ! grep -qi ubuntu /etc/os-release; then
  echo "This script is for Ubuntu. Detected OS:" >&2
  cat /etc/os-release >&2 || true
  exit 1
fi

if findmnt -T "$ROOT" -no FSTYPE 2>/dev/null | grep -qx vboxsf; then
  echo "This project is on a VirtualBox shared folder." >&2
  echo "Copy it into the guest home directory first. Shared folders break Node file watching and native modules." >&2
  echo "Example: cp -a \"$ROOT\" \"\$HOME/virtualqueue\" && cd \"\$HOME/virtualqueue\" && ./scripts/setup-ubuntu.sh" >&2
  exit 1
fi

echo "==> Installing Ubuntu packages"
sudo apt-get update
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y universe
sudo apt-get update
sudo apt-get install -y ca-certificates curl git docker.io docker-compose-v2

if ! command -v node >/dev/null 2>&1 || ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 18 ? 0 : 1)'; then
  echo "==> Installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Node $(node -v), npm $(npm -v)"

echo "==> Starting Docker"
sudo systemctl enable --now docker

if [[ ! -f .env && -f .env.local ]]; then
  cp .env.local .env
elif [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
fi

if [[ ! -f .env.local && -f .env ]]; then
  cp .env .env.local
fi

if [[ ! -f .env || ! -f .env.local ]]; then
  echo "Missing .env.example. Cannot create environment files." >&2
  exit 1
fi

if grep -q 'your-secret-key-change-in-production' .env.local; then
  SECRET="$(openssl rand -base64 32)"
  # Use | as the delimiter because base64 secrets can contain /.
  sed -i "s|your-secret-key-change-in-production|${SECRET}|" .env .env.local
fi

echo "==> Installing npm dependencies inside the guest"
# Windows node_modules cannot be reused on Ubuntu (Prisma engine and native addons).
if [[ -d node_modules ]]; then
  rm -rf node_modules
fi
npm install

echo "==> Starting PostgreSQL"
sudo docker compose up -d

echo "==> Waiting for PostgreSQL"
ready=0
for _ in $(seq 1 30); do
  if sudo docker compose exec -T postgres pg_isready -U flowq -d flowq_db >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done

if [[ "$ready" -ne 1 ]]; then
  echo "PostgreSQL did not become ready. Check: sudo docker compose logs postgres" >&2
  exit 1
fi

echo "==> Applying Prisma schema"
npx prisma generate
npx prisma db push

USER_COUNT="$(sudo docker compose exec -T postgres psql -U flowq -d flowq_db -tAc 'SELECT COUNT(*) FROM users' 2>/dev/null || echo 0)"
USER_COUNT="$(echo "$USER_COUNT" | tr -d '[:space:]')"
if [[ "$USER_COUNT" == "0" || -z "$USER_COUNT" ]]; then
  echo "==> Seeding demo data"
  npm run db:seed
else
  echo "==> Database already has users; skipping seed"
fi

if command -v ufw >/dev/null 2>&1 && sudo ufw status | grep -q 'Status: active'; then
  echo "==> Opening port 3000 in ufw"
  sudo ufw allow 3000/tcp
fi

if [[ "$INSTALL_SERVICE" -eq 1 ]]; then
  echo "==> Installing systemd service"
  sudo tee /etc/systemd/system/flowq.service >/dev/null <<EOF
[Unit]
Description=FlowQ virtual queue
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=${USER}
WorkingDirectory=${ROOT}
Environment=BIND_HOST=0.0.0.0
Environment=HOSTNAME=localhost
Environment=PORT=3000
ExecStart=/usr/bin/npm run dev
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
  sudo systemctl daemon-reload
  sudo systemctl enable --now flowq.service
  START_APP=0
  echo "==> flowq.service is running. Logs: journalctl -u flowq -f"
fi

cat <<EOF

FlowQ is ready in this Ubuntu guest.

Oracle VM VirtualBox port forwarding (NAT adapter):
  Name: flowq
  Protocol: TCP
  Host IP: 127.0.0.1
  Host Port: 3000
  Guest Port: 3000

Then open http://localhost:3000 on the Windows host.

Demo login: owner@flowq.demo / password123

EOF

if [[ "$START_APP" -eq 1 ]]; then
  echo "==> Starting FlowQ on 0.0.0.0:3000"
  export BIND_HOST=0.0.0.0
  export HOSTNAME=localhost
  export PORT=3000
  exec npm run dev
fi
