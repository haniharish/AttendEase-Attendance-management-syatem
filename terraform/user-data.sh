#!/bin/bash
# ==============================================================================
# AttendEase - EC2 Automated Cloud-Init Bootstrap Script
# ==============================================================================

set -e
exec > >(tee -a /var/log/user-data-bootstrap.log) 2>&1

echo "=================================================="
echo " Starting AttendEase EC2 Server Bootstrap: $(date)"
echo "=================================================="

# 1. Configure 2 GB Swapfile to prevent OOM during Docker builds
if [ ! -f /swapfile ]; then
    echo "[1/5] Configuring 2 GB Swapfile..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "vm.swappiness=10" >> /etc/sysctl.conf
    sysctl -p
    echo "Swapfile configured successfully."
fi

# 2. Update System Packages
echo "[2/5] Updating system apt repositories..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg git htop net-tools wget

# 3. Install Docker Engine & Docker Compose Plugin
echo "[3/5] Installing Docker Engine from official repository..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Configure User Permissions and Enable Docker Service
echo "[4/5] Enabling and starting Docker daemon..."
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# 5. Final Verification
echo "[5/5] Verifying Docker installation..."
docker --version
docker compose version

echo "=================================================="
echo " AttendEase EC2 Server Bootstrap Finished: $(date)"
echo "=================================================="
