# ==============================================================================
# AttendEase - Terraform Outputs
# ==============================================================================

output "aws_region" {
  description = "Deployed AWS Region"
  value       = var.aws_region
}

output "vpc_id" {
  description = "ID of the dedicated AttendEase VPC"
  value       = aws_vpc.attendease_vpc.id
}

output "subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.attendease_public_subnet.id
}

output "security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.attendease_sg.id
}

output "ec2_instance_id" {
  description = "ID of the AttendEase EC2 instance"
  value       = aws_instance.attendease_server.id
}

output "ec2_public_ip" {
  description = "Public IPv4 address of the AttendEase server"
  value       = aws_instance.attendease_server.public_ip
}

output "ec2_private_ip" {
  description = "Private IP address inside the VPC"
  value       = aws_instance.attendease_server.private_ip
}

output "ssh_connection_command" {
  description = "Command to securely connect to the EC2 instance via SSH"
  value       = "ssh -i \"~/.ssh/${var.key_name}.pem\" ubuntu@${aws_instance.attendease_server.public_ip}"
}

output "application_url" {
  description = "Public HTTP URL for the AttendEase application"
  value       = "http://${aws_instance.attendease_server.public_ip}"
}

output "nagios_monitoring_url" {
  description = "URL for the native Nagios Core Web GUI (Restricted to Admin IP)"
  value       = "http://${aws_instance.attendease_server.public_ip}:8080/nagios/"
}
