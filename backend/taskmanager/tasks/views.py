from rest_framework.permissions import SAFE_METHODS
from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .permissions import IsAdminOrManager


from .models import Client, ClientRequest, Task, TaskComment, TaskLog
from .serializers import (
    ClientSerializer,
    ClientRequestSerializer,
    TaskSerializer,
    TaskCommentSerializer,
    TaskLogSerializer,
)

# =======================
# API ROOT
# =======================
@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API root endpoint with available resources"""
    return Response({
        'message': 'Task Management API',
        'version': '1.0',
        'endpoints': {
            'tasks': request.build_absolute_uri('/api/tasks/'),
            'token': request.build_absolute_uri('/api/token/'),
            'token_refresh': request.build_absolute_uri('/api/token/refresh/'),
        }
    })


# =======================
# CUSTOM TOKEN VIEW
# =======================
@api_view(['POST'])
@permission_classes([AllowAny])
def custom_token_obtain_pair(request):
    """Custom token view that accepts username or email"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Try authenticate with username first, then with email
    user = authenticate(username=username, password=password)
    
    if not user:
        # If username fails, try email
        from django.contrib.auth.models import User
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    
    if user is None:
        return Response(
            {'detail': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    })


# =======================
# CLIENT
# =======================
class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrManager()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]


# =======================
# CLIENT REQUEST
# =======================
class ClientRequestListCreateView(generics.ListCreateAPIView):
    queryset = ClientRequest.objects.all()
    serializer_class = ClientRequestSerializer
    permission_classes = [IsAuthenticated]


class ClientRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ClientRequest.objects.all()
    serializer_class = ClientRequestSerializer
    permission_classes = [IsAuthenticated]


# =======================
# TASK
# =======================
class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrManager()]

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]


# =======================
# TASK COMMENTS
# =======================
class TaskCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaskComment.objects.filter(task_id=self.kwargs["task_id"])

    def perform_create(self, serializer):
        task = get_object_or_404(Task, id=self.kwargs["task_id"])
        serializer.save(task=task, user=self.request.user)


# =======================
# TASK LOGS
# =======================
class TaskLogListView(generics.ListAPIView):
    serializer_class = TaskLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaskLog.objects.filter(task_id=self.kwargs["task_id"])
