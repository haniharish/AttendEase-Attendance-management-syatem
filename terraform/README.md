# AttendEase Infrastructure as Code (Terraform)

[![Live Deployment](https://img.shields.io/badge/Live_Application-http%3A%2F%2F13.233.172.243-00c853?style=for-the-badge&logo=google-chrome&logoColor=white)](http://13.233.172.243)
[![AWS](https://img.shields.io/badge/AWS-ap--south--1-FF9900?logo=amazon-aws&logoColor=white)](http://13.233.172.243)
[![Terraform](https://img.shields.io/badge/Terraform-v1.17-7B42BC?logo=terraform&logoColor=white)](https://terraform.io)

> ### 🌐 **Live Hosted Deployment**: [http://13.233.172.243](http://13.233.172.243)
> - **Public Application URL**: [http://13.233.172.243](http://13.233.172.243)
> - **Admin System Monitoring**: [http://13.233.172.243/admin/monitoring](http://13.233.172.243/admin/monitoring)
> - **Nagios Core Web UI**: [http://13.233.172.243:8080/nagios/](http://13.233.172.243:8080/nagios/)
> - **Monthly AWS Cost**: **$0.00 / month** (100% Free Tier Eligible in `ap-south-1`)

---

## 🏛️ Provisioned Resources

Starting from absolute zero, this Terraform module provisions:

1. **Virtual Private Cloud (VPC)**: Custom `10.0.0.0/16` network with DNS hostnames and DNS resolution enabled.
2. **Public Subnet**: `10.0.1.0/24` subnet mapped with public IPs in `ap-south-1a`.
3. **Internet Gateway (IGW)**: Attached to the VPC for two-way internet routing.
4. **Route Table**: Default route `0.0.0.0/0` forwarded to the Internet Gateway.
5. **Security Group**:
   - Port 22 (SSH): Restricted to your workstation IP (`admin_ip`).
   - Port 80 (HTTP): Open to public for Nginx React frontend.
   - Port 443 (HTTPS): Open to public.
   - Port 8080 (Nagios): Restricted to your workstation IP (`admin_ip`).
   - Internal ports (MongoDB 27017, Backend 6000) remain strictly private.
6. **EC2 Virtual Machine**:
   - Ubuntu 24.04 LTS (Noble Numbat)
   - Size: `t3.micro` (1 vCPU, 1 GB RAM + 2 GB Swap = ~3 GB effective memory)
   - 20 GB gp3 encrypted root volume
   - Automated bootstrap script (`user-data.sh`) installing Docker & Docker Compose.

---

## 🚀 Execution Workflow

### 1. Initialize Working Directory
```bash
terraform init
```

### 2. Format & Validate Code
```bash
terraform fmt -recursive
terraform validate
```

### 3. Generate Execution Plan
```bash
terraform plan
```

### 4. Apply Changes (Requires Explicit User Approval)
```bash
terraform apply
```

### 5. Inspect Outputs
```bash
terraform output
```

### 6. Connect to Your Server
```bash
ssh -i "~/.ssh/attendease-key.pem" ubuntu@<ec2_public_ip>
```

### 7. Clean Up (Teardown All Infrastructure)
```bash
terraform plan -destroy
terraform destroy
```
