from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Client,
    ClientRequest,
    Task,
    TaskComment,
    TaskLog,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"


class ClientRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientRequest
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source="created_by.username")

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["created_by"]

    def create(self, validated_data):
        request = self.context["request"]

        validated_data["created_by"] = request.user

        return super().create(validated_data)


class Meta:
        model = Task
        fields = "__all__"


class TaskCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskComment
        fields = "__all__"


class TaskLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskLog
        fields = "__all__"
