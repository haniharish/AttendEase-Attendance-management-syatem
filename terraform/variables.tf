# ==============================================================================
# AttendEase - Input Variables
# ==============================================================================

variable "aws_region" {
  type        = string
  description = "Target AWS Region for deployment"
  default     = "ap-south-1"
}

variable "project_name" {
  type        = string
  description = "Project name prefix for tagging and resource naming"
  default     = "attendease"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g. production, staging, dev)"
  default     = "production"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the dedicated AttendEase Virtual Private Cloud"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  type        = string
  description = "CIDR block for the public subnet"
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  type        = string
  description = "Availability zone for public subnet and EC2 deployment"
  default     = "ap-south-1a"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type (t3.micro: 1 vCPU, 1 GB RAM - 100% Free Tier covered)"
  default     = "t3.micro"
}

variable "volume_size" {
  type        = number
  description = "Root EBS storage volume size in GB"
  default     = 20
}

variable "key_name" {
  type        = string
  description = "Name of the existing AWS EC2 SSH Key Pair"
  default     = "attendease-key"
}

variable "admin_ip" {
  type        = string
  description = "Admin workstation public IPv4 CIDR for restricted SSH and Nagios access"
  default     = "49.156.96.20/32"
}

variable "repo_url" {
  type        = string
  description = "GitHub repository URL containing AttendEase codebase"
  default     = "https://github.com/haniharish/AttendEase-Attendance-management-syatem.git"
}
