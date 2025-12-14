from django.contrib import admin
from .models import (
    Department,
    Task,
    Client,
    ClientRequest,
    TaskComment,
    TaskLog,
)

admin.site.register(Department)
admin.site.register(Task)
admin.site.register(Client)
admin.site.register(ClientRequest)
admin.site.register(TaskComment)
admin.site.register(TaskLog)
