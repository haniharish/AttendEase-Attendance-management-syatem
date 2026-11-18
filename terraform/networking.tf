# ==============================================================================
# AttendEase - VPC and Networking Infrastructure
# ==============================================================================

# 1. Dedicated Virtual Private Cloud
resource "aws_vpc" "attendease_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# 2. Public Subnet
resource "aws_subnet" "attendease_public_subnet" {
  vpc_id                  = aws_vpc.attendease_vpc.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet"
    Type = "Public"
  }
}

# 3. Internet Gateway
resource "aws_internet_gateway" "attendease_igw" {
  vpc_id = aws_vpc.attendease_vpc.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# 4. Public Route Table with Default Internet Egress
resource "aws_route_table" "attendease_public_rt" {
  vpc_id = aws_vpc.attendease_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.attendease_igw.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# 5. Route Table Association
resource "aws_route_table_association" "attendease_public_rta" {
  subnet_id      = aws_subnet.attendease_public_subnet.id
  route_table_id = aws_route_table.attendease_public_rt.id
}
