# ==============================================================================
# AttendEase - EC2 Virtual Machine Instance
# ==============================================================================

# 1. Fetch latest official Ubuntu 24.04 LTS Noble Numbat AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# 2. Reference the verified SSH Key Pair
data "aws_key_pair" "existing_key" {
  key_name = var.key_name
}

# 3. Create AttendEase EC2 Server
resource "aws_instance" "attendease_server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = data.aws_key_pair.existing_key.key_name
  subnet_id                   = aws_subnet.attendease_public_subnet.id
  vpc_security_group_ids      = [aws_security_group.attendease_sg.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true

    tags = {
      Name = "${var.project_name}-root-volume"
    }
  }

  user_data = file("${path.module}/user-data.sh")

  tags = {
    Name = "${var.project_name}-production-server"
    Role = "Application-and-Monitoring"
  }
}
