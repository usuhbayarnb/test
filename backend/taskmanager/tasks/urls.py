from django.urls import path
from .views import (
    api_root,
    TaskListCreateView,
    TaskDetailView,
    TaskCommentListCreateView,
    TaskLogListView,
)

urlpatterns = [
    path("", api_root, name="api-root"),
    path("tasks/", TaskListCreateView.as_view()),
    path("tasks/<int:pk>/", TaskDetailView.as_view()),
    path("tasks/<int:task_id>/comments/", TaskCommentListCreateView.as_view()),
    path("tasks/<int:task_id>/logs/", TaskLogListView.as_view()),
]
