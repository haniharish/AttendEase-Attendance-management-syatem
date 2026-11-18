# ==============================================================================
# AttendEase - Security Group Configuration (Least Privilege)
# ==============================================================================

resource "aws_security_group" "attendease_sg" {
  name        = "${var.project_name}-app-sg"
  description = "AttendEase Production Security Group - Least Privilege Ingress"
  vpc_id      = aws_vpc.attendease_vpc.id

  # 1. SSH Management Access - Strictly restricted to Admin Workstation IP
  ingress {
    description = "SSH administrative access (Restricted to Admin IP)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip]
  }

  # 2. Public Web Traffic - Frontend Nginx Production Web Server
  ingress {
    description = "Public HTTP web traffic to AttendEase Frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # 3. Secure HTTPS Traffic (For SSL/TLS termination)
  ingress {
    description = "Public HTTPS web traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # 4. Nagios Core Web Interface - Strictly restricted to Admin Workstation IP
  ingress {
    description = "Nagios Core Web Interface (Restricted to Admin IP)"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip]
  }

  # Outbound Egress - Allow outbound calls for apt updates, docker pulls, and git clone
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-app-sg"
  }
}
