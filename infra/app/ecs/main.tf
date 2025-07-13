# ALB
resource "aws_security_group" "alb" {
  name   = "${var.app_name}-alb-sg"
  vpc_id = var.vpc_id
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_lb" "this" {
  name               = "${var.app_name}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids
}
resource "aws_lb_target_group" "this" {
  name        = "${var.app_name}-lb-tg"
  vpc_id      = var.vpc_id
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  health_check {
    port                = 80
    path                = "/docs"
    interval            = 30
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
    matcher             = 200
  }
}
resource "aws_lb_listener" "http" {
  port              = "80"
  protocol          = "HTTP"
  load_balancer_arn = aws_lb.this.arn
  default_action {
    target_group_arn = aws_lb_target_group.this.arn
    type             = "forward"
  }
  depends_on = [aws_lb_target_group.this]
}

# SSL Certificate for ELB domain
# resource "aws_acm_certificate" "this" {
#   domain_name       = aws_lb.this.dns_name
#   validation_method = "DNS"
  
#   lifecycle {
#     create_before_destroy = true
#   }
# }

# HTTPS Listener
resource "aws_lb_listener" "https" {
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:eu-central-1:230342277603:certificate/2d939088-b78e-4074-8af2-f98e7cdd456c"
  load_balancer_arn = aws_lb.this.arn
  default_action {
    target_group_arn = aws_lb_target_group.this.arn
    type             = "forward"
  }
  depends_on = [aws_lb_target_group.this]
}

resource "aws_lb_listener_rule" "this" {
  listener_arn = aws_lb_listener.http.arn
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
  condition {
    path_pattern {
      values = ["*"]
    }
  }
}

# HTTPS Listener Rule
resource "aws_lb_listener_rule" "https" {
  listener_arn = aws_lb_listener.https.arn
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
  condition {
    path_pattern {
      values = ["*"]
    }
  }
}

# IAM 
data "aws_iam_policy_document" "ecs_assume_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}
resource "aws_iam_role" "ecs_execution_role" {
  name               = "${var.app_name}-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_policy.json
}
resource "aws_iam_policy" "ecs_execution_policy" {
  name = "${var.app_name}-ecs-execution-role-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect : "Allow",
        Action : [
          "ecr:*",
          "ecs:*",
          "elasticloadbalancing:*",
          "cloudwatch:*",
          "logs:*"
        ],
        Resource : "*"
      }
    ]
  })
}
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ecs_execution_policy.arn
}

# ECS 
resource "aws_cloudwatch_log_group" "ecs" {
  name = "/aws/ecs/${var.app_name}/cluster"
}
resource "aws_ecs_task_definition" "api" {
  family                   = "${var.app_name}-api-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_execution_role.arn
  cpu                      = 8192
  memory                   = 16384
  container_definitions = jsonencode([
    {
      name    = "${var.app_name}-api-container"
      image   = "${var.image}"
      command = ["fastapi", "run", "--port", "80", "index.py"]
      portMappings = [
        {
          hostPort      = 80
          containerPort = 80
          protocol      = "tcp"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-stream-prefix = "ecs"
          awslogs-region        = var.region
        }
      }
    }
  ])
}

# Cluster 
resource "aws_ecs_cluster" "this" {
  name = "${var.app_name}-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Security Group and Service
resource "aws_security_group" "ecs" {
  name   = "${var.app_name}-ecs-sg"
  vpc_id = var.vpc_id
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
}
# resource "aws_ecs_service" "api" {
#   name            = "${var.app_name}-ecs-service"
#   cluster         = aws_ecs_cluster.this.name
#   launch_type     = "FARGATE"
#   desired_count   = length(var.private_subnet_ids)
#   task_definition = aws_ecs_task_definition.api.arn
#   network_configuration {
#     subnets         = var.private_subnet_ids
#     security_groups = [aws_security_group.ecs.id]
#   }
#   load_balancer {
#     target_group_arn = aws_lb_target_group.this.arn
#     container_name   = "${var.app_name}-api-container"
#     container_port   = "80"
#   }
#   lifecycle {
#     ignore_changes = [
#       desired_count,
#     ]
#   }
#   depends_on = [aws_lb_listener_rule.this]
# }

